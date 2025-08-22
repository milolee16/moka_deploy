import { Routes, Route, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Statistics from './Statistics.jsx';

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
                        통계
                    </StyledNavLink>
                    <StyledNavLink to="/admin/reservations">예약 관리</StyledNavLink>
                    <StyledNavLink to="/admin/users">사용자 관리</StyledNavLink>
                    <StyledNavLink to="/admin/vehicles">차량 관리</StyledNavLink>
                </NavigationContainer>
            </Sidebar>
            <Content>
                <Routes>
                    <Route index element={<Statistics />} />
                    <Route
                        path="reservations"
                        element={<Placeholder title="예약 관리" />}
                    />
                    <Route path="users" element={<Placeholder title="사용자 관리" />} />
                    <Route path="vehicles" element={<Placeholder title="차량 관리" />} />
                </Routes>
            </Content>
        </DashboardContainer>
    );
}

export default AdminDashboard;

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
        margin-bottom: 16px;
    }
`;

const NavigationContainer = styled.nav`
    display: flex;
    gap: 6px;

    @media (max-width: 768px) {
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding-bottom: 4px;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    @media (min-width: 769px) {
        flex-direction: column;
        gap: 8px;
    }
`;

const StyledNavLink = styled(NavLink)`
    padding: 10px 14px;
    border-radius: 8px;
    text-decoration: none;
    color: #795548;
    font-weight: 500;
    transition: background-color 0.2s, color 0.2s;
    white-space: nowrap;
    font-size: 0.9rem;

    @media (max-width: 768px) {
        font-size: 0.85rem;
        padding: 8px 12px;
        min-width: fit-content;
    }

    @media (min-width: 769px) {
        padding: 12px 16px;
        font-size: 0.95rem;
    }

    &:hover {
        background-color: #f5f1ed;
    }

    &.active {
        background-color: #5d4037;
        color: white;
        font-weight: bold;
    }
`;

const Content = styled.main`
    flex: 1;
    min-width: 0;
    width: 350px;
`;

const PlaceholderContainer = styled.div`
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e7e0d9;
  color: #757575;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }

  h2 {
    color: #5d4037;
    font-size: 1.3rem;
    margin-bottom: 8px;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }
  
  p {
    margin: 0;
    font-size: 0.95rem;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }
`;