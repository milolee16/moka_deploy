import { Routes, Route, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import RentalAdminDashboard from './RentalAdminDashboard.jsx';
import AdminReservationManagement from './AdminReservationManagement.jsx';
import AdminUserManagement from './AdminUserManagement.jsx'; // 새로 추가

// 아직 만들지 않은 페이지를 위한 임시 컴포넌트
const Placeholder = ({ title }) => (
  <PlaceholderContainer>
    <h2>{title}</h2>
    <p>이 페이지는 현재 개발 중입니다.</p>
  </PlaceholderContainer>
);

function AdminDashboard() {
  return (
    <DashboardContainer>
      <Sidebar>
        <SidebarTitle>관리자 메뉴</SidebarTitle>
        <NavigationContainer>
          <StyledNavLink to="/admin" end>
            대시보드
          </StyledNavLink>
          <StyledNavLink to="/admin/reservations">예약 관리</StyledNavLink>
          <StyledNavLink to="/admin/users">사용자 관리</StyledNavLink>
          <StyledNavLink to="/admin/vehicles">차량 관리</StyledNavLink>
        </NavigationContainer>
      </Sidebar>
      <Content>
        <Routes>
          <Route index element={<RentalAdminDashboard />} />
          <Route path="reservations" element={<AdminReservationManagement />} />
          <Route path="users" element={<AdminUserManagement />} />{' '}
          {/* 새로 추가 */}
          <Route path="vehicles" element={<Placeholder title="차량 관리" />} />
        </Routes>
      </Content>
    </DashboardContainer>
  );
}

export default AdminDashboard;

// Styled Components (기존과 동일)
const DashboardContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 16px;
  min-height: 100vh;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  @media (min-width: 769px) {
    gap: 24px;
    padding: 24px;
  }
`;

const Sidebar = styled.aside`
  width: 100%;
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e7e0d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (max-width: 768px) {
    position: sticky;
    top: 12px;
    z-index: 10;
    padding: 12px;
  }

  @media (min-width: 769px) {
    width: 200px;
    flex-shrink: 0;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }
`;

const SidebarTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #5d4037;
  font-size: 1.1rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 8px;
  }

  @media (min-width: 769px) {
    font-size: 1.2rem;
    margin-bottom: 20px;
  }
`;

const NavigationContainer = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }

  @media (min-width: 769px) {
    gap: 12px;
  }
`;

const StyledNavLink = styled(NavLink)`
  display: block;
  padding: 8px 12px;
  color: #6b7280;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #5d4037;
  }

  &.active {
    background: #5d4037;
    color: white;
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 14px;
  }

  @media (min-width: 769px) {
    padding: 12px 16px;
    font-size: 15px;
  }
`;

const Content = styled.main`
  flex: 1;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (min-width: 769px) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }
`;

const PlaceholderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  color: #6b7280;

  h2 {
    margin-bottom: 8px;
    color: #374151;
  }
`;
