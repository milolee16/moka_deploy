import { useMemo } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineChevronLeft } from "react-icons/hi";

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const info = useMemo(() => location.state || {}, [location.state]);
    const { car, insurance } = info;

    // 이전 페이지에서 정보를 받아오지 못했을 경우를 대비한 방어 코드
    if (!car || !insurance) {
        return (
            <Wrap>
                <p>예약 정보가 올바르지 않습니다. 다시 시도해주세요.</p>
                <button onClick={() => navigate("/")}>메인으로 돌아가기</button>
            </Wrap>
        );
    }

    const rentFee = car.price;
    const insuranceFee = insurance.price;
    const totalFee = rentFee + insuranceFee;

    const handlePay = () => {
        // 결제 수단 선택 페이지로 모든 정보를 가지고 이동합니다.
        navigate("/payment-options", { state: info });
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
                        <Value>{car.name}</Value>
                    </InfoItem>
                    <InfoItem>
                        <span>보험</span>
                        <Value>{insurance.title}</Value>
                    </InfoItem>
                </InfoBox>
                <SectionTitle>결제금액</SectionTitle>
                <FeeBox>
                    <FeeItem>
                        <span>요금 합계</span>
                        <Value>{totalFee.toLocaleString()}원</Value>
                    </FeeItem>
                    <Divider />
                    <FeeItem>
                        <span>대여 요금</span>
                        <span>{rentFee.toLocaleString()}원</span>
                    </FeeItem>
                    <FeeItem>
                        <span>면책상품 요금</span>
                        <span>{insuranceFee.toLocaleString()}원</span>
                    </FeeItem>
                </FeeBox>
                <TotalAmountBox>
                    <span>총 결제금액</span>
                    <TotalAmount>{totalFee.toLocaleString()}원</TotalAmount>
                </TotalAmountBox>
            </Container>
            <PayBar>
                <PayButton type="button" onClick={handlePay}>
                    총 {totalFee.toLocaleString()}원 결제하기
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
  font-weight: 600;
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
  left: 0; right: 0; bottom: 0;
  padding: 12px 16px 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 30%);
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
  box-shadow: 0 10px 24px rgba(164, 117, 81, .35);
  cursor: pointer;
`;