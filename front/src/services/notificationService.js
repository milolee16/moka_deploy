// src/services/notificationService.js
import axios from 'axios';

// API base URL
const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8080'
    : 'http://localhost:8080';

export const notificationService = {
  // 알림 목록 조회
  async getNotifications() {
    try {
      // 올바른 키로 토큰 조회: "accessToken"
      const token =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');

      console.log('JWT Token:', token ? '토큰 있음' : '토큰 없음');

      if (!token) {
        throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
      }

      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('인증 실패: 로그인이 필요합니다.');
      }
      console.error('알림 조회 실패:', error);
      throw error;
    }
  },

  // 읽지 않은 알림 개수 조회
  async getUnreadCount() {
    try {
      // 올바른 키로 토큰 조회: "accessToken"
      const token =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');

      if (!token) {
        console.warn('토큰이 없어서 읽지 않은 알림 개수를 조회할 수 없습니다.');
        return 0;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.count;
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error);
      return 0;
    }
  },

  // 특정 알림을 읽음 처리
  async markAsRead(notificationId) {
    try {
      const token =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');

      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      await axios.patch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      throw error;
    }
  },

  // 모든 알림을 읽음 처리
  async markAllAsRead() {
    try {
      const token =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');

      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      await axios.patch(
        `${API_BASE_URL}/api/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
      throw error;
    }
  },
};
