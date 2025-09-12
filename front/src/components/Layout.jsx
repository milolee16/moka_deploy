import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { HiOutlineBell, HiOutlineMenu } from 'react-icons/hi';
import SideMenu from './common/SideMenu';
import logoSrc from '../assets/MocaLogo.png';
import NotificationModal from './common/NotificationModal';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications'; // 추가
import NotificationBell from './notification/NotificationBell';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications(); // 추가
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  // 알림 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const hasNewNotifications = unreadCount > 0; // 실제 데이터로 변경
    const noPadding =
    location.pathname === '/notices' ||
    location.pathname === '/mypage' ||
    location.pathname === '/faq' ||
    location.pathname === '/reserve';

  return (
    <>
      <Header>
        <LogoImage
          src={logoSrc}
          alt="Moca 로고"
          onClick={() => navigate('/')}
        />
        <HeaderActions>
          {/* 로그인된 사용자만 알림 아이콘 표시 */}
          {user && (
            // <NotificationWrapper ref={notificationRef}>
            //     <IconButton
            //         onClick={() => setIsNotificationOpen((prev) => !prev)}
            //         aria-label="알림"
            //     >
            //         <HiOutlineBell size={22}/>
            //         {hasNewNotifications && (
            //             <NotificationBadge>
            //                 {unreadCount > 99 ? '99+' : unreadCount}
            //             </NotificationBadge>
            //         )}
            //     </IconButton>
            //     <NotificationModal show={isNotificationOpen}/>
            // </NotificationWrapper>
            <NotificationBell />
          )}
          {/* 햄버거 메뉴는 항상 표시 */}
          <IconButton onClick={() => setIsMenuOpen(true)} aria-label="메뉴">
            <HiOutlineMenu size={22} />
          </IconButton>
        </HeaderActions>
      </Header>
      {/* 사이드메뉴는 항상 렌더링 */}
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Main $noPadding={noPadding}>
        {/* 페이지별 컨텐츠가 여기에 렌더링됩니다 */}
        <Outlet />
      </Main>
    </>
  );
};
export default Layout;

/* ============ styles ============ */
const Header = styled.header`
  position: relative;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-bottom: 1px solid #e7e0d9; /* Moca: Beige Border */
  width: 100%;
  box-sizing: border-box;
`;

const LogoImage = styled.img`
  height: 50px;
  cursor: pointer;
`;

const HeaderActions = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  --button-size: 40px; /* 버튼 크기를 변수로 관리하여 정사각형을 보장합니다 */
  width: var(--button-size);
  height: var(--button-size);
  display: grid;
  place-items: center;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #5d4037; /* Moca: Dark Brown */
`;

const NotificationWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// NotificationBadge 스타일 수정 (숫자 표시 지원)
const NotificationBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #e74c3c;
  color: white;
  border-radius: 10px;
  width: ${(props) =>
    props.children && props.children.toString().length > 1 ? '20px' : '8px'};
  height: ${(props) =>
    props.children && props.children.toString().length > 1 ? '16px' : '8px'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  min-width: 16px;
  padding: ${(props) =>
    props.children && props.children.toString().length > 1 ? '0 2px' : '0'};
`;

const Main = styled.main`
  padding: ${({ $noPadding }) => ($noPadding ? '0' : '16px')};
  display: grid;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;

  /* 앱 전체에 일관된 폰트를 적용하여 통일성을 높입니다. */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    sans-serif;
`;
