// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

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
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );

            // 읽지 않은 개수 재조회
            fetchUnreadCount();
        } catch (err) {
            console.error('알림 읽음 처리 실패:', err);
        }
    };

    // 모든 알림을 읽음 처리
    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();

            // 로컬 상태 업데이트
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, isRead: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('모든 알림 읽음 처리 실패:', err);
        }
    };

    // 초기 데이터 로드
    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [user, fetchNotifications, fetchUnreadCount]);

    // 주기적으로 읽지 않은 알림 개수 업데이트 (5분마다)
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 5 * 60 * 1000); // 5분

        return () => clearInterval(interval);
    }, [user, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        refetch: fetchNotifications,
        markAsRead,
        markAllAsRead
    };
};