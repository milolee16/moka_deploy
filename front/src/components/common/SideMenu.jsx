import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { HiX } from 'react-icons/hi';

// 메뉴 항목 정의
const menuItems = [
    { path: '/home', label: '홈' },
    { path: '/reserve', label: '예약하기' },
    { path: '/reservations', label: '예약내역' },
    { path: '/notices', label: '공지사항' },
    { path: '/support', label: '고객센터' },
    { path: '/admin', label: '관리자 페이지' },
];

const SideMenu = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
        onClose(); // 메뉴 항목 클릭 시 메뉴 닫기
    };

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
};

export default SideMenu;

const visibility = css`
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? 'visible' : 'hidden')};
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  ${visibility}
`;

const MenuContainer = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100%;
  background-color: #ffffff;
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  transform: ${(props) => (props.$isOpen ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
`;

const MenuHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;

  &:hover {
    color: #000;
  }
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 16px 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
`;

const MenuItem = styled.li`
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 500;
  color: #5d4037;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f1ed;
  }
`;