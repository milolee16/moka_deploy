// src/pages/PaymentOptions.jsx
import styled, { css } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { SiKakao, SiNaver } from "react-icons/si";
import { FaCreditCard, FaUniversity, FaWallet, FaMoneyBillWave } from "react-icons/fa";
import axios from "axios";
import React, { useState, useMemo, useEffect } from "react";

/* ================== 결제 수단 정의 ================== */
const GENERAL_METHODS = [
    { id: "bank",       name: "계좌이체",     supported: false, benefit: true,  icon: <FaUniversity size={20} /> },
    { id: "creditcard", name: "신용/체크카드", supported: false, benefit: true,  icon: <FaCreditCard size={20} /> },
];

const EASY_METHODS = [
    { id: "kakaopay", name: "카카오페이", supported: true,  benefit: true,  brand: "kakao" },
    { id: "kbpay",    name: "KB Pay",     supported: false, benefit: true,  brand: "kb"    },
    { id: "payco",    name: "PAYCO",      supported: false, benefit: false, brand: "payco" },
    { id: "tosspay",  name: "toss pay",   supported: false, benefit: false, brand: "toss"  },
    { id: "naverpay", name: "N pay",      supported: false, benefit: false, brand: "naver" },
];

const PaymentOptions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState("kakaopay");

    const info = useMemo(() => location.state || {}, [location.state]);

    useEffect(() => {
        if (!info || (!info.payment && typeof info.price !== "number")) {
            navigate("/insurance", { replace: true });
        }
    }, [info, navigate]);

    const amount = useMemo(() => {
        const fallbackTotal = (info.price ?? 0) + (info.insurance?.price ?? 0);
        const n = info.payment?.totalPrice ?? fallbackTotal;
        return Number.isFinite(n) ? n : 0;
    }, [info]);

    const itemName = info.car?.name ? `MOCA - ${info.car.name}` : "MOCA";
    const isMobile = useMemo(() => /Mobi|Android/i.test(navigator.userAgent), []);

    const API_BASE_URL =
        import.meta.env.MODE === "development" ? "http://192.168.2.23:8080" : "http://localhost:8080";

    const handleSelect = async (m) => {
        setSelectedId(m.id);

        if (!m.supported) {
            alert("해당 결제수단은 추후 지원될 예정입니다.");
            return;
        }

        if (m.id === "kakaopay") {
            if (!amount || amount <= 0) {
                alert("결제 금액이 올바르지 않습니다. 이전 단계로 돌아가 다시 시도해주세요.");
                return;
            }
            setLoading(true);
            try {
                const res = await axios.post(`${API_BASE_URL}/api/kakaopay/ready`, {
                    partner_order_id: `MOCA-ORDER-${Date.now()}`,
                    partner_user_id: info?.userId ?? "MOCA-USER-01",
                    item_name: itemName,
                    quantity: 1,
                    total_amount: amount,
                    tax_free_amount: 0,
                });
                const nextPcUrl = res?.data?.next_redirect_pc_url;
                const nextMobileUrl = res?.data?.next_redirect_mobile_url;
                const redirectUrl = isMobile ? (nextMobileUrl || nextPcUrl) : (nextPcUrl || nextMobileUrl);
                if (redirectUrl) {
                    sessionStorage.setItem('reservationInfo', JSON.stringify(info)); // 예약 정보 저장
                    window.location.assign(redirectUrl);
                }
                else alert("결제 페이지로 이동하는 데 실패했습니다. 다시 시도해주세요.");
            } catch (e) {
                console.error("카카오페이 결제 준비 중 오류:", e);
                alert("결제에 실패했습니다. 잠시 후 다시 시도해주세요.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Page>
            <Header>
                <BackButton onClick={() => navigate(-1)} aria-label="이전 페이지로">
                    <HiOutlineChevronLeft size={24} />
                </BackButton>
                <Title>결제 방법</Title>
            </Header>

            {/* 일반결제: 아이콘 + 텍스트 */}
            <Section>
                <SectionHead>일반결제</SectionHead>
                <Grid cols={2}>
                    {GENERAL_METHODS.map((m) => (
                        <PayBox
                            key={m.id}
                            role="button"
                            tabIndex={0}
                            aria-label={m.name}
                            $selected={selectedId === m.id}
                            $disabled={loading}
                            onClick={() => handleSelect(m)}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect(m)}
                            title={m.name}
                        >
                            {m.benefit && <Benefit>혜택</Benefit>}
                            <GeneralRow>
                                <GeneralIcon>{m.icon}</GeneralIcon>
                                <GeneralName>{m.name}</GeneralName>
                            </GeneralRow>
                            <RightIcon>
                                <HiOutlineChevronRight size={18} />
                            </RightIcon>
                        </PayBox>
                    ))}
                </Grid>
            </Section>

            <Divider />

            {/* 간편결제: 아이콘만(가운데) */}
            <Section>
                <SectionHead>간편결제</SectionHead>
                <Grid cols={2}>
                    {EASY_METHODS.map((m) => (
                        <PayBox
                            key={m.id}
                            role="button"
                            tabIndex={0}
                            aria-label={m.name}
                            $selected={selectedId === m.id}
                            $disabled={loading && m.id === "kakaopay"}
                            $iconOnly
                            onClick={() => handleSelect(m)}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect(m)}
                            title={m.name}
                        >
                            {m.benefit && <Benefit>혜택</Benefit>}
                            <BrandLogo brand={m.brand} />
                        </PayBox>
                    ))}
                </Grid>
            </Section>
        </Page>
    );
};

