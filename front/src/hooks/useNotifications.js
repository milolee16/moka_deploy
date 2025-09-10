// front/src/hooks/useNotifications.js (WebSocket 연동 버전)
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from './useWebSocket';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { subscribe } = useWebSocket();

  // 알림 목록 조회
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err);
      console.error('알림 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 읽지 않은 알림 개수 조회
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('읽지 않은 알림 개수 조회 실패:', err);
    }
  }, [user]);

  // 특정 알림을 읽음 처리
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);

      // 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // WebSocket을 통해 읽지 않은 개수가 업데이트되므로 별도 호출 불필요
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  };

  // 모든 알림을 읽음 처리
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      // 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );

      // WebSocket을 통해 읽지 않은 개수가 0으로 업데이트됨
    } catch (err) {
      console.error('모든 알림 읽음 처리 실패:', err);
    }
  };

  // 모든 알림 삭제
  const deleteAllNotifications = async () => {
    try {
      await notificationService.deleteAllNotifications();

      // 로컬 상태 업데이트
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('모든 알림 삭제 실패:', err);
      throw err; // 컴포넌트에서 에러 처리할 수 있도록
    }
  };

  // 읽은 알림만 삭제
  const deleteReadNotifications = async () => {
    try {
      await notificationService.deleteReadNotifications();

      // 로컬 상태 업데이트 - 읽지 않은 알림만 남김
      setNotifications((prev) =>
        prev.filter((notification) => !notification.isRead)
      );
    } catch (err) {
      console.error('읽은 알림 삭제 실패:', err);
      throw err;
    }
  };

  // 특정 알림 삭제
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);

      // 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );

      // 삭제된 알림이 읽지 않은 상태였다면 읽지 않은 개수도 업데이트
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('알림 삭제 실패:', err);
      throw err;
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  // WebSocket 이벤트 구독
  useEffect(() => {
    if (!user) return;

    // 새로운 알림 수신
    const unsubscribeNotification = subscribe(
      'notification',
      (newNotification) => {
        console.log('새 알림 수신:', newNotification);

        setNotifications((prev) => {
          // 중복 알림 방지
          const exists = prev.some((n) => n.id === newNotification.id);
          if (exists) return prev;

          return [newNotification, ...prev];
        });

        // 브라우저 알림 표시 (권한이 있는 경우)
        if (Notification.permission === 'granted') {
          new Notification('새 알림', {
            body: newNotification.message,
            icon: '/favicon.ico',
            tag: `notification-${newNotification.id}`,
          });
        }
      }
    );

    // 읽지 않은 개수 업데이트
    const unsubscribeUnreadCount = subscribe('unreadCount', (count) => {
      console.log('읽지 않은 알림 개수 업데이트:', count);
      setUnreadCount(count);
    });

    // 연결 상태 변화
    const unsubscribeConnection = subscribe('connection', (status) => {
      console.log('WebSocket 연결 상태:', status);

      if (status.type === 'CONNECTED') {
        // 연결되면 최신 데이터 다시 로드
        fetchNotifications();
        fetchUnreadCount();
      }
    });

    return () => {
      unsubscribeNotification();
      unsubscribeUnreadCount();
      unsubscribeConnection();
    };
  }, [user, subscribe, fetchNotifications, fetchUnreadCount]);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if (user && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('브라우저 알림 권한:', permission);
      });
    }
  }, [user]);

  // 페이지 포커스 시 알림 업데이트 (WebSocket 보조용)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchUnreadCount();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchUnreadCount();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
    deleteReadNotifications,
    deleteNotification,
  };
};
