import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const SideMenu = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose(); // 로그아웃 후 메뉴 닫기
  };

<<<<<<< HEAD
    return (
        <>
            <Backdrop $isOpen={isOpen} onClick={onClose} />
            <MenuContainer $isOpen={isOpen}>
                <MenuHeader>
                    <Title>메뉴</Title>
                    <CloseButton onClick={onClose} aria-label="메뉴 닫기">
                        <HiX size={24} />
                    </CloseButton>
                </MenuHeader>
                <MenuList>
                    {menuItems.map((item) => (
                        <MenuItem key={item.path} onClick={() => handleNavigate(item.path)}>
                            {item.label}
                        </MenuItem>
                    ))}
                </MenuList>
            </MenuContainer>
        </>
    );
=======
  return (
    <>
      <Overlay $isOpen={isOpen} onClick={onClose} />
      <MenuContainer $isOpen={isOpen}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {user && (
          <UserInfo>
            <p>
              <strong>{user.username}</strong>님, 환영합니다.
            </p>
            <p>({user.role})</p>
          </UserInfo>
        )}
        <MenuList>
          <li>
            <MenuLink to="/home" onClick={onClose}>홈</MenuLink>
          </li>
          <li>
            <MenuLink to="/reserve" onClick={onClose}>예약하기</MenuLink>
          </li>
          <li>
            <MenuLink to="/map" onClick={onClose}>내 주변 찾기</MenuLink>
          </li>
          <li>
            <MenuLink to="/ocr" onClick={onClose}>면허증 등록</MenuLink>
          </li>
          {user?.role === "admin" && (
            <li>
              <MenuLink to="/admin" onClick={onClose}>관리자 페이지</MenuLink>
            </li>
          )}
        </MenuList>
        <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
      </MenuContainer>
    </>
  );
>>>>>>> 1cd2f29692e9d8ec14a2f09dfb01e13317194592
};

export default SideMenu;

<<<<<<< HEAD
const visibility = css`
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? 'visible' : 'hidden')};
`;

const Backdrop = styled.div`
=======
/* ============ styles ============ */
const Overlay = styled.div`
>>>>>>> 1cd2f29692e9d8ec14a2f09dfb01e13317194592
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  z-index: 999;
`;

const MenuContainer = styled.div`
  position: fixed;
  top: 0;
  right: ${({ $isOpen }) => ($isOpen ? "0" : "-300px")};
  width: 280px;
  height: 100%;
  background-color: #ffffff;
<<<<<<< HEAD
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  transform: ${(props) => (props.$isOpen ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.3s ease-in-out;
=======
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease-in-out;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
>>>>>>> 1cd2f29692e9d8ec14a2f09dfb01e13317194592
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
  width: 100%;
  display: block;
  text-decoration: none;
  background: none;
  border: none;
  font-size: 1rem;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const MenuLink = styled(Link)`${menuItemStyles}`;

const LogoutButton = styled.button`
  ${menuItemStyles}
  margin-top: auto;
  color: #ff4d4f;
  font-weight: bold;
`;