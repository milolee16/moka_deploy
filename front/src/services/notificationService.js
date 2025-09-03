// src/services/notificationService.js
import apiClient from '../utils/apiClient';

export const notificationService = {
  // 알림 목록 조회
  async getNotifications() {
    try {
      const response = await apiClient.get('/api/notifications');
      return response.data;
    } catch (error) {
      console.error('알림 조회 실패:', error);
      throw error;
    }
  },

  // 읽지 않은 알림 개수 조회
  async getUnreadCount() {
    try {
      const response = await apiClient.get('/api/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error);
      return 0;
    }
  },

  // 특정 알림을 읽음 처리
  async markAsRead(notificationId) {
    try {
      await apiClient.patch(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      throw error;
    }
  },

  // 모든 알림을 읽음 처리
  async markAllAsRead() {
    try {
      await apiClient.patch('/api/notifications/read-all');
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
      throw error;
    }
  },
};
