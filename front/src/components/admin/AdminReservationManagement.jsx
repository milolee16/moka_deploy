import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AdminReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);

  // 예약 상태 옵션 (기존 API와 동일)
  const statusOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'PENDING', label: '대기중' },
    { value: 'CONFIRMED', label: '확정' },
    { value: 'IN_PROGRESS', label: '진행중' },
    { value: 'COMPLETED', label: '완료' },
    { value: 'CANCELLED', label: '취소' },
  ];

  // 상태별 색상 매핑 (Moca 테마)
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'CONFIRMED':
        return '#a47551'; // Moca: Primary
      case 'IN_PROGRESS':
        return '#10b981';
      case 'COMPLETED':
        return '#795548'; // Moca: Medium Brown
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#795548'; // Moca: Medium Brown
    }
  };

  // 예약 목록 조회 (기존 API 로직)
  const fetchReservations = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const url =
        statusFilter === 'ALL'
          ? `http://localhost:8080/api/reservations/admin/all`
          : `http://localhost:8080/api/reservations/admin/all?status=${statusFilter}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('관리자 권한이 필요합니다.');
        }
        throw new Error('예약 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setReservations(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  // 예약 상태 변경 (기존 API 로직)
  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:8080/api/reservations/admin/${reservationId}/status?status=${newStatus}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('상태 변경에 실패했습니다.');
      }

      const updatedReservation = await response.json();

      // 목록에서 해당 예약 업데이트
      setReservations((prev) =>
        prev.map((res) => (res.id === reservationId ? updatedReservation : res))
      );

      // 선택된 예약도 업데이트
      if (selectedReservation && selectedReservation.id === reservationId) {
        setSelectedReservation(updatedReservation);
      }

      setEditingStatus(false);
      alert('상태가 성공적으로 변경되었습니다.');
    } catch (err) {
      alert(err.message);
      console.error('Error updating status:', err);
    }
  };

  // 예약 삭제 (기존 API 로직)
  const deleteReservation = async (reservationId) => {
    if (!confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:8080/api/reservations/admin/${reservationId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('예약 삭제에 실패했습니다.');
      }

      // 목록에서 제거
      setReservations((prev) => prev.filter((res) => res.id !== reservationId));

      // 모달 닫기
      if (selectedReservation && selectedReservation.id === reservationId) {
        setShowModal(false);
        setSelectedReservation(null);
      }

      alert('예약이 성공적으로 삭제되었습니다.');
    } catch (err) {
      alert(err.message);
      console.error('Error deleting reservation:', err);
    }
  };

  // 예약 상세 조회 (기존 API 로직)
  const viewReservationDetails = async (reservationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:8080/api/reservations/admin/${reservationId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('예약 상세 정보를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setSelectedReservation(data);
      setShowModal(true);
    } catch (err) {
      alert(err.message);
      console.error('Error fetching reservation details:', err);
    }
  };

  // 검색 필터링 (기존 로직)
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      searchTerm === '' ||
      reservation.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.locationName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reservation.car?.carName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // 날짜 포맷팅 (기존 로직)
  const formatDateTime = (date, time) => {
    if (!date) return '-';
    return `${date} ${time || ''}`.trim();
  };

  // 가격 포맷팅 (기존 로직)
  const formatPrice = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  if (loading) {
    return (
      <MobileContainer>
        <PageHeader>
          <PageTitle>예약 관리</PageTitle>
        </PageHeader>
        <LoadingContainer>
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </LoadingContainer>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <PageHeader>
        <PageTitle>예약 관리</PageTitle>
        <TotalCount>총 {filteredReservations.length}건</TotalCount>
      </PageHeader>

      <FilterSection>
        <SearchContainer>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput
            type="text"
            placeholder="사용자ID, 차량명, 지점명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <FilterContainer>
          <FilterIcon>📋</FilterIcon>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </FilterContainer>

        <RefreshButton onClick={fetchReservations} disabled={loading}>
          🔄 새로고침
        </RefreshButton>
      </FilterSection>

      {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}

      <ReservationList>
        {filteredReservations.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyText>조건에 맞는 예약이 없습니다</EmptyText>
          </EmptyState>
        ) : (
          filteredReservations.map((reservation) => (
            <ReservationCard key={reservation.id}>
              <CardHeader>
                <UserInfo>
                  <UserName>{reservation.userId}</UserName>
                  <ReservationId>예약번호: #{reservation.id}</ReservationId>
                  <LocationName>📍 {reservation.locationName}</LocationName>
                </UserInfo>
                <StatusBadge color={getStatusColor(reservation.status)}>
                  {statusOptions.find((opt) => opt.value === reservation.status)
                    ?.label || reservation.status}
                </StatusBadge>
              </CardHeader>

              <VehicleInfo>
                <VehicleDetails>
                  <VehicleName>{reservation.car?.carName || '-'}</VehicleName>
                  <PassengerCount>
                    승객 {reservation.passengerCount}명
                  </PassengerCount>
                </VehicleDetails>
              </VehicleInfo>

              <DateInfo>
                <DateDetails>
                  <DateLabel>대여</DateLabel>
                  <DateValue>
                    {formatDateTime(
                      reservation.rentalDate,
                      reservation.rentalTime
                    )}
                  </DateValue>
                </DateDetails>
              </DateInfo>

              <DateInfo>
                <DateDetails>
                  <DateLabel>반납</DateLabel>
                  <DateValue>
                    {formatDateTime(
                      reservation.returnDate,
                      reservation.returnTime
                    )}
                  </DateValue>
                </DateDetails>
              </DateInfo>

              <PriceInfo>
                <Price>{formatPrice(reservation.totalAmount)}</Price>
              </PriceInfo>

              <ActionButtons>
                <ActionButton
                  onClick={() => viewReservationDetails(reservation.id)}
                >
                  상세
                </ActionButton>
                <ActionButton
                  primary
                  onClick={() => {
                    setSelectedReservation(reservation);
                    setEditingStatus(true);
                  }}
                >
                  수정
                </ActionButton>
                <ActionButton
                  danger
                  onClick={() => deleteReservation(reservation.id)}
                >
                  삭제
                </ActionButton>
              </ActionButtons>
            </ReservationCard>
          ))
        )}
      </ReservationList>

      {/* 예약 상세 모달 */}
      {showModal && selectedReservation && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>예약 상세 정보</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <DetailGrid>
                <DetailItem>
                  <DetailLabel>예약번호</DetailLabel>
                  <DetailValue>#{selectedReservation.id}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>사용자ID</DetailLabel>
                  <DetailValue>{selectedReservation.userId}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>차량</DetailLabel>
                  <DetailValue>
                    {selectedReservation.car?.carName || '-'}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>대여지점</DetailLabel>
                  <DetailValue>{selectedReservation.locationName}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>대여일시</DetailLabel>
                  <DetailValue>
                    {formatDateTime(
                      selectedReservation.rentalDate,
                      selectedReservation.rentalTime
                    )}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>반납일시</DetailLabel>
                  <DetailValue>
                    {formatDateTime(
                      selectedReservation.returnDate,
                      selectedReservation.returnTime
                    )}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>승객수</DetailLabel>
                  <DetailValue>
                    {selectedReservation.passengerCount}명
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>상태</DetailLabel>
                  <DetailValue>
                    <StatusBadge
                      color={getStatusColor(selectedReservation.status)}
                    >
                      {statusOptions.find(
                        (opt) => opt.value === selectedReservation.status
                      )?.label || selectedReservation.status}
                    </StatusBadge>
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>총 금액</DetailLabel>
                  <DetailValue>
                    {formatPrice(selectedReservation.totalAmount)}
                  </DetailValue>
                </DetailItem>
                {selectedReservation.memo && (
                  <DetailItem className="full-width">
                    <DetailLabel>메모</DetailLabel>
                    <DetailValue>{selectedReservation.memo}</DetailValue>
                  </DetailItem>
                )}
              </DetailGrid>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 상태 변경 모달 */}
      {editingStatus && selectedReservation && (
        <Modal onClick={() => setEditingStatus(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>예약 상태 변경</ModalTitle>
              <CloseButton onClick={() => setEditingStatus(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <StatusChangeInfo>
                예약 #{selectedReservation.id}의 상태를 변경하시겠습니까?
              </StatusChangeInfo>
              <CurrentStatus>
                현재 상태:{' '}
                <strong>
                  {
                    statusOptions.find(
                      (opt) => opt.value === selectedReservation.status
                    )?.label
                  }
                </strong>
              </CurrentStatus>

              <StatusSelectContainer>
                <StatusSelectLabel>새로운 상태:</StatusSelectLabel>
                <StatusSelect
                  defaultValue={selectedReservation.status}
                  onChange={(e) => {
                    if (e.target.value !== selectedReservation.status) {
                      updateReservationStatus(
                        selectedReservation.id,
                        e.target.value
                      );
                    }
                  }}
                >
                  {statusOptions
                    .filter((opt) => opt.value !== 'ALL')
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </StatusSelect>
              </StatusSelectContainer>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </MobileContainer>
  );
};

// Moca Color Scheme Mobile-First Styled Components
const MobileContainer = styled.div`
  padding: 0;
  background: transparent;
  width: 100%;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PageTitle = styled.h1`
  margin: 0;
  color: #5d4037; /* Moca: Dark Brown */
  font-size: 1.5rem;
  font-weight: 700;
`;

