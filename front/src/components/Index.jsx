import styled from "styled-components";
import {useNavigate} from "react-router-dom";
import {
    HiOutlineBell,
    HiOutlineMenu,
    HiOutlineCalendar,
    HiOutlineCreditCard,
    HiOutlineQuestionMarkCircle,
} from "react-icons/hi";
import {IoMegaphoneOutline} from "react-icons/io5";
import logoSrc from "../assets/Mocalogo.png";

const Index = () => {
    const navigate = useNavigate();

    return (
        <>
            {/* 헤더 */}
            <Header>
                <LogoImage src={logoSrc} alt="Moca 로고" onClick={() => navigate("/")} />
                <HeaderActions>
                    <IconButton onClick={() => navigate("/notifications")}>
                        <HiOutlineBell size={22}/>
                    </IconButton>
                    <IconButton onClick={() => navigate("/menu")}>
                        <HiOutlineMenu size={24}/>
                    </IconButton>
                </HeaderActions>
            </Header>

            {/* 메인 */}
            <Main>
                <BigCard role="button" onClick={() => navigate("/reserve")}>
                    <CardIcon>
                        <HiOutlineCalendar size={36}/>
                    </CardIcon>
                    <CardTitle>예약</CardTitle>
                </BigCard>

                <TwoCol>
                    <SmallCard role="button" onClick={() => navigate("/reservations")}>
                        <CardTitle>예약내역</CardTitle>
                    </SmallCard>
                    <SmallCard role="button" onClick={() => navigate("/events")}>
                        <CardTitle>이벤트</CardTitle>
                    </SmallCard>
                </TwoCol>

                <BottomPanel>
                    <PanelButton onClick={() => navigate("/notices")}>
                        <IoMegaphoneOutline size={24}/>
                        <span>공지사항</span>
                    </PanelButton>
                    <PanelButton onClick={() => navigate("/payments-licenses")}>
                        <HiOutlineCreditCard size={24}/>
                        <span>결제·면허</span>
                    </PanelButton>
                    <PanelButton onClick={() => navigate("/support")}>
                        <HiOutlineQuestionMarkCircle size={24}/>
                        <span>고객센터</span>
                    </PanelButton>
                </BottomPanel>
            </Main>
        </>
    );
};

export default Index;

/* ============ styles ============ */
const Header = styled.header`
    position: relative; /* 자식 요소의 absolute 포지셔닝 기준점 */
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center; /* 로고를 가운데로 정렬 */
    background: #ffffff;
    border-bottom: 1px solid #e9ecef;
    width: 100%;
    box-sizing: border-box; /* 패딩이 너비 계산에 포함되도록 보장 */
`;

const LogoImage = styled.img`
    height: 60px;
    cursor: pointer;
`;

const HeaderActions = styled.div`
    position: absolute; /* 헤더를 기준으로 위치 지정 */
    right: 16px; /* 오른쪽 여백과 동일하게 설정 */
    top: 50%;
    transform: translateY(-50%); /* 수직 가운데 정렬 */
    display: flex;
    gap: 6px;
`;

const IconButton = styled.button`
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: #495057;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:active { transform: scale(0.95); }
    &:hover { background: #f1f3f5; }
`;

const Main = styled.main`
    padding: 16px;
    display: grid;
    gap: 16px;
    box-sizing: border-box;
    width: 100%;
    max-width: 560px;
    margin: 0 auto; /* 메인 콘텐츠를 화면 가운데로 정렬 */
`;

const CardBase = styled.div`
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    cursor: pointer;
    display: grid;
    place-items: center;
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    }
    &:active {
        transform: translateY(0);
        transition-duration: 0.05s;
    }
`;

const BigCard = styled(CardBase)`
    height: 132px;
    grid-template-rows: auto 1fr;
    gap: 8px;
`;

const SmallCard = styled(CardBase)`
    height: 100px;
`;

const TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
`;

const CardIcon = styled.div`
    display: grid;
    place-items: center;
`;

const CardTitle = styled.div`
    font-size: 18px;
    font-weight: 400;
`;

const BottomPanel = styled.section`
    margin-top: 8px;
    padding: 12px;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
`;

const PanelButton = styled.button`
    background: transparent;
    border: none;
    border-radius: 14px;
    padding: 16px 8px;
    display: grid;
    place-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #495057;
    transition: background 0.2s ease, transform 0.1s ease;

    &:hover { background: #f8f9fa; }
    &:active { transform: scale(0.98); }

    & > span { white-space: nowrap; }
`;
