// src/components/notification/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { notificationService } from '../../services/notificationService';
import { HiOutlineBell } from 'react-icons/hi';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadUnreadCount();

    // 5분마다 읽지 않은 알림 개수 업데이트
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('읽지 않은 알림 개수 조회 실패:', err);
    }
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
    // 알림 목록을 닫을 때 읽지 않은 개수 다시 로드
    loadUnreadCount();
  };

  return (
    <>
      <BellContainer onClick={handleBellClick}>
        <HiOutlineBell size={22} />
        {unreadCount > 0 && (
          <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
        )}
      </BellContainer>

      {showNotifications && (
        <NotificationList onClose={handleCloseNotifications} />
      )}
    </>
  );
};

const BellContainer = styled.div`
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const BellIcon = styled.div`
  font-size: 24px;
  color: #6b7280;
  transition: color 0.2s;

  ${BellContainer}:hover & {
    color: #374151;
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`;

export default NotificationBell;