const TotalCount = styled.div`
  background: linear-gradient(
    135deg,
    #a47551,
    #795548
  ); /* Moca: Primary to Medium Brown */
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(164, 117, 81, 0.3); /* Moca: Shadow */
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  z-index: 1;
  font-size: 1rem;
  color: #795548; /* Moca: Medium Brown */
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
  border-radius: 12px;
  font-size: 0.9rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #a47551; /* Moca: Primary */
    box-shadow: 0 0 0 3px rgba(164, 117, 81, 0.1); /* Moca: Shadow */
  }
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const FilterIcon = styled.div`
  position: absolute;
  left: 12px;
  z-index: 1;
  font-size: 1rem;
  color: #795548; /* Moca: Medium Brown */
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
  border-radius: 12px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #a47551; /* Moca: Primary */
    box-shadow: 0 0 0 3px rgba(164, 117, 81, 0.1); /* Moca: Shadow */
  }
`;

const RefreshButton = styled.button`
  padding: 12px 16px;
  background: #a47551; /* Moca: Primary */
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #795548; /* Moca: Medium Brown */
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SkeletonCard = styled.div`
  height: 200px;
  background: linear-gradient(
    90deg,
    #f5f1ed 25%,
    #e7e0d9 50%,
    #f5f1ed 75%
  ); /* Moca: Light Colors */
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 16px;

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const ReservationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReservationCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
  box-shadow: 0 4px 12px rgba(164, 117, 81, 0.08); /* Moca: Shadow */
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(164, 117, 81, 0.15); /* Moca: Shadow */
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #5d4037; /* Moca: Dark Brown */
  margin-bottom: 4px;
`;

