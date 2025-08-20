import styled from 'styled-components';

// API를 통해 받아올 실제 알림 데이터 예시
const notifications = [
  { id: 1, message: '예약이 성공적으로 완료되었습니다.', time: '10분 전', read: false },
  { id: 2, message: '새로운 이벤트가 등록되었습니다: 썸머 페스티벌!', time: '1시간 전', read: false },
  { id: 3, message: '차량 반납 시간이 1시간 남았습니다.', time: '어제', read: true },
  { id: 4, message: '결제 정보가 업데이트되었습니다.', time: '2일 전', read: true },
];

const NotificationModal = ({ show }) => {
  if (!show) {
    return null;
  }

  return (
    <ModalContainer>
      <ModalHeader>알림</ModalHeader>
      <NotificationList>
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <NotificationItem key={item.id} read={item.read}>
              <Message>{item.message}</Message>
              <Time>{item.time}</Time>
            </NotificationItem>
          ))
        ) : (
          <NoNotifications>새로운 알림이 없습니다.</NoNotifications>
        )}
      </NotificationList>
      <ModalFooter>
        <button>모두 읽음 처리</button>
      </ModalFooter>
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