import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiUser,
  FiChevronRight,
  FiCreditCard,
  FiLogOut,
  FiSettings,
  FiTag,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

// API base URL (same as in PaymentOptions.jsx)
const API_BASE_URL =
    import.meta.env.MODE === "development" ? "http://localhost:8080" : "http://localhost:8080";

// Helper function for date/time formatting
const formatReservationDateTime = (date, time) => {
  if (!date || !time) return '';
  // Assuming date is 'YYYY-MM-DD' and time is 'HH:MM:SS' or 'HH:MM'
  const dateTime = new Date(`${date}T${time}`);
  const year = dateTime.getFullYear();
  const month = String(dateTime.getMonth() + 1).padStart(2, '0');
  const day = String(dateTime.getDate()).padStart(2, '0');
  const hours = String(dateTime.getHours()).padStart(2, '0');
  const minutes = String(dateTime.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user?.userId) { // Ensure user ID is available
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/reservations/my-reservations`, {
          headers: {
            Authorization: `Bearer ${user.token}`, // Assuming token is available in user object
          },
        });
        setReservations(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error("Failed to fetch reservations:", err);
      }
    };

    fetchReservations();
  }, [user]); // Re-fetch when user changes

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openModal = (reservation) => {
    setSelectedReservation(reservation);
  };

  const closeModal = () => {
    setSelectedReservation(null);
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("정말로 예약을 취소하시겠습니까?")) return;

    try {
      await axios.put(`${API_BASE_URL}/api/reservations/${reservationId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Update local state
      const updatedReservations = reservations.map(r => 
        r.id === reservationId ? { ...r, status: 'CANCELLED', displayStatus: 'CANCELLED' } : r
      );
      setReservations(updatedReservations);
      closeModal();
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
      alert("예약 취소에 실패했습니다.");
    }
  };

  const handleReturnReservation = async (reservationId) => {
    if (!window.confirm("정말로 반납하시겠습니까?")) return;

    try {
      await axios.put(`${API_BASE_URL}/api/reservations/${reservationId}/complete`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Update local state
      const updatedReservations = reservations.map(r => 
        r.id === reservationId ? { ...r, status: 'COMPLETED', displayStatus: 'COMPLETED' } : r
      );
      setReservations(updatedReservations);
      closeModal();
      navigate('/return');
    } catch (err) {
      console.error("Failed to complete reservation:", err);
      alert("반납 처리에 실패했습니다.");
    }
  };

  const displayName = user?.username || '게스트';
  const profileInitial = user?.role === 'admin' ? 'A' : displayName[0];

  return (
    <PageLayout>
      <Header>
        <BackButton onClick={() => navigate(-1)}>‹</BackButton>
        <Title>마이페이지</Title>
      </Header>

      <ProfileSection>
        <ProfileInitial>{profileInitial}</ProfileInitial>
        <UserInfo>
          <UserName>{displayName}님, <br />환영합니다!</UserName>
        </UserInfo>
        <EditButton onClick={() => navigate('/profile-edit')}>
          프로필 수정
        </EditButton>
      </ProfileSection>

      <Section>
        <SectionTitle>나의 예약 내역</SectionTitle>
        {loading && <p>예약 내역을 불러오는 중...</p>}
        {error && <p>예약 내역을 불러오는데 실패했습니다: {error.message}</p>}
        {!loading && !error && reservations.length === 0 && (
          <p>예약 내역이 없습니다.</p>
        )}
        {!loading && !error && reservations.length > 0 && (
          reservations.map((res) => {
            const { status, rentalDate, rentalTime } = res;
            let displayStatus = status;

            if (status === 'CONFIRMED') {
              const reservationStart = new Date(`${rentalDate}T${rentalTime}`);
              const reservationEnd = new Date(`${res.returnDate}T${res.returnTime}`);
              const now = new Date();

              if (now < reservationStart) {
                displayStatus = 'UPCOMING';
              } else if (now >= reservationStart && now <= reservationEnd) {
                displayStatus = 'IN_USE';
              } else {
                displayStatus = 'COMPLETED';
              }
            }

            return (
              <ReservationCard key={res.id} onClick={() => openModal({ ...res, displayStatus })}>
                <CarModel>{res.car?.carName || '차량 정보 없음'}</CarModel>
                <LocationInfo>{res.locationName}</LocationInfo>
                <ReservationInfo>
                  {formatReservationDateTime(res.rentalDate, res.rentalTime)} ~ {formatReservationDateTime(res.returnDate, res.returnTime)}
                </ReservationInfo>
                <StatusBadge status={displayStatus}>{displayStatus}</StatusBadge>
              </ReservationCard>
            );
          })
        )}
        <ViewMoreButton>예약 내역 더보기</ViewMoreButton>
      </Section>

      <MenuSection>
        <MenuItem onClick={() => navigate('/payments-licenses')}>
          <FiCreditCard size={20} />
          <span>운전면허증 정보</span>
          <FiChevronRight />
        </MenuItem>
        <MenuItem>
          <FiSettings size={20} />
          <span>알림 설정</span>
          <FiChevronRight />
        </MenuItem>
        <MenuItem>
          <FiShield size={20} />
          <span>개인정보 처리방침</span>
          <FiChevronRight />
        </MenuItem>
      </MenuSection>

      <LogoutButton onClick={handleLogout}>
        <FiLogOut />
        <span>로그아웃</span>
      </LogoutButton>

      {selectedReservation && (
        <Modal isOpen={!!selectedReservation} onClose={closeModal}>
          <ModalTitle>예약 상세 정보</ModalTitle>
          <ModalContent>
            <InfoRow>
              <InfoLabel>차량</InfoLabel>
              <InfoValue>{selectedReservation.car?.carName}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>대여/반납 장소</InfoLabel>
              <InfoValue>{selectedReservation.locationName}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>대여 일시</InfoLabel>
              <InfoValue>
                {formatReservationDateTime(selectedReservation.rentalDate, selectedReservation.rentalTime)}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>반납 일시</InfoLabel>
              <InfoValue>
                {formatReservationDateTime(selectedReservation.returnDate, selectedReservation.returnTime)}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>상태</InfoLabel>
              <InfoValue status={selectedReservation.displayStatus}>{selectedReservation.displayStatus}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>총 결제 금액</InfoLabel>
              <InfoValue>{selectedReservation.totalAmount?.toLocaleString()}원</InfoValue>
            </InfoRow>
            {selectedReservation.memo && (
              <InfoRow>
                <InfoLabel>메모</InfoLabel>
                <InfoValue>{selectedReservation.memo}</InfoValue>
              </InfoRow>
            )}
          </ModalContent>
          {selectedReservation.displayStatus === 'IN_USE' && (
    <ReturnButton onClick={() => handleReturnReservation(selectedReservation.id)}>
      반납하기
    </ReturnButton>
  )}
          {selectedReservation.displayStatus === 'UPCOMING' && (
            <CancelButton onClick={() => handleCancelReservation(selectedReservation.id)}>
              예약 취소
            </CancelButton>
          )}
        </Modal>
      )}
    </PageLayout>
  );
};

const handleReturnReservation = async (reservationId) => {
    if (!window.confirm("정말로 반납하시겠습니까?")) return;

    try {
      await axios.put(`${API_BASE_URL}/api/reservations/${reservationId}/complete`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Update local state
      const updatedReservations = reservations.map(r => 
        r.id === reservationId ? { ...r, status: 'COMPLETED', displayStatus: 'COMPLETED' } : r
      );
      setReservations(updatedReservations);
      closeModal();
    } catch (err) {
      console.error("Failed to complete reservation:", err);
      alert("반납 처리에 실패했습니다.");
    }
  };

export default MyPage;

/* Styles */
const PageLayout = styled.div`
  background-color: #f7f5f3;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 8px 0;
  margin-bottom: 12px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  font-weight: bold;
  color: #5d4037;
  cursor: pointer;
  padding: 0 16px 0 0;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #5d4037;
  margin: 0;
`;

const ProfileSection = styled.section`
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const UserInfo = styled.div`
  flex-grow: 1;
  margin-left: 16px;
`;

const UserName = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #3e2723;
  margin: 0 0 4px;
`;

const UserEmail = styled.p`
  font-size: 14px;
  color: #a1887f;
  margin: 0;
`;

const EditButton = styled.button`
  background: #e7e0d9;
  color: #5d4037;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const Section = styled.section`
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #3e2723;
  margin: 0 0 16px;
`;

const ReservationCard = styled.div`
  border: 1px solid #f0ebe5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto auto; // Adjust for the new row
  gap: 4px 8px;
`;

const CarModel = styled.p`
  font-weight: 600;
  color: #5d4037;
  margin: 0;
  grid-column: 1 / 2;
`;

const LocationInfo = styled.p`
  font-size: 14px;
  color: #795548; // A slightly different color for distinction
  margin: 0;
  grid-column: 1 / 2;
`;

const ReservationInfo = styled.p`
  font-size: 13px;
  color: #a1887f;
  margin: 0;
  grid-column: 1 / 2;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  grid-column: 2 / 3;
  grid-row: 1 / 4; // Span all three rows
  align-self: center;
  color: ${({ status }) => {
    if (status === 'UPCOMING') return '#4CAF50';
    if (status === 'IN_USE') return '#2196F3';
    if (status === 'CANCELLED') return '#F44336';
    return '#757575';
  }};
  background-color: ${({ status }) => {
    if (status === 'UPCOMING') return '#E8F5E9';
    if (status === 'IN_USE') return '#E3F2FD';
    if (status === 'CANCELLED') return '#FFEBEE';
    return '#F5F5F5';
  }};
`;

const ViewMoreButton = styled.button`
  width: 100%;
  text-align: center;
  background: transparent;
  border: none;
  padding-top: 12px;
  color: #795548;
  font-weight: 600;
  cursor: pointer;
`;

const MenuSection = styled.section`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #f0ebe5;
  cursor: pointer;
  color: #3e2723;
  font-size: 15px;

  &:last-child {
    border-bottom: none;
  }

  & > svg:first-child {
    margin-right: 16px;
    color: #795548;
  }

  & > span {
    flex-grow: 1;
  }

  & > svg:last-child {
    color: #c7b2a5;
  }
`;

const Badge = styled.span`
  background-color: #5d4037;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  margin-right: 8px;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 24px;
  padding: 16px;
  border: none;
  background: #e7e0d9;
  color: #795548;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;

const ProfileInitial = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%; /* 원형 모양 */
  background-color: #5d4037; /* 배경색 */
  color: #ffffff; /* 글자색 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #3e2723;
  margin: 0 0 16px;
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0ebe5;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 8px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f7f5f3;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #795548;
`;

const InfoValue = styled.span`
  color: ${({ status }) => {
    if (status === 'UPCOMING') return '#4CAF50';
    if (status === 'IN_USE') return '#2196F3';
    if (status === 'CANCELLED') return '#F44336';
    return '#5d4037';
  }};
  text-align: right;
  font-weight: 500;
`;

const CancelButton = styled.button`
  background-color: #F44336;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #D32F2F;
  }
`;

const ReturnButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1976D2;
  }
`;