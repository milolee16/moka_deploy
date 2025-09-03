// src/services/notificationService.js
import axios from 'axios';

// API base URL (다른 컴포넌트와 동일한 설정)
const API_BASE_URL =
    import.meta.env.MODE === "development" ? "http://192.168.2.23:8080" : "http://localhost:8080";

export const notificationService = {
    // 알림 목록 조회
    async getNotifications() {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('알림 조회 실패:', error);
            throw error;
        }
    },

    // 읽지 않은 알림 개수 조회
    async getUnreadCount() {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/notifications/unread-count`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.count;
        } catch (error) {
            console.error('읽지 않은 알림 개수 조회 실패:', error);
            return 0;
        }
    },

    // 특정 알림을 읽음 처리
    async markAsRead(notificationId) {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
            throw error;
        }
    },

    // 모든 알림을 읽음 처리
    async markAllAsRead() {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/api/notifications/read-all`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('모든 알림 읽음 처리 실패:', error);
            throw error;
        }
    }
};