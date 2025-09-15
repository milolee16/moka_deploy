// front/src/hooks/useNotifications.js (완전 수정된 버전 - 예약 완료 이벤트 리스너 포함)
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

      // 즉시 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // 로컬에서도 unreadCount 즉시 업데이트 (WebSocket 응답 대기하지 않음)
      setUnreadCount((prev) => Math.max(0, prev - 1));

      console.log('알림 읽음 처리 완료:', notificationId);
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
      // 에러 발생 시 원래 상태로 복원
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  // 모든 알림을 읽음 처리
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      // 즉시 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);

      console.log('모든 알림 읽음 처리 완료');
    } catch (err) {
      console.error('모든 알림 읽음 처리 실패:', err);
      // 에러 발생 시 원래 상태로 복원
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  // 모든 알림 삭제
  const deleteAllNotifications = async () => {
    try {
      await notificationService.deleteAllNotifications();

      // 즉시 로컬 상태 업데이트
      setNotifications([]);
      setUnreadCount(0);

      console.log('모든 알림 삭제 완료');
    } catch (err) {
      console.error('모든 알림 삭제 실패:', err);
      throw err; // 컴포넌트에서 에러 처리할 수 있도록
    }
  };

  // 읽은 알림만 삭제
  const deleteReadNotifications = async () => {
    try {
      await notificationService.deleteReadNotifications();

      // 즉시 로컬 상태 업데이트 - 읽지 않은 알림만 남김
      setNotifications((prev) => {
        const unreadNotifications = prev.filter(
          (notification) => !notification.isRead
        );
        // unreadCount는 변경되지 않음 (읽지 않은 알림만 남기므로)
        return unreadNotifications;
      });

      console.log('읽은 알림 삭제 완료');
    } catch (err) {
      console.error('읽은 알림 삭제 실패:', err);
      throw err;
    }
  };

  // 특정 알림 삭제
  const deleteNotification = async (notificationId) => {
    try {
      // 삭제할 알림의 읽음 상태 확인
      const targetNotification = notifications.find(
        (n) => n.id === notificationId
      );
      const wasUnread = targetNotification && !targetNotification.isRead;

      await notificationService.deleteNotification(notificationId);

      // 즉시 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );

      // 읽지 않은 알림이었다면 unreadCount도 감소
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      console.log('알림 삭제 완료:', notificationId);
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
    } else {
      // 로그아웃 시 상태 초기화
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  // WebSocket 이벤트 구독
  useEffect(() => {
    if (!user) return;

    console.log('WebSocket 이벤트 구독 시작');

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

        // 새 알림이므로 unreadCount 증가
        setUnreadCount((prev) => prev + 1);

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

    // 읽지 않은 개수 업데이트 (백엔드에서 전송)
    const unsubscribeUnreadCount = subscribe('unreadCount', (count) => {
      console.log('WebSocket으로부터 읽지 않은 알림 개수 업데이트:', count);
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
      console.log('WebSocket 이벤트 구독 해제');
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
        console.log('페이지 포커스, 알림 상태 동기화');
        fetchUnreadCount();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log('페이지 가시성 변경, 알림 상태 동기화');
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

  // 🔥 예약 완료 시 알림 새로고침 이벤트 리스너
  useEffect(() => {
    if (!user) return;

    const handleReservationCreated = (event) => {
      console.log('🎉 예약 생성 완료 감지:', event.detail);

      // 2초 후 알림 새로고침 (백엔드에서 알림 생성 완료 대기)
      setTimeout(() => {
        console.log('🔄 예약 완료로 인한 알림 새로고침');
        fetchNotifications();
        fetchUnreadCount();
      }, 2000);
    };

    const handleRefreshNotifications = (event) => {
      console.log('🔄 알림 새로고침 이벤트 수신:', event.detail);

      // 즉시 새로고침
      fetchNotifications();
      fetchUnreadCount();
    };

    // 이벤트 리스너 등록
    window.addEventListener('reservationCreated', handleReservationCreated);
    window.addEventListener('refreshNotifications', handleRefreshNotifications);

    // 정리
    return () => {
      window.removeEventListener(
        'reservationCreated',
        handleReservationCreated
      );
      window.removeEventListener(
        'refreshNotifications',
        handleRefreshNotifications
      );
    };
  }, [user, fetchNotifications, fetchUnreadCount]);

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
