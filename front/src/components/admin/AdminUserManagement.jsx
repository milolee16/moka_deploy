import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiUser,
  FiShield,
} from 'react-icons/fi';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(false);

  // 사용자 역할 옵션
  const roleOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'admin', label: '관리자' },
    { value: 'user', label: '일반사용자' },
  ];

  // 역할별 색상 매핑
  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '#dc2626';
      case 'user':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  // 역할별 아이콘
  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <FiShield />;
      case 'user':
        return <FiUser />;
      default:
        return <FiUser />;
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

  // 사용자 목록 조회
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: 실제 API 호출로 교체
      // const token = localStorage.getItem('accessToken');
      // const response = await fetch('/api/users/admin/all', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // 임시로 가짜 데이터 사용
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

  // 사용자 역할 변경
  const updateUserRole = async (userId, newRole) => {
    try {
      // TODO: 실제 API 호출로 교체
      // const token = localStorage.getItem('accessToken');
      // const response = await fetch(`/api/users/admin/${userId}/role`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ role: newRole })
      // });

      // 임시로 로컬 상태 업데이트
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

  // 사용자 삭제
  const deleteUser = async (userId) => {
    if (!confirm(`정말로 사용자 '${userId}'를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // TODO: 실제 API 호출로 교체
      // const token = localStorage.getItem('accessToken');
      // const response = await fetch(`/api/users/admin/${userId}`, {
      //   method: 'DELETE',
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // 임시로 로컬 상태 업데이트
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

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container>
      <Header>
        <Title>사용자 관리</Title>
        <RefreshButton onClick={fetchUsers} disabled={loading}>
          <FiRefreshCw />
          새로고침
        </RefreshButton>
      </Header>

      <FilterSection>
        <SearchContainer>
          <SearchIcon>
            <FiSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="사용자 ID 또는 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <FilterContainer>
          <FilterIcon>
            <FiFilter />
          </FilterIcon>
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
      </FilterSection>

      {loading && <LoadingMessage>사용자 목록을 불러오는 중...</LoadingMessage>}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && !error && (
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <th>사용자 ID</th>
                <th>이름</th>
                <th>권한</th>
                <th>작업</th>
              </tr>
            </TableHeader>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: 'center', padding: '20px' }}
                  >
                    사용자 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <td>
                      <UserIdCell>
                        {getRoleIcon(user.userRole)}
                        {user.userId}
                      </UserIdCell>
                    </td>
                    <td>{user.userName}</td>
                    <td>
                      <RoleBadge color={getRoleColor(user.userRole)}>
                        {roleOptions.find((opt) => opt.value === user.userRole)
                          ?.label || user.userRole}
                      </RoleBadge>
                    </td>
                    <td>
                      <ActionButtons>
                        <ActionButton
                          onClick={() => viewUserDetails(user)}
                          title="상세보기"
                        >
                          <FiEye />
                          <span>상세</span>
                        </ActionButton>
                        <ActionButton
                          onClick={() => {
                            setSelectedUser(user);
                            setEditingRole(true);
                          }}
                          title="권한변경"
                          color="#3b82f6"
                        >
                          <FiEdit />
                          <span>권한</span>
                        </ActionButton>
                        <ActionButton
                          onClick={() => deleteUser(user.userId)}
                          title="삭제"
                          color="#ef4444"
                          disabled={user.userRole === 'admin'} // 관리자는 삭제 불가
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

      {/* 사용자 상세 모달 */}
      {showModal && selectedUser && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>사용자 상세 정보</h3>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <DetailGrid>
                <DetailItem>
                  <DetailLabel>사용자 ID</DetailLabel>
                  <DetailValue>{selectedUser.userId}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>이름</DetailLabel>
                  <DetailValue>{selectedUser.userName}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>권한</DetailLabel>
                  <DetailValue>
                    <RoleBadge color={getRoleColor(selectedUser.userRole)}>
                      {getRoleIcon(selectedUser.userRole)}
                      {roleOptions.find(
                        (opt) => opt.value === selectedUser.userRole
                      )?.label || selectedUser.userRole}
                    </RoleBadge>
                  </DetailValue>
                </DetailItem>
              </DetailGrid>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 권한 변경 모달 */}
      {editingRole && selectedUser && (
        <Modal onClick={() => setEditingRole(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>사용자 권한 변경</h3>
              <CloseButton onClick={() => setEditingRole(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <p>사용자 '{selectedUser.userId}'의 권한을 변경하시겠습니까?</p>
              <p>
                현재 권한:{' '}
                <strong>
                  {
                    roleOptions.find(
                      (opt) => opt.value === selectedUser.userRole
                    )?.label
                  }
                </strong>
              </p>

              <RoleSelectContainer>
                <label>새로운 권한:</label>
                <RoleSelect
                  defaultValue={selectedUser.userRole}
                  onChange={(e) => {
                    if (e.target.value !== selectedUser.userRole) {
                      updateUserRole(selectedUser.userId, e.target.value);
                    }
                  }}
                >
                  {roleOptions
                    .filter((opt) => opt.value !== 'ALL')
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

const UserIdCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;

  svg {
    width: 16px;
    height: 16px;
    color: #6b7280;
  }
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => props.color}20;
  color: ${(props) => props.color};
  border: 1px solid ${(props) => props.color}40;

  svg {
    width: 12px;
    height: 12px;
  }
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
  min-width: 80px;
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 6px;
  background: ${(props) =>
    props.disabled ? '#d1d5db' : props.color || '#6b7280'};
  color: white;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  &:hover {
    opacity: ${(props) => (props.disabled ? 1 : 0.8)};
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
  max-width: 500px;
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
  grid-template-columns: 1fr;
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

const RoleSelectContainer = styled.div`
  margin-top: 16px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #374151;
  }
`;

const RoleSelect = styled.select`
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

export default AdminUserManagement;
