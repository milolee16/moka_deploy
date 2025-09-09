import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AdminVehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    carName: '',
    carNumber: '',
    vehicleTypeCode: 'FULLSIZE',
    status: 'AVAILABLE',
    rentPricePer10min: '',
    imageUrl: '',
  });

  // 차량 상태 옵션 (기존과 동일)
  const statusOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'AVAILABLE', label: '이용가능' },
    { value: 'RENTED', label: '대여중' },
    { value: 'MAINTENANCE', label: '정비중' },
  ];

  // 차량 타입 옵션 (기존과 동일)
  const typeOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'COMPACT', label: '소형차' },
    { value: 'MIDSIZE', label: '중형차' },
    { value: 'FULLSIZE', label: '대형차' },
    { value: 'SUV', label: 'SUV' },
    { value: 'VAN', label: '승합차' },
    { value: 'EV', label: '전기차' },
  ];

  // 상태별 색상 매핑 (Moca 테마)
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return '#10b981';
      case 'RENTED':
        return '#f59e0b';
      case 'MAINTENANCE':
        return '#ef4444';
      default:
        return '#795548'; // Moca: Medium Brown
    }
  };

  // 차량 타입별 아이콘
  const getTypeIcon = (type) => {
    switch (type) {
      case 'SUV':
      case 'VAN':
        return '🚙';
      case 'EV':
        return '⚡';
      case 'COMPACT':
        return '🚗';
      case 'MIDSIZE':
        return '🚘';
      case 'FULLSIZE':
        return '🚙';
      default:
        return '🚗';
    }
  };

  // 가격 포맷팅 (기존과 동일)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  // 차량 목록 조회 (기존 API 로직)
  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const url = `/api/cars${
        params.toString() ? '?' + params.toString() : ''
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('차량 목록 조회에 실패했습니다.');
      }

      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  // 차량 추가 (기존 API 로직)
  const addVehicle = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/cars/admin', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVehicle),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const addedVehicle = await response.json();
      setVehicles((prev) => [...prev, addedVehicle]);
      setShowAddModal(false);
      setNewVehicle({
        carName: '',
        carNumber: '',
        vehicleTypeCode: 'FULLSIZE',
        status: 'AVAILABLE',
        rentPricePer10min: '',
        imageUrl: '',
      });
      alert('차량이 성공적으로 등록되었습니다.');
    } catch (err) {
      alert(err.message);
      console.error('Error adding vehicle:', err);
    }
  };

  // 차량 수정 (기존 API 로직)
  const updateVehicle = async (id, updatedData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/cars/admin/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const updatedVehicle = await response.json();
      setVehicles((prev) =>
        prev.map((vehicle) => (vehicle.id === id ? updatedVehicle : vehicle))
      );
      setShowModal(false);
      setSelectedVehicle(null);
      setEditingVehicle(false);
      alert('차량 정보가 성공적으로 수정되었습니다.');
    } catch (err) {
      alert(err.message);
      console.error('Error updating vehicle:', err);
    }
  };

  // 차량 삭제 (기존 API 로직)
  const deleteVehicle = async (id) => {
    if (!confirm('정말로 이 차량을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/cars/admin/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
      setShowModal(false);
      setSelectedVehicle(null);
      alert('차량이 성공적으로 삭제되었습니다.');
    } catch (err) {
      alert(err.message);
      console.error('Error deleting vehicle:', err);
    }
  };

  // 차량 상세 조회
  const viewVehicleDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  // 필터링된 차량 목록 (기존 로직)
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.carName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.carNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || vehicle.status === statusFilter;
    const matchesType =
      typeFilter === 'ALL' || vehicle.vehicleTypeCode === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <MobileContainer>
        <PageHeader>
          <PageTitle>차량 관리</PageTitle>
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
        <PageTitle>차량 관리</PageTitle>
        <TotalCount>총 {filteredVehicles.length}대</TotalCount>
      </PageHeader>

      <FilterSection>
        <SearchContainer>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput
            type="text"
            placeholder="차량명 또는 번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <FilterRow>
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

          <FilterContainer>
            <FilterIcon>🚗</FilterIcon>
            <FilterSelect
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </FilterContainer>
        </FilterRow>

        <ActionRow>
          <AddButton onClick={() => setShowAddModal(true)}>
            ➕ 차량 추가
          </AddButton>
          <RefreshButton onClick={fetchVehicles} disabled={loading}>
            🔄 새로고침
          </RefreshButton>
        </ActionRow>
      </FilterSection>

      {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}

      <VehicleList>
        {filteredVehicles.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🚗</EmptyIcon>
            <EmptyText>조건에 맞는 차량이 없습니다</EmptyText>
          </EmptyState>
        ) : (
          filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id}>
              <CardHeader>
                <VehicleInfo>
                  <VehicleName>{vehicle.carName}</VehicleName>
                  <VehicleNumber>{vehicle.carNumber}</VehicleNumber>
                  <VehicleType>
                    {getTypeIcon(vehicle.vehicleTypeCode)}{' '}
                    {
                      typeOptions.find(
                        (t) => t.value === vehicle.vehicleTypeCode
                      )?.label
                    }
                  </VehicleType>
                </VehicleInfo>
                <StatusBadge color={getStatusColor(vehicle.status)}>
                  {statusOptions.find((s) => s.value === vehicle.status)?.label}
                </StatusBadge>
              </CardHeader>

              <PriceInfo>
                <PriceIcon>💰</PriceIcon>
                <Price>{formatPrice(vehicle.rentPricePer10min)} / 10분</Price>
              </PriceInfo>

              <ActionButtons>
                <ActionButton onClick={() => viewVehicleDetails(vehicle)}>
                  📄 상세
                </ActionButton>
                <ActionButton
                  primary
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setEditingVehicle(true);
                    setShowModal(true);
                  }}
                >
                  ✏️ 수정
                </ActionButton>
                <ActionButton danger onClick={() => deleteVehicle(vehicle.id)}>
                  🗑️ 삭제
                </ActionButton>
              </ActionButtons>
            </VehicleCard>
          ))
        )}
      </VehicleList>

      {/* 차량 상세/수정 모달 */}
      {showModal && selectedVehicle && (
        <Modal
          onClick={() => {
            setShowModal(false);
            setSelectedVehicle(null);
            setEditingVehicle(false);
          }}
        >
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingVehicle ? '차량 정보 수정' : '차량 상세 정보'}
              </ModalTitle>
              <CloseButton
                onClick={() => {
                  setShowModal(false);
                  setSelectedVehicle(null);
                  setEditingVehicle(false);
                }}
              >
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              {editingVehicle ? (
                <EditForm>
                  <FormField>
                    <FormLabel>차량명</FormLabel>
                    <FormInput
                      value={selectedVehicle.carName}
                      onChange={(e) =>
                        setSelectedVehicle({
                          ...selectedVehicle,
                          carName: e.target.value,
                        })
                      }
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>차량번호</FormLabel>
                    <FormInput
                      value={selectedVehicle.carNumber}
                      onChange={(e) =>
                        setSelectedVehicle({
                          ...selectedVehicle,
                          carNumber: e.target.value,
                        })
                      }
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>차량타입</FormLabel>
                    <FormSelect
                      value={selectedVehicle.vehicleTypeCode}
                      onChange={(e) =>
                        setSelectedVehicle({
                          ...selectedVehicle,
                          vehicleTypeCode: e.target.value,
                        })
                      }
                    >
                      {typeOptions
                        .filter((t) => t.value !== 'ALL')
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </FormSelect>
                  </FormField>
                  <FormField>
                    <FormLabel>상태</FormLabel>
                    <FormSelect
                      value={selectedVehicle.status}
                      onChange={(e) =>
                        setSelectedVehicle({
                          ...selectedVehicle,
                          status: e.target.value,
                        })
                      }
                    >
                      {statusOptions
                        .filter((s) => s.value !== 'ALL')
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </FormSelect>
                  </FormField>
                  <FormField>
                    <FormLabel>요금 (10분당)</FormLabel>
                    <FormInput
                      type="number"
                      value={
                        selectedVehicle.rentPricePer10min ||
                        selectedVehicle.price ||
                        ''
                      }
                      onChange={(e) =>
                        setSelectedVehicle({
                          ...selectedVehicle,
                          rentPricePer10min: e.target.value,
                        })
                      }
                    />
                  </FormField>
                  <SaveButton
                    onClick={() =>
                      updateVehicle(selectedVehicle.id, selectedVehicle)
                    }
                  >
                    💾 저장
                  </SaveButton>
                </EditForm>
              ) : (
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>차량명</DetailLabel>
                    <DetailValue>{selectedVehicle.carName}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>차량번호</DetailLabel>
                    <DetailValue>{selectedVehicle.carNumber}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>차량타입</DetailLabel>
                    <DetailValue>
                      {getTypeIcon(selectedVehicle.vehicleTypeCode)}{' '}
                      {
                        typeOptions.find(
                          (t) => t.value === selectedVehicle.vehicleTypeCode
                        )?.label
                      }
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>상태</DetailLabel>
                    <DetailValue>
                      <StatusBadge
                        color={getStatusColor(selectedVehicle.status)}
                      >
                        {
                          statusOptions.find(
                            (s) => s.value === selectedVehicle.status
                          )?.label
                        }
                      </StatusBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>요금</DetailLabel>
                    <DetailValue>
                      {formatPrice(selectedVehicle.rentPricePer10min)} / 10분
                    </DetailValue>
                  </DetailItem>
                </DetailGrid>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 차량 추가 모달 */}
      {showAddModal && (
        <Modal onClick={() => setShowAddModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>새 차량 추가</ModalTitle>
              <CloseButton onClick={() => setShowAddModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <EditForm>
                <FormField>
                  <FormLabel>차량명</FormLabel>
                  <FormInput
                    value={newVehicle.carName}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, carName: e.target.value })
                    }
                    placeholder="예: 현대 아반떼"
                  />
                </FormField>
                <FormField>
                  <FormLabel>차량번호</FormLabel>
                  <FormInput
                    value={newVehicle.carNumber}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        carNumber: e.target.value,
                      })
                    }
                    placeholder="예: 12가3456"
                  />
                </FormField>
                <FormField>
                  <FormLabel>차량타입</FormLabel>
                  <FormSelect
                    value={newVehicle.vehicleTypeCode}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        vehicleTypeCode: e.target.value,
                      })
                    }
                  >
                    {typeOptions
                      .filter((t) => t.value !== 'ALL')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </FormSelect>
                </FormField>
                <FormField>
                  <FormLabel>요금 (10분당)</FormLabel>
                  <FormInput
                    type="number"
                    value={newVehicle.rentPricePer10min}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        rentPricePer10min: e.target.value,
                      })
                    }
                    placeholder="예: 5000"
                  />
                </FormField>
                <SaveButton onClick={addVehicle}>➕ 차량 추가</SaveButton>
              </EditForm>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </MobileContainer>
  );
};

export default AdminVehicleManagement;

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

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const AddButton = styled.button`
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
`;

const RefreshButton = styled.button`
  padding: 12px 16px;
  background: #f5f1ed; /* Moca: Light Brown BG */
  color: #5d4037; /* Moca: Dark Brown */
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #e7e0d9; /* Moca: Beige Border */
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
  height: 150px;
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

const VehicleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const VehicleCard = styled.div`
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

const VehicleInfo = styled.div`
  flex: 1;
`;

const VehicleName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #5d4037; /* Moca: Dark Brown */
  margin-bottom: 4px;
`;

const VehicleNumber = styled.div`
  font-size: 0.9rem;
  color: #795548; /* Moca: Medium Brown */
  margin-bottom: 4px;
  font-weight: 500;
`;

const VehicleType = styled.div`
  font-size: 0.85rem;
  color: #a47551; /* Moca: Primary */
  font-weight: 500;
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

const PriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f1ed; /* Moca: Light Brown BG */
  border-radius: 12px;
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
  grid-template-columns: 1fr;
  gap: 16px;
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

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #5d4037; /* Moca: Dark Brown */
`;

const FormInput = styled.input`
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

const FormSelect = styled.select`
  padding: 12px;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #5d4037; /* Moca: Dark Brown */
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #a47551; /* Moca: Primary */
    box-shadow: 0 0 0 3px rgba(164, 117, 81, 0.1); /* Moca: Shadow */
  }
`;

const SaveButton = styled.button`
  padding: 12px 16px;
  background: #a47551; /* Moca: Primary */
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
  margin-top: 8px;

  &:hover {
    background: #795548; /* Moca: Medium Brown */
    transform: translateY(-1px);
  }
`;
