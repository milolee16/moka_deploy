import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Outlet, useNavigate } from "react-router-dom";
import { HiOutlineBell, HiOutlineMenu } from "react-icons/hi";
import logoSrc from "../assets/Mocalogo.png";
import NotificationModal from "./common/NotificationModal";

const Layout = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const notificationRef = useRef(null);

    // Hook to close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsModalOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // API 응답 등에 따라 새로운 알림 유무를 결정합니다.
    const hasNewNotifications = true;

    return (
        <>
            <Header>
                <LogoImage src={logoSrc} alt="Moca 로고" onClick={() => navigate("/")}/>
                <HeaderActions>
                    <NotificationWrapper ref={notificationRef}>
                        <IconButton onClick={() => setIsModalOpen(prev => !prev)} aria-label="알림">
                            <HiOutlineBell size={22}/>
                            {hasNewNotifications && <NotificationBadge />}
                        </IconButton>
                        <NotificationModal show={isModalOpen} />
                    </NotificationWrapper>
                    <IconButton onClick={() => navigate("/menu")} aria-label="메뉴">
                        <HiOutlineMenu size={22}/>
                    </IconButton>
                </HeaderActions>
            </Header>
            <Main>
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

const NotificationBadge = styled.span`
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background-color: #ff4d4f;
    border-radius: 50%;
    border: 1.5px solid #ffffff;
`;

const Main = styled.main`
    padding: 16px;
    display: grid;
    gap: 16px;
    box-sizing: border-box;
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
`;