import { Routes, Route, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import RentalAdminDashboard from './RentalAdminDashboard.jsx';
import AdminReservationManagement from './AdminReservationManagement.jsx';
import AdminUserManagement from './AdminUserManagement.jsx';
import AdminVehicleManagement from './AdminVehicleManagement.jsx';

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
            📊 대시보드
          </StyledNavLink>
          <StyledNavLink to="/admin/reservations">📅 예약관리</StyledNavLink>
          <StyledNavLink to="/admin/users">👥 사용자</StyledNavLink>
          <StyledNavLink to="/admin/vehicles">🚗 차량관리</StyledNavLink>
        </TabNavigation>
      </MobileNav>

      <MobileContent>
        <Routes>
          <Route index element={<RentalAdminDashboard />} />
          <Route path="reservations" element={<AdminReservationManagement />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="vehicles" element={<AdminVehicleManagement />} />
        </Routes>
      </MobileContent>
    </MobileContainer>
  );
}

export default AdminDashboard;

// Moca Color Scheme Mobile-First Styled Components
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

const TabNavigation = styled.nav`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  color: #795548; /* Moca: Medium Brown */
  text-decoration: none;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s;
  background: #f5f1ed; /* Moca: Light Brown BG */
  border: 2px solid transparent;
  text-align: center;

  &:hover {
    background: #e7e0d9; /* Moca: Beige Border */
    color: #5d4037; /* Moca: Dark Brown */
  }

  &.active {
    background: #a47551; /* Moca: Primary */
    color: white;
    border-color: #795548; /* Moca: Medium Brown */
    box-shadow: 0 4px 12px rgba(164, 117, 81, 0.35); /* Moca: Shadow */
  }
`;

const MobileContent = styled.main`
  flex: 1;
  padding: 16px;
  max-width: 100%;
  overflow-x: hidden;
`;

const PlaceholderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  color: #795548; /* Moca: Medium Brown */
  background: white;
  border-radius: 16px;
  padding: 32px 16px;
  margin: 16px 0;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */

  h2 {
    margin-bottom: 8px;
    color: #5d4037; /* Moca: Dark Brown */
    font-size: 1.2rem;
  }

  p {
    font-size: 0.9rem;
  }
`;
