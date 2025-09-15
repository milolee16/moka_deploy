// front/src/components/notification/NotificationList.jsx (props로 받는 버전)
import React, { useState } from 'react';
import styled from 'styled-components';
import { notificationService } from '../../services/notificationService';
import {
  HiOutlineTrash,
  HiOutlineDotsVertical,
  HiOutlineCheck,
} from 'react-icons/hi';

const NotificationList = ({ onClose, notificationsData }) => {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
    deleteReadNotifications,
    deleteNotification,
  } = notificationsData; // props로 받은 데이터 사용

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // 개별 알림 읽음 처리
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
      alert('알림 읽음 처리 중 오류가 발생했습니다.');
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('모든 알림 읽음 처리 실패:', err);
      alert('모든 알림 읽음 처리 중 오류가 발생했습니다.');
    }
  };

  // 개별 알림 삭제
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
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
      await deleteAllNotifications();
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
      await deleteReadNotifications();
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
        <ErrorText>
          {error.message || '알림을 불러오는데 실패했습니다.'}
        </ErrorText>
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
              <span>모두 읽음</span>{' '}
              {/* span으로 감싸서 모바일에서 숨길 수 있도록 */}
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

// 스타일 컴포넌트들 (기존과 동일)
const Container = styled.div`
  position: fixed;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  z-index: 1000;
  overflow: hidden;

  /* 데스크탑 */
  @media (min-width: 769px) {
    top: 70px;
    right: 20px;
    width: 400px;
    max-height: 500px;
  }

  /* 모바일 */
  @media (max-width: 768px) {
    top: 70px;
    right: 15px;
    width: 350px;
    max-width: calc(100vw - 30px);
    max-height: calc(100vh - 100px);
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    right: 10px;
    width: 320px;
    max-width: calc(100vw - 20px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;

  /* 모바일에서 패딩 줄이기 */
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
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

  /* 모바일에서 간격 줄이기 */
  @media (max-width: 768px) {
    gap: 8px;
  }
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

  /* 모바일에서 텍스트 숨기고 아이콘만 표시 */
  @media (max-width: 480px) {
    padding: 6px;
    span {
      display: none;
    }
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

const DeleteActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;

  /* 모바일에서 세로 배치 */
  @media (max-width: 480px) {
    flex-direction: column;
    padding: 8px 16px;
    gap: 6px;
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  /* 모바일에서 전체 너비 */
  @media (max-width: 480px) {
    width: 100%;
    padding: 8px 12px;
  }

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

  /* 모바일에서 패딩 줄이기 */
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
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
  font-size: 14px;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 4px;
`;

const NotificationTime = styled.div`
  color: #9ca3af;
  font-size: 11px;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  position: absolute;
  top: 16px;
  right: 60px;
`;

const NotificationActions = styled.div`
  position: relative;
  padding: 16px 20px 16px 0;

  /* 모바일에서 패딩 줄이기 */
  @media (max-width: 768px) {
    padding: 12px 16px 12px 0;
  }
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }
`;

const ActionMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;

  /* 모바일에서 화면 끝에 맞춰 조정 */
  @media (max-width: 768px) {
    right: 16px;
  }

  @media (max-width: 480px) {
    right: 8px;
    left: auto;
    transform: translateX(0);
  }
`;

const ActionMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
    color: #ef4444;
  }
`;

export default NotificationList;
