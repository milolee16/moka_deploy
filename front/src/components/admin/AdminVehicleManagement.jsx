import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiPlus,
  FiTruck,
  FiZap,
  FiCircle,
} from 'react-icons/fi';

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
    rentPricePer10Min: '',
    imageUrl: '',
  });

  // 차량 상태 옵션
  const statusOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'AVAILABLE', label: '이용가능' },
    { value: 'RENTED', label: '대여중' },
    { value: 'MAINTENANCE', label: '정비중' },
  ];

  // 차량 타입 옵션
  const typeOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'COMPACT', label: '소형차' },
    { value: 'MIDSIZE', label: '중형차' },
    { value: 'FULLSIZE', label: '대형차' },
    { value: 'SUV', label: 'SUV' },
    { value: 'VAN', label: '승합차' },
    { value: 'EV', label: '전기차' },
  ];

  // 상태별 색상 매핑
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return '#10b981';
      case 'RENTED':
        return '#f59e0b';
      case 'MAINTENANCE':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // 차량 타입별 아이콘
  const getTypeIcon = (type) => {
    switch (type) {
      case 'SUV':
      case 'VAN':
        return <FiTruck />;
      case 'EV':
        return <FiZap />;
      default:
        return <FiCircle />;
    }
  };

  // 가격 포맷팅
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

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
      // newVehicle 초기화...
      alert('차량이 성공적으로 등록되었습니다.');
    } catch (err) {
      alert(err.message);
      console.error('Error adding vehicle:', err);
    }
  };

  // 차량 수정
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
      // 모달 상태 업데이트...
      alert('차량 정보가 성공적으로 수정되었습니다.');
    } catch (err) {
      alert(err.message);
      console.error('Error updating vehicle:', err);
    }
  };

  // 차량 삭제
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
      // 모달 닫기 로직...
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

  // 필터링된 차량 목록
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.carNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || vehicle.status === statusFilter;
    const matchesType =
      typeFilter === 'ALL' || vehicle.vehicleTypeCode === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <Container>
      <Header>
        <Title>차량 관리</Title>
        <ButtonGroup>
          <AddButton onClick={() => setShowAddModal(true)}>
            <FiPlus />
            차량 추가
          </AddButton>
          <RefreshButton onClick={fetchVehicles} disabled={loading}>
            <FiRefreshCw />
            새로고침
          </RefreshButton>
        </ButtonGroup>
      </Header>

      <FilterSection>
        <SearchContainer>
          <SearchIcon>
            <FiSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="차량명 또는 번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <FilterGroup>
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

          <FilterContainer>
            <FilterIcon>
              <FiFilter />
            </FilterIcon>
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
        </FilterGroup>
      </FilterSection>

      {loading && <LoadingMessage>차량 목록을 불러오는 중...</LoadingMessage>}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && !error && (
        <VehicleGrid>
          {filteredVehicles.length === 0 ? (
            <EmptyMessage>차량 데이터가 없습니다.</EmptyMessage>
          ) : (
            filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id}>
                <VehicleImage
                  src={vehicle.imageUrl}
                  alt={vehicle.carName}
                  onError={(e) => {
                    e.target.src = '/assets/placeholder-car.jpg'; // 기본 이미지
                  }}
                />
                <VehicleInfo>
                  <VehicleHeader>
                    <VehicleName>{vehicle.carName}</VehicleName>
                    <StatusBadge color={getStatusColor(vehicle.status)}>
                      {
                        statusOptions.find(
                          (opt) => opt.value === vehicle.status
                        )?.label
                      }
                    </StatusBadge>
                  </VehicleHeader>

                  <VehicleDetails>
                    <DetailRow>
                      <DetailIcon>
                        {getTypeIcon(vehicle.vehicleTypeCode)}
                      </DetailIcon>
                      <DetailText>{vehicle.carNumber}</DetailText>
                    </DetailRow>
                    <DetailRow>
                      <DetailText>
                        {
                          typeOptions.find(
                            (opt) => opt.value === vehicle.vehicleTypeCode
                          )?.label
                        }
                      </DetailText>
                    </DetailRow>
                    <PriceRow>
                      <PriceText>
                        {formatPrice(vehicle.rentPricePer10Min)}/10분
                      </PriceText>
                    </PriceRow>
                  </VehicleDetails>

                  <ActionButtons>
                    <ActionButton
                      onClick={() => viewVehicleDetails(vehicle)}
                      title="상세보기"
                    >
                      <FiEye />
                      <span>상세</span>
                    </ActionButton>
                    <ActionButton
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setEditingVehicle(true);
                      }}
                      title="수정"
                      color="#3b82f6"
                    >
                      <FiEdit />
                      <span>수정</span>
                    </ActionButton>
                    <ActionButton
                      onClick={() => deleteVehicle(vehicle.id)}
                      title="삭제"
                      color="#ef4444"
                    >
                      <FiTrash2 />
                      <span>삭제</span>
                    </ActionButton>
                  </ActionButtons>
                </VehicleInfo>
              </VehicleCard>
            ))
          )}
        </VehicleGrid>
      )}

      {/* 차량 상세 모달 */}
      {showModal && selectedVehicle && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>차량 상세 정보</h3>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <VehicleImageLarge
                src={selectedVehicle.imageUrl}
                alt={selectedVehicle.carName}
                onError={(e) => {
                  e.target.src = '/assets/placeholder-car.jpg';
                }}
              />
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
                    {
                      typeOptions.find(
                        (opt) => opt.value === selectedVehicle.vehicleTypeCode
                      )?.label
                    }
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>상태</DetailLabel>
                  <DetailValue>
                    <StatusBadge color={getStatusColor(selectedVehicle.status)}>
                      {
                        statusOptions.find(
                          (opt) => opt.value === selectedVehicle.status
                        )?.label
                      }
                    </StatusBadge>
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>10분당 요금</DetailLabel>
                  <DetailValue>
                    {formatPrice(selectedVehicle.rentPricePer10Min)}
                  </DetailValue>
                </DetailItem>
              </DetailGrid>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 차량 추가 모달 */}
      {showAddModal && (
        <Modal onClick={() => setShowAddModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>새 차량 등록</h3>
              <CloseButton onClick={() => setShowAddModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGrid>
                <FormItem>
                  <FormLabel>차량명 *</FormLabel>
                  <FormInput
                    type="text"
                    value={newVehicle.carName}
                    onChange={(e) =>
                      setNewVehicle((prev) => ({
                        ...prev,
                        carName: e.target.value,
                      }))
                    }
                    placeholder="예: 람보르기니 우라칸"
                  />
                </FormItem>
                <FormItem>
                  <FormLabel>차량번호 *</FormLabel>
                  <FormInput
                    type="text"
                    value={newVehicle.carNumber}
                    onChange={(e) =>
                      setNewVehicle((prev) => ({
                        ...prev,
                        carNumber: e.target.value,
                      }))
                    }
                    placeholder="예: 98가2803"
                  />
                </FormItem>
                <FormItem>
                  <FormLabel>차량타입 *</FormLabel>
                  <FormSelect
                    value={newVehicle.vehicleTypeCode}
                    onChange={(e) =>
                      setNewVehicle((prev) => ({
                        ...prev,
                        vehicleTypeCode: e.target.value,
                      }))
                    }
                  >
                    {typeOptions
                      .filter((opt) => opt.value !== 'ALL')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </FormSelect>
                </FormItem>
                <FormItem>
                  <FormLabel>상태 *</FormLabel>
                  <FormSelect
                    value={newVehicle.status}
                    onChange={(e) =>
                      setNewVehicle((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    {statusOptions
                      .filter((opt) => opt.value !== 'ALL')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </FormSelect>
                </FormItem>
                <FormItem>
                  <FormLabel>10분당 요금 (원) *</FormLabel>
                  <FormInput
                    type="number"
                    value={newVehicle.rentPricePer10Min}
                    onChange={(e) =>
                      setNewVehicle((prev) => ({
                        ...prev,
                        rentPricePer10Min: e.target.value,
                      }))
                    }
                    placeholder="예: 25000"
                  />
                </FormItem>
                <FormItem>
                  <FormLabel>이미지 URL</FormLabel>
                  <FormInput
                    type="text"
                    value={newVehicle.imageUrl}
                    onChange={(e) =>
                      setNewVehicle((prev) => ({
                        ...prev,
                        imageUrl: e.target.value,
                      }))
                    }
                    placeholder="예: /assets/cars/vehicle.jpg"
                  />
                </FormItem>
              </FormGrid>
              <FormActions>
                <CancelButton onClick={() => setShowAddModal(false)}>
                  취소
                </CancelButton>
                <SubmitButton
                  onClick={addVehicle}
                  disabled={
                    !newVehicle.carName ||
                    !newVehicle.carNumber ||
                    !newVehicle.rentPricePer10Min
                  }
                >
                  등록
                </SubmitButton>
              </FormActions>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 차량 수정 모달 */}
      {editingVehicle && selectedVehicle && (
        <Modal onClick={() => setEditingVehicle(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>차량 정보 수정</h3>
              <CloseButton onClick={() => setEditingVehicle(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <p>차량 '{selectedVehicle.carName}'의 정보를 수정하시겠습니까?</p>

              <EditForm>
                <FormItem>
                  <FormLabel>상태</FormLabel>
                  <FormSelect
                    defaultValue={selectedVehicle.status}
                    onChange={(e) => {
                      if (e.target.value !== selectedVehicle.status) {
                        updateVehicle(selectedVehicle.id, {
                          status: e.target.value,
                        });
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
                  </FormSelect>
                </FormItem>
              </EditForm>
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #059669;
  }
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

const FilterGroup = styled.div`
  display: flex;
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

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const EmptyMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  font-size: 16px;
`;

const VehicleCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const VehicleImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: #f3f4f6;
`;

const VehicleInfo = styled.div`
  padding: 20px;
`;

const VehicleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const VehicleName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const VehicleDetails = styled.div`
  margin-bottom: 16px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const DetailIcon = styled.div`
  color: #6b7280;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DetailText = styled.span`
  color: #4b5563;
  font-size: 14px;
`;

const PriceRow = styled.div`
  margin-top: 12px;
`;

const PriceText = styled.span`
  color: #059669;
  font-size: 16px;
  font-weight: 600;
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
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border: none;
  border-radius: 6px;
  background: ${(props) => props.color || '#6b7280'};
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 14px;
    height: 14px;
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

const VehicleImageLarge = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
  background: #f3f4f6;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const FormInput = styled.input`
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FormSelect = styled.select`
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

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #f9fafb;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: ${(props) => (props.disabled ? '#d1d5db' : '#10b981')};
  color: white;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 14px;

  &:hover {
    background: ${(props) => (props.disabled ? '#d1d5db' : '#059669')};
  }
`;

const EditForm = styled.div`
  margin-top: 16px;
`;

export default AdminVehicleManagement;
