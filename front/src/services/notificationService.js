// src/services/notificationService.js
const API_BASE_URL = 'http://localhost:8080/api';

class NotificationService {
  /**
   * 사용자의 알림 목록 조회
   */
  async getNotifications() {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('알림 목록 조회에 실패했습니다.');
    }

    return await response.json();
  }

  /**
   * 읽지 않은 알림 개수 조회
   */
  async getUnreadCount() {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('읽지 않은 알림 개수 조회에 실패했습니다.');
    }

    const data = await response.json();
    return data.unreadCount;
  }

  /**
   * 특정 알림을 읽음 처리
   */
  async markAsRead(notificationId) {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('알림 읽음 처리에 실패했습니다.');
    }

    return await response.text();
  }

  /**
   * 모든 알림을 읽음 처리
   */
  async markAllAsRead() {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('모든 알림 읽음 처리에 실패했습니다.');
    }

    return await response.text();
  }

  /**
   * 알림 타입별 아이콘 반환
   */
  getNotificationIcon(type) {
    const iconMap = {
      RESERVATION_CONFIRMED: '✅',
      RESERVATION_CANCELLED: '❌',
      REMINDER_24H: '⏰',
      REMINDER_1H: '🔔',
      RETURN_REMINDER: '🚗',
      PAYMENT_COMPLETED: '💳',
      LICENSE_APPROVED: '🎉',
      LICENSE_REJECTED: '❌',
    };

    return iconMap[type] || '📢';
  }

  /**
   * 알림 타입별 색상 반환
   */
  getNotificationColor(type) {
    const colorMap = {
      RESERVATION_CONFIRMED: '#22c55e',
      RESERVATION_CANCELLED: '#ef4444',
      REMINDER_24H: '#f59e0b',
      REMINDER_1H: '#3b82f6',
      RETURN_REMINDER: '#8b5cf6',
      PAYMENT_COMPLETED: '#06b6d4',
      LICENSE_APPROVED: '#10b981',
      LICENSE_REJECTED: '#ef4444',
    };

    return colorMap[type] || '#6b7280';
  }

  /**
   * 시간을 상대적으로 표시 (예: "2시간 전")
   */
  formatRelativeTime(dateTime) {
    const now = new Date();
    const date = new Date(dateTime);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return '방금 전';
    } else if (diffMins < 60) {
      return `${diffMins}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const notificationService = new NotificationService();
