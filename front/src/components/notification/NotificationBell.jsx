// front/src/components/notification/NotificationBell.jsx (WebSocket 연동 버전)
import React, { useState } from 'react';
import styled from 'styled-components';
import { HiOutlineBell } from 'react-icons/hi';
import { useNotifications } from '../../hooks/useNotifications';
import { useWebSocket } from '../../hooks/useWebSocket';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();
  const { getConnectionStatus } = useWebSocket();

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const connectionStatus = getConnectionStatus();

  return (
    <>
      <BellContainer onClick={handleBellClick}>
        <BellWrapper>
          <HiOutlineBell size={22} />
          {unreadCount > 0 && (
            <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
          )}
          {/* 연결 상태 표시 (선택사항) */}
          <ConnectionIndicator connected={connectionStatus.isConnected} />
        </BellWrapper>
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

const BellWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Badge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
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

const ConnectionIndicator = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => (props.connected ? '#10b981' : '#ef4444')};
  border: 1px solid white;
  opacity: 0.8;
`;

export default NotificationBell;