export default PaymentOptions;

/* ================== styles ================== */
/* 모바일에서도 균일하게 보이도록 반응형 높이(고정X) */
const CARD_HEIGHT = "clamp(48px, 18vw, 96px)"; // 화면폭에 맞춰 84~96px 사이에서 부드럽게

const Page = styled.div`
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
    //padding: 16px;
`;

const Header = styled.header`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
`;

const BackButton = styled.button`
    background: none;
    border: 0;
    cursor: pointer;
    color: #5d4037;
    display: grid;
    place-items: center;
    touch-action: manipulation;
`;

const Title = styled.h2`
    font-size: 18px;
    font-weight: 800;
    color: #5d4037;
    margin: 0;
`;

const Section = styled.section`
    margin-top: 8px;
`;

const SectionHead = styled.h3`
    font-size: 14px;
    font-weight: 700;
    color: #5d4037;
    margin: 8px 0 10px;
`;

const Divider = styled.hr`
    border: 0;
    border-top: 1px solid #eee7e1;
    margin: 16px 0;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(${(p) => p.cols || 2}, 1fr);
    gap: 12px; /* 모바일에서 살짝 더 넓게 */
`;

/* 공통 카드 */
const PayBox = styled.div`
    position: relative;
    background: #fff;
    border: 1px solid #e7e0d9;
    border-radius: 14px;
    height: ${CARD_HEIGHT};     /* ← 고정 높이 대신 반응형 */
    padding: 16px;
    cursor: pointer;
    transition: border-color .12s ease, box-shadow .12s ease, transform .06s ease, background .12s ease;

    /* 기본(일반결제): 좌측 콘텐츠 + 우측 화살표 */
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;

    /* 간편결제(아이콘만): 중앙 정렬 */
    ${(p) =>
            p.$iconOnly &&
            css`
                grid-template-columns: 1fr;
                place-items: center;
            `}

    &:hover {
        border-color: #cdb6a8;
        box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        transform: translateY(-1px);
        background: #fffefd;
    }

    ${(p) =>
            p.$selected &&
            css`
                border-color: #3b82f6;
                /* 두께를 올리지 않고 링 효과만 → 높이 흔들림 방지 */
                box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
                background: #ffffff;
            `}

    ${(p) =>
            p.$disabled &&
            css`
                opacity: 0.6;
                pointer-events: none;
            `}
`;

/* 뱃지는 카드 안쪽으로 (모바일에서 넘침/겹침 방지) */
const Benefit = styled.span`
    position: absolute;
    top: 6px;            /* ← 기존 -8px에서 안쪽으로 */
    right: 6px;
    font-size: 11px;
    font-weight: 800;
    color: #fff;
    background: #ff6b6b;
    padding: 4px 8px;
    border-radius: 999px;
    box-shadow: 0 4px 10px rgba(255,107,107,.25);
`;

/* 일반결제 내부 */
const GeneralRow = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 12px;
`;

const GeneralIcon = styled.span`
    width: 48px;   /* 모바일에서 아이콘 더 또렷하게 */
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e7e0d9;
    color: #5d4037;
    @media (min-width: 560px) {
        width: 44px;
        height: 44px;
    }
`;

const GeneralName = styled.span`
    font-size: 15px;
    font-weight: 700;
    color: #5d4037;
`;

const RightIcon = styled.div`
    color: #b0b7bd;
    display: grid;
    place-items: center;
`;

/* ===== 간편결제: 아이콘만(중앙) ===== */
const BrandLogo = ({ brand }) => {
    if (brand === "kakao") {
        return (
            <LogoBubble bg="#FFEB00" border="#f3d900" title="카카오페이">
                <SiKakao size={24} color="#000" />
            </LogoBubble>
        );
    }
    if (brand === "naver") {
        return (
            <LogoBubble bg="#E8F8EC" border="#cfeedd" title="네이버페이">
                <SiNaver size={24} color="#03C75A" />
            </LogoBubble>
        );
    }
    if (brand === "kb") {
        return (
            <LogoBubble bg="#FFF4D1" border="#ffe3a3" title="KB Pay">
                <FaWallet size={22} color="#F1B800" />
            </LogoBubble>
        );
    }
    if (brand === "payco") {
        return (
            <LogoBubble bg="#FFE8E8" border="#ffd1d1" title="PAYCO">
                <FaMoneyBillWave size={22} color="#FF3B30" />
            </LogoBubble>
        );
    }
    if (brand === "toss") {
        return (
            <LogoBubble bg="#E9F1FF" border="#d4e4ff" title="toss pay">
                <FaMoneyBillWave size={22} color="#2F80ED" />
            </LogoBubble>
        );
    }
    return null;
};

const LogoBubble = styled.span`
    display: inline-grid;
    place-items: center;
    width: 48px;       /* 모바일에서 시인성 ↑ */
    height: 48px;
    border-radius: 12px;
    background: ${(p) => p.bg};
    border: 1px solid ${(p) => p.border};
    @media (min-width: 560px) {
        width: 44px;
        height: 44px;
    }
`;
