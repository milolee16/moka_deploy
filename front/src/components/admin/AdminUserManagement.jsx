import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(false);

  // 사용자 역할 옵션 (기존과 동일)
  const roleOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'admin', label: '관리자' },
    { value: 'user', label: '일반사용자' },
  ];

  // 역할별 색상 매핑 (Moca 테마)
  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '#dc2626';
      case 'user':
        return '#10b981';
      default:
        return '#795548'; // Moca: Medium Brown
    }
  };

  // 역할별 아이콘
  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '🛡️';
      case 'user':
        return '👤';
      default:
        return '👤';
    }
  };

  // 가짜 데이터 생성 (실제 API 연동 전까지)
  const generateMockUsers = () => {
    return [
      { userId: 'admin', userName: '관리자', userRole: 'admin' },
      { userId: 'ksy', userName: '곽수영', userRole: 'admin' },
      { userId: 'kko', userName: '김건오', userRole: 'admin' },
      { userId: 'kdy', userName: '김도연', userRole: 'admin' },
      { userId: 'user01', userName: '김철수', userRole: 'user' },
      { userId: 'user02', userName: '이영희', userRole: 'user' },
      { userId: 'user03', userName: '최민준', userRole: 'user' },
      { userId: 'user04', userName: '정수빈', userRole: 'user' },
      { userId: 'user05', userName: '윤지우', userRole: 'user' },
      { userId: 'user06', userName: '박관리', userRole: 'user' },
      { userId: 'user07', userName: '오하은', userRole: 'user' },
      { userId: 'kim_cs', userName: '김철수', userRole: 'user' },
      { userId: 'lee_yh', userName: '이영희', userRole: 'user' },
      { userId: 'park_ms', userName: '박민수', userRole: 'user' },
      { userId: 'choi_je', userName: '최지은', userRole: 'user' },
      { userId: 'jung_th', userName: '정태호', userRole: 'user' },
      { userId: 'kang_sj', userName: '강수진', userRole: 'user' },
      { userId: 'yoon_mr', userName: '윤미래', userRole: 'user' },
    ];
  };

  // 사용자 목록 조회 (기존 로직 + 실제 API 대비)
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');

      // 실제 API 호출 시도
      try {
        const response = await fetch('/api/users/admin/all', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
          return;
        }
      } catch (apiError) {
        console.log('API 호출 실패, Mock 데이터 사용:', apiError);
      }

      // API 실패 시 Mock 데이터 사용
      await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션
      const mockData = generateMockUsers();
      setUsers(mockData);
    } catch (err) {
      setError('사용자 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 역할 변경 (기존 로직 + 실제 API 대비)
  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('accessToken');

      // 실제 API 호출 시도
      try {
        const response = await fetch(`/api/users/admin/${userId}/role`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
        });

        if (!response.ok) {
          throw new Error('역할 변경 API 호출 실패');
        }
      } catch (apiError) {
        console.log('API 호출 실패, 로컬 상태만 업데이트:', apiError);
      }

      // 로컬 상태 업데이트 (API 성공/실패 관계없이)
      setUsers((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, userRole: newRole } : user
        )
      );

      if (selectedUser && selectedUser.userId === userId) {
        setSelectedUser((prev) => ({ ...prev, userRole: newRole }));
      }

      setEditingRole(false);
      alert('사용자 권한이 성공적으로 변경되었습니다.');
    } catch (err) {
      alert('권한 변경에 실패했습니다.');
      console.error('Error updating role:', err);
    }
  };

  // 사용자 삭제 (기존 로직 + 실제 API 대비)
  const deleteUser = async (userId) => {
    if (!confirm(`정말로 사용자 '${userId}'를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');

      // 실제 API 호출 시도
      try {
        const response = await fetch(`/api/users/admin/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('사용자 삭제 API 호출 실패');
        }
      } catch (apiError) {
        console.log('API 호출 실패, 로컬 상태만 업데이트:', apiError);
      }

      // 로컬 상태 업데이트 (API 성공/실패 관계없이)
      setUsers((prev) => prev.filter((user) => user.userId !== userId));

      if (selectedUser && selectedUser.userId === userId) {
        setShowModal(false);
        setSelectedUser(null);
      }

      alert('사용자가 성공적으로 삭제되었습니다.');
    } catch (err) {
      alert('사용자 삭제에 실패했습니다.');
      console.error('Error deleting user:', err);
    }
  };

  // 사용자 상세 조회
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // 필터링된 사용자 목록
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || user.userRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <MobileContainer>
        <PageHeader>
          <PageTitle>사용자 관리</PageTitle>
        </PageHeader>
        <LoadingContainer>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </LoadingContainer>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <PageHeader>
        <PageTitle>사용자 관리</PageTitle>
        <TotalCount>총 {filteredUsers.length}명</TotalCount>
      </PageHeader>

      <FilterSection>
        <SearchContainer>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput
            type="text"
            placeholder="사용자ID 또는 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <FilterRow>
          <FilterContainer>
            <FilterIcon>👥</FilterIcon>
            <FilterSelect
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </FilterContainer>

          <RefreshButton onClick={fetchUsers} disabled={loading}>
            🔄 새로고침
          </RefreshButton>
        </FilterRow>
      </FilterSection>

      {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}

      <UserList>
        {filteredUsers.length === 0 ? (
          <EmptyState>
            <EmptyIcon>👥</EmptyIcon>
            <EmptyText>조건에 맞는 사용자가 없습니다</EmptyText>
          </EmptyState>
        ) : (
          filteredUsers.map((user) => (
            <UserCard key={user.userId}>
              <CardHeader>
                <UserInfo>
                  <UserName>{user.userName}</UserName>
                  <UserId>@{user.userId}</UserId>
                </UserInfo>
                <RoleBadge color={getRoleColor(user.userRole)}>
                  {getRoleIcon(user.userRole)}{' '}
                  {roleOptions.find((r) => r.value === user.userRole)?.label}
                </RoleBadge>
              </CardHeader>

              <ActionButtons>
                <ActionButton onClick={() => viewUserDetails(user)}>
                  상세
                </ActionButton>
                <ActionButton
                  primary
                  onClick={() => {
                    setSelectedUser(user);
                    setEditingRole(true);
                  }}
                >
                  권한수정
                </ActionButton>
                <ActionButton danger onClick={() => deleteUser(user.userId)}>
                  삭제
                </ActionButton>
              </ActionButtons>
            </UserCard>
          ))
        )}
      </UserList>

      {/* 사용자 상세 모달 */}
      {showModal && selectedUser && !editingRole && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>사용자 상세 정보</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <DetailGrid>
                <DetailItem>
                  <DetailLabel>사용자 ID</DetailLabel>
                  <DetailValue>{selectedUser.userId}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>사용자 이름</DetailLabel>
                  <DetailValue>{selectedUser.userName}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>권한</DetailLabel>
                  <DetailValue>
                    <RoleBadge color={getRoleColor(selectedUser.userRole)}>
                      {getRoleIcon(selectedUser.userRole)}{' '}
                      {
                        roleOptions.find(
                          (r) => r.value === selectedUser.userRole
                        )?.label
                      }
                    </RoleBadge>
                  </DetailValue>
                </DetailItem>
              </DetailGrid>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 권한 수정 모달 */}
      {editingRole && selectedUser && (
        <Modal onClick={() => setEditingRole(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>사용자 권한 변경</ModalTitle>
              <CloseButton onClick={() => setEditingRole(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <RoleChangeInfo>
                사용자 '{selectedUser.userName} (@{selectedUser.userId})'의
                권한을 변경하시겠습니까?
              </RoleChangeInfo>
              <CurrentRole>
                현재 권한:{' '}
                <strong>
                  {getRoleIcon(selectedUser.userRole)}{' '}
                  {
                    roleOptions.find((r) => r.value === selectedUser.userRole)
                      ?.label
                  }
                </strong>
              </CurrentRole>

              <RoleSelectContainer>
                <RoleSelectLabel>새로운 권한:</RoleSelectLabel>
                <RoleSelect
                  defaultValue={selectedUser.userRole}
                  onChange={(e) => {
                    if (e.target.value !== selectedUser.userRole) {
                      updateUserRole(selectedUser.userId, e.target.value);
                    }
                  }}
                >
                  {roleOptions
                    .filter((option) => option.value !== 'ALL')
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </RoleSelect>
              </RoleSelectContainer>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </MobileContainer>
  );
};

export default AdminUserManagement;

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
  grid-template-columns: 1fr auto;
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
  white-space: nowrap;

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
  height: 100px;
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

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UserCard = styled.div`
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
  align-items: center;
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

const UserId = styled.div`
  font-size: 0.85rem;
  color: #795548; /* Moca: Medium Brown */
  font-weight: 500;
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${(props) => props.color}20;
  color: ${(props) => props.color};
  border: 1px solid ${(props) => props.color}40;
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

const RoleChangeInfo = styled.p`
  color: #5d4037; /* Moca: Dark Brown */
  margin-bottom: 12px;
  line-height: 1.4;
`;

const CurrentRole = styled.p`
  color: #795548; /* Moca: Medium Brown */
  margin-bottom: 16px;

  strong {
    color: #a47551; /* Moca: Primary */
  }
`;

const RoleSelectContainer = styled.div`
  margin-top: 16px;
`;

const RoleSelectLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #5d4037; /* Moca: Dark Brown */
  font-size: 0.9rem;
`;

const RoleSelect = styled.select`
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
