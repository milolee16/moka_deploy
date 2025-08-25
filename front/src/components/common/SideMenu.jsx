import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SideMenu = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose(); // 로그아웃 후 메뉴 닫기
  };

  return (
      <>
        <Overlay isOpen={isOpen} onClick={onClose} />
        <MenuContainer isOpen={isOpen}>
          <CloseButton onClick={onClose}>&times;</CloseButton>

          {/* 로그인된 사용자 정보 표시 */}
          {user && (
              <UserInfo>
                <p>
                  <strong>{user.username}</strong>님, 환영합니다.
                </p>
                <p>({user.role})</p>
              </UserInfo>
          )}

          <MenuList>
            {/* 로그인하지 않은 사용자에게는 로그인 메뉴 표시 */}
            {!user && (
                <li>
                  <LoginButton to="/login" onClick={onClose}>
                    로그인
                  </LoginButton>
                </li>
            )}

            {/* 공통 메뉴들 (로그인 여부와 관계없이 표시) */}
            <li>
              <MenuLink to="/home" onClick={onClose}>
                홈
              </MenuLink>
            </li>
            <li>
              <MenuLink to="/reserve" onClick={onClose}>
                예약하기
              </MenuLink>
            </li>
            <li>
              <MenuLink to="/map" onClick={onClose}>
                내 주변 찾기
              </MenuLink>
            </li>

            {/* 로그인된 사용자만 볼 수 있는 메뉴들 */}
            {user && (
                <li>
                  <MenuLink to="/ocr" onClick={onClose}>
                    면허증 등록
                  </MenuLink>
                </li>
            )}

            {/* 관리자만 볼 수 있는 메뉴 */}
            {user?.role === 'admin' && (
                <li>
                  <MenuLink to="/admin" onClick={onClose}>
                    관리자 페이지
                  </MenuLink>
                </li>
            )}
          </MenuList>

          {/* 로그인된 사용자에게만 로그아웃 버튼 표시 */}
          {user && <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>}
        </MenuContainer>
      </>
  );
};

export default SideMenu;

/* ============ styles ============ */
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  z-index: 999;
`;

const MenuContainer = styled.div`
  position: fixed;
  top: 0;
  right: ${({ isOpen }) => (isOpen ? '0' : '-300px')};
  width: 280px;
  height: 100%;
  background-color: #ffffff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease-in-out;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #5d4037;
`;

const UserInfo = styled.div`
  padding-bottom: 16px;
  border-bottom: 1px solid #e7e0d9;
  margin-bottom: 16px;
  color: #5d4037;
  p {
    margin: 4px 0;
  }
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;

// 메뉴 아이템과 버튼에 적용될 공통 스타일
const menuItemStyles = css`
  padding: 12px 0;
  cursor: pointer;
  color: #5d4037;
  font-weight: 500;
  border-radius: 8px;
  text-align: left;
  /* width: 100%; */
  display: block;
  text-decoration: none;
  background: none;
  border: none;
  font-size: 1rem;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const MenuLink = styled(Link)`
  ${menuItemStyles}
`;

const LoginButton = styled(Link)`
  ${menuItemStyles}
  background: linear-gradient(135deg, #5d4037 0%, #795548 100%);
  color: #ffffff !important;
  font-weight: 600;
  margin: 8px 12px 8px 0;
  border-radius: 12px;
  padding: 16px 12px;
  box-shadow: 0 4px 12px rgba(93, 64, 55, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #4a2c20 0%, #5d4037 100%);
    box-shadow: 0 6px 16px rgba(93, 64, 55, 0.4);
    transform: translateY(-1px);
  }
`;

const LogoutButton = styled.button`
  ${menuItemStyles}
  margin-top: auto;
  color: #ff4d4f;
  font-weight: bold;
`;