// src/pages/PaymentOptions.jsx
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { SiNaver, SiKakao } from "react-icons/si";
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import axios from "axios";
import React, { useState } from 'react';

const PAYMENT_METHODS = [
    { id: "creditcard", name: "신용/체크카드", icon: <FaCreditCard size={20} />, supported: true },
    { id: "kakaopay", name: "카카오페이", icon: <SiKakao size={20} color="#FFEB00" />, supported: true },
    { id: "naverpay", name: "네이버페이", icon: <SiNaver size={20} color="#03C75A" />, supported: false },
    { id: "toss", name: "토스페이", icon: <FaMoneyBillWave size={20} color="#0064FF" />, supported: false },
];

const PaymentOptions = () => {
    const navigate = useNavigate();
    const [paymentUrl, setPaymentUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = import.meta.env.MODE === 'development'
        ? 'http://192.168.2.23:8080'  // 👈 모바일 테스트용 IP
        : 'http://localhost:8080';

    const handlePaymentSelect = async (method) => {
        if (!method.supported) {
            alert("추후 지원될 예정입니다.");
            return;
        }

        if (method.id === 'kakaopay') {
            setLoading(true);
            try {
                const response = await axios.post(`${API_BASE_URL}/api/kakaopay/ready`, {
                    partner_order_id: `MOCA-ORDER-${new Date().getTime()}`,
                    partner_user_id: 'MOCA-USER-01',
                    item_name: 'MOCA',
                    quantity: 1,
                    total_amount: 50000,
                    tax_free_amount: 0,
                });

                const isMobile = /Mobi|Android/i.test(navigator.userAgent);

                if (isMobile) {
                    // 모바일에서는 전체 페이지를 리디렉션합니다.
                    window.location.href = response.data.next_redirect_mobile_url;
                } else {
                    // PC에서는 iframe에 PC용 URL을 사용합니다.
                    const url = response.data.next_redirect_pc_url;
                    if (url) {
                        setPaymentUrl(url);
                    } else {
                        alert("결제 페이지로 이동하는 데 실패했습니다. 다시 시도해주세요.");
                    }
                }
            } catch (error) {
                console.error("카카오페이 결제 준비 중 오류 발생:", error);
                alert("결제에 실패했습니다. 잠시 후 다시 시도해주세요.");
            } finally {
                setLoading(false);
            }
            return;
        }

        alert(`${method.name}(으)로 결제를 진행합니다.`);
    };

    // 결제 화면에서 뒤로가기
    const handleCancelPayment = () => {
        setPaymentUrl('');
    }

    // 결제 화면을 렌더링
    if (paymentUrl) {
        return (
            <Wrap>
                <IframeContainer>
                    <iframe
                        src={paymentUrl}
                        title="kakaopay-payment"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                </IframeContainer>
            </Wrap>
        )
    }

    // 결제 수단 선택 화면 렌더링
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
                    {PAYMENT_METHODS.map((method) => (
                        <MethodItem
                            key={method.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handlePaymentSelect(method)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") handlePaymentSelect(method);
                            }}
                            $supported={method.supported}
                            disabled={loading && method.id === 'kakaopay'}
                        >
                            <MethodContent $supported={method.supported}>{method.icon}<span>{method.name}</span></MethodContent>
                            {method.supported ? <HiOutlineChevronRight size={18} /> : <ComingSoonBadge>준비중</ComingSoonBadge>}
                        </MethodItem>
                    ))}
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

const IframeContainer = styled.div`
    width: 100%;
    max-width: 450px; // QR코드가 잘리지 않는 적절한 최대 너비
    height: 600px;    // 높이
    margin: 0 auto;
    //border: 1px solid #ddd;
    border-radius: 12px;
    overflow: hidden;
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

    ${(props) =>
            !props.$supported &&
            css`
                cursor: default;
                &:hover {
                    background-color: #fff;
                }
            `}

    ${(props) =>
            props.disabled &&
            css`
                opacity: 0.5;
                cursor: not-allowed;
            `}

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

    ${(props) =>
            !props.$supported &&
            css`
                opacity: 0.4;
            `}
`;

const ComingSoonBadge = styled.span`
    font-size: 12px;
    font-weight: 600;
    color: #adb5bd;
    background-color: #f1f3f5;
    padding: 4px 8px;
    border-radius: 12px;
`;