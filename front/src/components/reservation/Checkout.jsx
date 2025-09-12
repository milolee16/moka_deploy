// src/components/reservation/Checkout.jsx
import { useMemo } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineChevronLeft } from "react-icons/hi";

// 금액 포맷 헬퍼
const formatCurrencyKRW = (n) => {
    try {
        return Number(n || 0).toLocaleString("ko-KR");
    } catch {
        return `${n}`;
    }
};

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 이전 단계에서 받아온 모든 state
    const info = useMemo(() => location.state || {}, [location.state]);
    const { car, insurance } = info;

    // 필수 정보가 없으면 가드
    if (!car || !insurance) {
        return (
            <Wrap>
                <p>예약 정보가 올바르지 않습니다. 다시 시도해주세요.</p>
                <button onClick={() => navigate("/")}>메인으로 돌아가기</button>
            </Wrap>
        );
    }

    // ✔ 렌탈요금은 (10분당 요금 * 대여시간)으로 계산
    const rentFee = useMemo(() => {
        // 이전 단계에서 전달된 startDate, endDate가 있다고 가정합니다.
        const startDate = info.startDate ? new Date(info.startDate) : null;
        const endDate = info.endDate ? new Date(info.endDate) : null;
        
        // DB 정보를 바탕으로, car 객체에 rentPricePer10min 필드가 있다고 가정합니다.
        const pricePer10min = car?.rentPricePer10min ?? 0;

        if (startDate && endDate && pricePer10min > 0) {
            // 대여시간 (분 단위)
            const durationInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
            
            // 10분 단위로 올림
            const intervals = Math.ceil(durationInMinutes / 10);
            
            return intervals * pricePer10min;
        }

        // 이전 로직 (필수 정보가 없을 경우 대비)
        const n = info?.payment?.basePrice ?? info?.price ?? 0;
        return Number.isFinite(n) ? n : 0;
    }, [info, car]);

    // ✔ 보험요금
    const insuranceFee = useMemo(() => {
        const n = insurance?.price ?? 0;
        return Number.isFinite(n) ? n : 0;
    }, [insurance]);

    // ✔ 총액은 전달된 totalPrice가 있으면 쓰고, 없으면 합산
    const totalFee = useMemo(() => {
        const n = info?.payment?.totalPrice ?? rentFee + insuranceFee;
        return Number.isFinite(n) ? n : 0;
    }, [info, rentFee, insuranceFee]);

    const handlePay = () => {
        // 결제 수단 선택 페이지로 모든 정보를 가지고 이동(+ payment 요약 보장)
        navigate("/payment-options", {
            state: {
                ...info,
                payment: {
                    basePrice: rentFee,
                    insurancePrice: insuranceFee,
                    totalPrice: totalFee,
                },
            },
        });
    };

    return (
        <Wrap>
            <Header>
                <BackButton onClick={() => navigate(-1)} aria-label="이전 페이지로">
                    <HiOutlineChevronLeft size={24} />
                </BackButton>
                <Title>예약 및 결제하기</Title>
            </Header>

            <Container>
                <SectionTitle>예약내역</SectionTitle>
                <InfoBox>
                    <InfoItem>
                        <span>차량</span>
                        <Value>{car.carName}</Value>
                    </InfoItem>
                    <InfoItem>
                        <span>보험</span>
                        <Value>{insurance.title}</Value>
                    </InfoItem>
                </InfoBox>

                <SectionTitle>결제금액</SectionTitle>
                <FeeBox>
                    <FeeItem>
                        <span>대여 요금</span>
                        <span>{formatCurrencyKRW(rentFee)}원</span>
                    </FeeItem>
                    <FeeItem>
                        <span>면책상품 요금</span>
                        <span>{formatCurrencyKRW(insuranceFee)}원</span>
                    </FeeItem>
                    <Divider />
                    <FeeItem>
                        <strong>총 결제금액</strong>
                        <Value>{formatCurrencyKRW(totalFee)}원</Value>
                    </FeeItem>
                </FeeBox>
            </Container>

            <PayBar>
                <PayButton type="button" onClick={handlePay}>
                    결제하기
                </PayButton>
            </PayBar>
        </Wrap>
    );
};

export default Checkout;

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

const InfoBox = styled.div`
    background: #fff;
    border-radius: 16px;
    padding: 12px 20px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: #795548;
`;

const FeeBox = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
`;

const FeeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  color: #795548;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Value = styled.span`
  font-weight: 800;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed #e7e0d9;
  margin: 16px 0;
`;

const TotalAmountBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  font-weight: 800;
  color: #5d4037;
`;

const TotalAmount = styled.span`
  font-size: 20px;
`;

const PayBar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 32px 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fff 30%);
  max-width: 560px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const PayButton = styled.button`
  width: 100%;
  height: 52px;
  border-radius: 999px;
  border: 0;
  font-weight: 800;
  font-size: 16px;
  color: #fff;
  background: #a47551;
  box-shadow: 0 10px 24px rgba(164, 117, 81, 0.35);
  cursor: pointer;
`;
