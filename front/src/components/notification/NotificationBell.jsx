// front/src/components/notification/NotificationBell.jsx (props로 받는 버전)
import React, { useState } from 'react';
import styled from 'styled-components';
import { HiOutlineBell } from 'react-icons/hi';
import { useWebSocket } from '../../hooks/useWebSocket';
import NotificationList from './NotificationList';

const NotificationBell = ({ notificationsData }) => {
  const [showNotifications, setShowNotifications] = useState(false);
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
          {/* props로 받은 unreadCount 사용 */}
          {notificationsData.unreadCount > 0 && <RedDot />}
        </BellWrapper>
      </BellContainer>

      {showNotifications && (
        <NotificationList
          onClose={handleCloseNotifications}
          notificationsData={notificationsData} // props로 전달
        />
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

/* 기존 배지 스타일을 간단한 빨간 점으로 변경 */
const RedDot = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
`;

export default NotificationBell;