const ReservationId = styled.div`
  font-size: 0.75rem;
  color: #a47551; /* Moca: Primary */
  font-weight: 500;
  margin-bottom: 2px;
`;

const LocationName = styled.div`
  font-size: 0.85rem;
  color: #795548; /* Moca: Medium Brown */
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${(props) => props.color}20;
  color: ${(props) => props.color};
  border: 1px solid ${(props) => props.color}40;
`;

const VehicleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f5f1ed; /* Moca: Light Brown BG */
  border-radius: 12px;
`;

const VehicleIcon = styled.div`
  font-size: 1.2rem;
`;

const VehicleDetails = styled.div`
  flex: 1;
`;

const VehicleName = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #5d4037; /* Moca: Dark Brown */
  margin-bottom: 2px;
`;

const PassengerCount = styled.div`
  font-size: 0.85rem;
  color: #795548; /* Moca: Medium Brown */
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const DateIcon = styled.div`
  font-size: 1rem;
  width: 20px;
`;

const DateDetails = styled.div`
  flex: 1;
`;

const DateLabel = styled.div`
  font-size: 0.75rem;
  color: #795548; /* Moca: Medium Brown */
  margin-bottom: 2px;
`;

const DateValue = styled.div`
  font-size: 0.9rem;
  color: #5d4037; /* Moca: Dark Brown */
  font-weight: 500;
`;

const PriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const PriceIcon = styled.div`
  font-size: 1rem;
`;

const Price = styled.div`
  font-size: 1rem;
  color: #a47551; /* Moca: Primary */
  font-weight: 700;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 80px;

  background: ${(props) => {
    if (props.primary) return '#a47551'; /* Moca: Primary */
    if (props.danger) return '#ef4444';
    return '#f5f1ed'; /* Moca: Light Brown BG */
  }};

  color: ${(props) => {
    if (props.primary || props.danger) return 'white';
    return '#5d4037'; /* Moca: Dark Brown */
  }};

  border: 1px solid
    ${(props) => {
      if (props.primary) return '#a47551'; /* Moca: Primary */
      if (props.danger) return '#ef4444';
      return '#e7e0d9'; /* Moca: Beige Border */
    }};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(164, 117, 81, 0.2); /* Moca: Shadow */

    ${(props) =>
      !props.primary &&
      !props.danger &&
      `
      background: #e7e0d9;  /* Moca: Beige Border */
    `}
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 1rem;
  color: #795548; /* Moca: Medium Brown */
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #fecaca;
  font-size: 0.9rem;
  text-align: center;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(164, 117, 81, 0.2); /* Moca: Shadow */
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e7e0d9; /* Moca: Beige Border */
  background: #f5f1ed; /* Moca: Light Brown BG */
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #5d4037; /* Moca: Dark Brown */
  font-size: 1.1rem;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #795548; /* Moca: Medium Brown */
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #5d4037; /* Moca: Dark Brown */
    background: #e7e0d9; /* Moca: Beige Border */
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  .full-width {
    grid-column: 1 / -1;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-size: 0.75rem;
  color: #795548; /* Moca: Medium Brown */
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  font-size: 0.9rem;
  color: #5d4037; /* Moca: Dark Brown */
  font-weight: 500;
`;

const StatusChangeInfo = styled.p`
  color: #5d4037; /* Moca: Dark Brown */
  margin-bottom: 12px;
`;

const CurrentStatus = styled.p`
  color: #795548; /* Moca: Medium Brown */
  margin-bottom: 16px;

  strong {
    color: #a47551; /* Moca: Primary */
  }
`;

const StatusSelectContainer = styled.div`
  margin-top: 16px;
`;

const StatusSelectLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #5d4037; /* Moca: Dark Brown */
  font-size: 0.9rem;
`;

const StatusSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #5d4037; /* Moca: Dark Brown */

  &:focus {
    outline: none;
    border-color: #a47551; /* Moca: Primary */
    box-shadow: 0 0 0 3px rgba(164, 117, 81, 0.1); /* Moca: Shadow */
  }
`;

export default AdminReservationManagement;
