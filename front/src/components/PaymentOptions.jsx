// src/pages/PaymentOptions.jsx
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { SiNaver, SiKakao } from "react-icons/si";
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa";

const PAYMENT_METHODS = [
    { id: "creditcard", name: "신용/체크카드", icon: <FaCreditCard size={20} /> },
    { id: "kakaopay", name: "카카오페이", icon: <SiKakao size={20} color="#FFEB00" /> },
    { id: "naverpay", name: "네이버페이", icon: <SiNaver size={20} color="#03C75A" /> },
    { id: "toss", name: "토스페이", icon: <FaMoneyBillWave size={20} color="#0064FF" /> }, // SiToss 아이콘을 임시로 변경
];

const PaymentOptions = () => {
    const navigate = useNavigate();

    const handlePaymentSelect = (method) => {
        // 선택한 결제 수단에 따라 결제 로직을 구현합니다.
        alert(`${method.name}로 결제 페이지로 이동합니다.`);
    };

    return (
        <Wrap>
            <Header>
                <BackButton onClick={() => navigate(-1)} aria-label="이전 페이지로">
                    <HiOutlineChevronLeft size={24} />
                </BackButton>
                <Title>결제 수단 선택</Title>
            </Header>
            <Container>
                <SectionTitle>결제 서비스</SectionTitle>
                <MethodList>
                    {PAYMENT_METHODS.map((method) => {
                        return (
                            <MethodItem
                                key={method.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => handlePaymentSelect(method)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") handlePaymentSelect(method);
                                }}
                            >
                                <MethodContent>{method.icon}<span>{method.name}</span></MethodContent>
                                <HiOutlineChevronRight size={18} />
                            </MethodItem>
                        );
                    })}
                </MethodList>
            </Container>
        </Wrap>
    );
};

export default PaymentOptions;

/* ===== styles ===== */
const Wrap = styled.div`
    padding: 16px 16px 96px;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: #5d4037;
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 800;
    color: #5d4037;
    margin: 0;
`;

const Container = styled.div`
    max-width: 400px;
    margin: 0 auto;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 700;
    color: #795548;
    margin-bottom: 12px;
`;

const MethodList = styled.ul`
    background: #fff;
    border-radius: 16px;
    padding: 8px 0;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    list-style: none;
    margin: 0;
`;

const MethodItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    color: #adb5bd; /* 아이콘 색상 기본값 */
    cursor: pointer;
    border-bottom: 1px solid #f5f1ed; /* Moca: Lighter Beige Border */
    transition: background-color 0.1s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: #fdfbfa; /* Moca: Light Beige BG */
    }
`;

const MethodContent = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 500;
    color: #5d4037;
`;