// src/components/notification/NotificationList.jsx (업데이트된 버전)
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { notificationService } from '../../services/notificationService';
import {
  HiOutlineTrash,
  HiOutlineDotsVertical,
  HiOutlineCheck,
} from 'react-icons/hi';

const NotificationList = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
      console.error('알림 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error('모든 알림 읽음 처리 실패:', err);
    }
  };

  // 개별 알림 삭제
  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('알림 삭제 실패:', err);
      alert('알림 삭제 중 오류가 발생했습니다.');
    }
  };

  // 모든 알림 삭제
  const handleDeleteAllNotifications = async () => {
    if (!window.confirm('정말로 모든 알림을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      alert('모든 알림이 삭제되었습니다.');
    } catch (err) {
      console.error('모든 알림 삭제 실패:', err);
      alert('알림 삭제 중 오류가 발생했습니다.');
    }
  };

  // 읽은 알림만 삭제
  const handleDeleteReadNotifications = async () => {
    if (!window.confirm('읽은 알림을 모두 삭제하시겠습니까?')) {
      return;
    }

    try {
      await notificationService.deleteReadNotifications();
      setNotifications((prev) =>
        prev.filter((notification) => !notification.isRead)
      );
      alert('읽은 알림이 삭제되었습니다.');
    } catch (err) {
      console.error('읽은 알림 삭제 실패:', err);
      alert('읽은 알림 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>알림</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>
        <LoadingText>알림을 불러오는 중...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>알림</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>
        <ErrorText>{error}</ErrorText>
      </Container>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <Container>
      <Header>
        <Title>알림</Title>
        <HeaderActions>
          {unreadNotifications.length > 0 && (
            <ActionButton onClick={handleMarkAllAsRead}>
              <HiOutlineCheck size={16} />
              모두 읽음
            </ActionButton>
          )}
          <CloseButton onClick={onClose}>×</CloseButton>
        </HeaderActions>
      </Header>

      {/* 삭제 옵션 버튼들 */}
      {notifications.length > 0 && (
        <DeleteActions>
          {readNotifications.length > 0 && (
            <DeleteButton
              onClick={handleDeleteReadNotifications}
              variant="secondary"
            >
              <HiOutlineTrash size={14} />
              읽은 알림 삭제
            </DeleteButton>
          )}
          <DeleteButton onClick={handleDeleteAllNotifications} variant="danger">
            <HiOutlineTrash size={14} />
            전체 삭제
          </DeleteButton>
        </DeleteActions>
      )}

      <NotificationListContainer>
        {notifications.length === 0 ? (
          <EmptyMessage>새로운 알림이 없습니다.</EmptyMessage>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              isRead={notification.isRead}
            >
              <NotificationContent
                onClick={() =>
                  !notification.isRead && handleMarkAsRead(notification.id)
                }
              >
                <NotificationIcon>
                  {notificationService.getNotificationIcon(
                    notification.notificationType
                  )}
                </NotificationIcon>
                <ContentWrapper>
                  <NotificationTitle isRead={notification.isRead}>
                    {notification.title}
                  </NotificationTitle>
                  <NotificationMessage>
                    {notification.message}
                  </NotificationMessage>
                  <NotificationTime>
                    {notificationService.formatRelativeTime(
                      notification.createdAt
                    )}
                  </NotificationTime>
                </ContentWrapper>
                {!notification.isRead && <UnreadDot />}
              </NotificationContent>

              <NotificationActions>
                <ActionIcon
                  onClick={() =>
                    setShowDeleteConfirm(
                      showDeleteConfirm === notification.id
                        ? null
                        : notification.id
                    )
                  }
                >
                  <HiOutlineDotsVertical size={16} />
                </ActionIcon>

                {showDeleteConfirm === notification.id && (
                  <ActionMenu>
                    <ActionMenuItem
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <HiOutlineTrash size={14} />
                      삭제
                    </ActionMenuItem>
                  </ActionMenu>
                )}
              </NotificationActions>
            </NotificationItem>
          ))
        )}
      </NotificationListContainer>
    </Container>
  );
};

// 기존 스타일 컴포넌트들은 유지하고 새로운 스타일 추가
const Container = styled.div`
  position: fixed;
  top: 70px;
  right: 20px;
  width: 400px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  z-index: 1000;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background: #eff6ff;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background: #f3f4f6;
  }
`;

// 새로 추가된 삭제 관련 스타일들
const DeleteActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) => {
    switch (props.variant) {
      case 'danger':
        return `
          background-color: #fee2e2;
          color: #dc2626;
          &:hover { background-color: #fecaca; }
        `;
      case 'secondary':
        return `
          background-color: #f3f4f6;
          color: #6b7280;
          &:hover { background-color: #e5e7eb; }
        `;
      default:
        return `
          background-color: #eff6ff;
          color: #3b82f6;
          &:hover { background-color: #dbeafe; }
        `;
    }
  }}
`;

const NotificationListContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const LoadingText = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
`;

const ErrorText = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #ef4444;
`;

const EmptyMessage = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid #f3f4f6;
  background: ${(props) => (props.isRead ? 'white' : '#f8fafc')};
  position: relative;

  &:hover {
    background: ${(props) => (props.isRead ? '#f9fafb' : '#f1f5f9')};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  flex: 1;
  cursor: ${(props) => (props.isRead ? 'default' : 'pointer')};
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const NotificationIcon = styled.div`
  font-size: 20px;
  margin-right: 12px;
  margin-top: 2px;
`;

const NotificationTitle = styled.div`
  font-weight: ${(props) => (props.isRead ? '500' : '600')};
  color: ${(props) => (props.isRead ? '#6b7280' : '#111827')};
  margin-bottom: 4px;
  line-height: 1.4;
`;

const NotificationMessage = styled.div`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 6px;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  margin-top: 6px;
  margin-left: 8px;
`;

const NotificationActions = styled.div`
  position: relative;
  padding: 16px 8px;
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }
`;

const ActionMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 80px;
`;

const ActionMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #ef4444;
  font-size: 13px;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: #fef2f2;
  }

  &:first-child {
    border-radius: 6px 6px 0 0;
  }

  &:last-child {
    border-radius: 0 0 6px 6px;
  }
`;

export default NotificationList;
