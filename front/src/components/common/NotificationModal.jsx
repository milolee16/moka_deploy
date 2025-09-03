// src/components/common/NotificationModal.jsx (업데이트)
import React from 'react';
import styled from 'styled-components';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationModal = ({ show }) => {
    const { notifications, loading, error, markAsRead, markAllAsRead } = useNotifications();

    if (!show) {
        return null;
    }

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    if (loading) {
        return (
            <ModalContainer>
                <ModalHeader>알림</ModalHeader>
                <LoadingContainer>알림을 불러오는 중...</LoadingContainer>
            </ModalContainer>
        );
    }

    if (error) {
        return (
            <ModalContainer>
                <ModalHeader>알림</ModalHeader>
                <ErrorContainer>알림을 불러오는데 실패했습니다.</ErrorContainer>
            </ModalContainer>
        );
    }

    return (
        <ModalContainer>
            <ModalHeader>알림</ModalHeader>
            <NotificationList>
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            read={notification.isRead}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <Message>{notification.message}</Message>
                            <Time>{notification.timeAgo}</Time>
                        </NotificationItem>
                    ))
                ) : (
                    <NoNotifications>새로운 알림이 없습니다.</NoNotifications>
                )}
            </NotificationList>
            {notifications.some(n => !n.isRead) && (
                <ModalFooter>
                    <button onClick={handleMarkAllAsRead}>모두 읽음 처리</button>
                </ModalFooter>
            )}
        </ModalContainer>
    );
};

export default NotificationModal;

const ModalContainer = styled.div`
  position: absolute;
  top: calc(100% + 12px); /* 아이콘 아래에 약간의 간격을 둡니다 */
  right: 0;
  width: 320px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #eee;
  z-index: 1000;
  overflow: hidden;
`;

const ModalHeader = styled.header`
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
`;

const NotificationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationItem = styled.li`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  opacity: ${(props) => (props.read ? 0.6 : 1)};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9f9f9;
  }
`;

const Message = styled.p`
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
`;

const Time = styled.span`
  font-size: 12px;
  color: #888;
`;

const NoNotifications = styled.div`
  padding: 40px 16px;
  text-align: center;
  color: #999;
`;

const ModalFooter = styled.footer`
  padding: 8px 16px;
  text-align: right;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;

  & > button {
    background: none;
    border: none;
    color: #007bff;
    font-size: 13px;
    cursor: pointer;
    padding: 4px 8px;
  }
`;

// 스타일은 기존과 동일하고, 추가로 필요한 스타일들:
const LoadingContainer = styled.div`
  padding: 40px 16px;
  text-align: center;
  color: #666;
`;

const ErrorContainer = styled.div`
  padding: 40px 16px;
  text-align: center;
  color: #e74c3c;
`;