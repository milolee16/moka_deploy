import { Routes, Route, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import RentalAdminDashboard from './RentalAdminDashboard.jsx';
import AdminReservationManagement from './AdminReservationManagement.jsx';
import AdminUserManagement from './AdminUserManagement.jsx';
import AdminVehicleManagement from './AdminVehicleManagement.jsx';
import AutoMLDashboard from './AutoMLDashboard.jsx'; // ✅ AutoML 대시보드 import

// 임시 컴포넌트
const Placeholder = ({ title }) => (
  <PlaceholderContainer>
    <h2>{title}</h2>
    <p>이 페이지는 현재 개발 중입니다.</p>
  </PlaceholderContainer>
);

function AdminDashboard() {
  return (
    <MobileContainer>
      <MobileNav>
        <NavTitle>MOCA 관리자</NavTitle>
        <TabNavigation>
          <StyledNavLink to="/admin" end>
            대시보드
          </StyledNavLink>
          <StyledNavLink to="/admin/reservations">예약관리</StyledNavLink>
          <StyledNavLink to="/admin/users">사용자</StyledNavLink>
          <StyledNavLink to="/admin/vehicles">차량관리</StyledNavLink>
          <StyledNavLink to="/admin/automl">AutoML</StyledNavLink>
        </TabNavigation>
      </MobileNav>

      <MobileContent>
        <Routes>
          <Route index element={<RentalAdminDashboard />} />
          <Route path="reservations" element={<AdminReservationManagement />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="vehicles" element={<AdminVehicleManagement />} />
          <Route path="automl" element={<AutoMLDashboard />} />{' '}
          {/* ✅ AutoML 라우트 추가 */}
        </Routes>
      </MobileContent>
    </MobileContainer>
  );
}

export default AdminDashboard;

// 기존 스타일 컴포넌트들 (변경 없음)
const MobileContainer = styled.div`
  min-height: 100vh;
  background: #f7f5f3; /* Moca: Light Background */
  display: flex;
  flex-direction: column;
`;

const MobileNav = styled.div`
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(164, 117, 81, 0.15); /* Moca: Shadow */
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #e7e0d9; /* Moca: Beige Border */
`;

const NavTitle = styled.h1`
  margin: 0 0 16px 0;
  color: #5d4037; /* Moca: Dark Brown */
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 1px;
`;

// ✅ 5개 탭을 위한 그리드 수정
const TabNavigation = styled.nav`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 첫 번째 줄: 2개 */
  grid-template-rows: repeat(3, auto); /* 3줄로 배치 */
  gap: 8px;

  /* 5번째 탭(AutoML)을 중앙에 배치 */
  & > *:nth-child(5) {
    grid-column: 1 / -1; /* 전체 너비 사용 */
    justify-self: center;
    max-width: 200px;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(5, 1fr); /* 데스크톱에서는 5개 가로 배치 */
    grid-template-rows: auto;

    & > *:nth-child(5) {
      grid-column: auto;
      justify-self: stretch;
      max-width: none;
    }
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  color: #795548; /* Moca: Medium Brown */
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  text-align: center;
  white-space: nowrap;

  &:hover {
    background: #f5f1ed; /* Moca: Light Brown BG */
    color: #5d4037; /* Moca: Dark Brown */
    border-color: #e7e0d9; /* Moca: Beige Border */
  }

  &.active {
    background: #a47551; /* Moca: Medium-Dark Brown */
    color: #ffffff;
    border-color: #8d5f3b; /* Moca: Darker Brown */
    box-shadow: 0 2px 8px rgba(164, 117, 81, 0.3);
  }

  &:active {
    transform: translateY(1px);
    transition-duration: 0.05s;
  }
`;

const MobileContent = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #f7f5f3; /* Moca: Light Background */
`;

const PlaceholderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  color: #795548; /* Moca: Medium Brown */

  h2 {
    color: #5d4037; /* Moca: Dark Brown */
    margin-bottom: 16px;
  }

  p {
    color: #8d6e63; /* Moca: Light Brown */
  }
`;
