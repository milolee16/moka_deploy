import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiEye,
  FiRefreshCw,
} from 'react-icons/fi';

const AdminReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);

  // 예약 상태 옵션
  const statusOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'PENDING', label: '대기중' },
    { value: 'CONFIRMED', label: '확정' },
    { value: 'IN_PROGRESS', label: '진행중' },
    { value: 'COMPLETED', label: '완료' },
    { value: 'CANCELLED', label: '취소' },
  ];

  // 상태별 색상 매핑
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'CONFIRMED':
        return '#10b981';
      case 'IN_PROGRESS':
        return '#3b82f6';
      case 'COMPLETED':
        return '#6b7280';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // 예약 목록 조회
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

  // 예약 상태 변경
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

  // 예약 삭제
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

  // 예약 상세 조회
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

  // 검색 필터링
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

  // 날짜 포맷팅
  const formatDateTime = (date, time) => {
    if (!date) return '-';
    return `${date} ${time || ''}`.trim();
  };

  // 가격 포맷팅
  const formatPrice = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  return (
    <Container>
      <Header>
        <Title>예약 관리</Title>
        <RefreshButton onClick={fetchReservations} disabled={loading}>
          <FiRefreshCw /> 새로고침
        </RefreshButton>
      </Header>

      <FilterSection>
        <SearchContainer>
          <SearchIcon>
            <FiSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="사용자ID, 차량명, 지점명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <FilterContainer>
          <FilterIcon>
            <FiFilter />
          </FilterIcon>
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
      </FilterSection>

      {loading && <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && !error && (
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <th>예약번호</th>
                <th>사용자ID</th>
                <th>차량</th>
                <th>대여지점</th>
                <th>대여일시</th>
                <th>반납일시</th>
                <th>상태</th>
                <th>금액</th>
                <th>작업</th>
              </tr>
            </TableHeader>
            <tbody>
              {filteredReservations.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: 'center', padding: '20px' }}
                  >
                    예약 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <td>#{reservation.id}</td>
                    <td>{reservation.userId}</td>
                    <td>{reservation.car?.carName || '-'}</td>
                    <td>{reservation.locationName}</td>
                    <td>
                      {formatDateTime(
                        reservation.rentalDate,
                        reservation.rentalTime
                      )}
                    </td>
                    <td>
                      {formatDateTime(
                        reservation.returnDate,
                        reservation.returnTime
                      )}
                    </td>
                    <td>
                      <StatusBadge color={getStatusColor(reservation.status)}>
                        {statusOptions.find(
                          (opt) => opt.value === reservation.status
                        )?.label || reservation.status}
                      </StatusBadge>
                    </td>
                    <td>{formatPrice(reservation.totalAmount)}</td>
                    <td>
                      <ActionButtons>
                        <ActionButton
                          onClick={() => viewReservationDetails(reservation.id)}
                          title="상세보기"
                        >
                          <FiEye />
                          <span>상세</span>
                        </ActionButton>
                        <ActionButton
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setEditingStatus(true);
                          }}
                          title="상태변경"
                          color="#3b82f6"
                        >
                          <FiEdit />
                          <span>수정</span>
                        </ActionButton>
                        <ActionButton
                          onClick={() => deleteReservation(reservation.id)}
                          title="삭제"
                          color="#ef4444"
                        >
                          <FiTrash2 />
                          <span>삭제</span>
                        </ActionButton>
                      </ActionButtons>
                    </td>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {/* 예약 상세 모달 */}
      {showModal && selectedReservation && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>예약 상세 정보</h3>
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
              <h3>예약 상태 변경</h3>
              <CloseButton onClick={() => setEditingStatus(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <p>예약 #{selectedReservation.id}의 상태를 변경하시겠습니까?</p>
              <p>
                현재 상태:{' '}
                <strong>
                  {
                    statusOptions.find(
                      (opt) => opt.value === selectedReservation.status
                    )?.label
                  }
                </strong>
              </p>

              <StatusSelectContainer>
                <label>새로운 상태:</label>
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
    </Container>
  );
};

// 스타일 컴포넌트들
const Container = styled.div`
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin: 0;
  color: #1f2937;
  font-size: 1.875rem;
  font-weight: 700;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 300px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: #6b7280;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  color: #6b7280;
  z-index: 1;
`;

const FilterSelect = styled.select`
  padding: 12px 12px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin: 20px 0;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9fafb;

  th {
    padding: 16px 12px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
  }
`;

const TableRow = styled.tr`
  &:hover {
    background: #f9fafb;
  }

  td {
    padding: 16px 12px;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: middle;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => props.color}20;
  color: ${(props) => props.color};
  border: 1px solid ${(props) => props.color}40;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 80px; // 32px에서 80px로 확장
  height: 32px;
  padding: 0 12px; // 패딩 추가
  border: none;
  border-radius: 6px;
  background: ${(props) => props.color || '#6b7280'};
  color: white;
  cursor: pointer;
  font-size: 12px; // 폰트 크기 약간 줄임
  font-weight: 500;
  white-space: nowrap; // 텍스트 줄바꿈 방지

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 14px;
    height: 14px;
  }

  // 모바일에서는 아이콘만 표시
  @media (max-width: 768px) {
    min-width: 32px;
    padding: 0;

    span {
      display: none;
    }
  }
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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    color: #1f2937;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;

  &:hover {
    color: #374151;
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
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
`;

const StatusSelectContainer = styled.div`
  margin-top: 16px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #374151;
  }
`;

const StatusSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export default AdminReservationManagement;
