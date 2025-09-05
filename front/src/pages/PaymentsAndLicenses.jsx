import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPaymentLicenseInfo } from '../services/paymentLicenseService';

const PaymentsAndLicenses = () => {
    const navigate = useNavigate();
    const { user, authLoading } = useAuth();
    const [payments, setPayments] = useState([]);
    const [license, setLicense] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (user?.username) {
            getPaymentLicenseInfo(user.username)
                .then(response => {
                    setPayments(response.data.paymentMethods || []); // 데이터가 null일 경우 빈 배열로 처리
                    setLicense(response.data.license); // license는 null일 수 있으므로 그대로 둠
                })
                .catch(error => {
                    console.error("Failed to fetch payment and license info:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [user, authLoading]);

    if (loading) {
        return <PageWrapper><div>Loading...</div></PageWrapper>;
    }

    // 로딩이 끝났지만, 로그인 상태가 아닐 때
    if (!user) {
        return (
            <PageWrapper>
                <Title>결제 및 면허 관리</Title>
                <Section>
                    <EmptyCard>로그인이 필요한 서비스입니다.</EmptyCard>
                    <StyledButton onClick={() => navigate('/login')}>로그인 페이지로 이동</StyledButton>
                </Section>
            </PageWrapper>
        );
    }

    // 로그인 상태일 때의 UI
    return (
        <PageWrapper>
            <Title>결제 및 면허 관리</Title>

            <Section>
                <SectionTitle>결제 수단</SectionTitle>
                {payments && payments.length > 0 ? ( // ✨ payments가 존재하는지 먼저 확인
                    payments.map(p => (
                        <PaymentCard key={p?.paymentMethodId}>
                            <CardContent>
                                <CardIcon>💳</CardIcon>
                                <CardInfo>
                                    {/* ✨ p(결제 객체)나 내부 속성이 없을 경우를 대비 */}
                                    <CardLabel>{p?.cardCompany}</CardLabel>
                                    <CardSubLabel>{p?.cardNumber}</CardSubLabel>
                                </CardInfo>
                            </CardContent>
                            {p?.isRepresentative && (
                                <RepresentiveButton disabled>대표</RepresentiveButton>
                            )}
                        </PaymentCard>
                    ))
                ) : (
                    <EmptyCard>등록된 결제 수단이 없습니다.</EmptyCard>
                )}
                <AddButton onClick={() => navigate('/add-payment')}>
                    + 결제수단 추가
                </AddButton>
            </Section>

            <Section>
                <SectionTitle>운전면허 정보</SectionTitle>
                {/* ✨ license 객체와 내부 속성이 존재하는지 한번에 확인 */}
                {license?.licenseNumber ? (
                    <LicenseCard>
                        <CardContent>
                            <CardIcon>🪪</CardIcon>
                            <CardInfo>
                                <CardLabel>면허 번호: {license.licenseNumber}</CardLabel>
                                <CardSubLabel>만료일: {license.licenseExpiry}</CardSubLabel>
                            </CardInfo>
                        </CardContent>
                    </LicenseCard>
                ) : (
                    <EmptyCard>등록된 운전면허 정보가 없습니다.</EmptyCard>
                )}
                <StyledButton onClick={() => navigate('/ocr')}>
                    {license?.licenseNumber ? '면허 정보 수정' : '면허 정보 등록'}
                </StyledButton>
            </Section>
        </PageWrapper>
    );
};

export default PaymentsAndLicenses;


/* ============ styles (기존과 동일) ============ */
const PageWrapper = styled.div`
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 32px;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 700;
    color: #5d4037;
    margin-bottom: 8px;
`;

const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const SectionTitle = styled.h2`
    font-size: 18px;
    font-weight: 600;
    color: #795548;
    padding-bottom: 8px;
    border-bottom: 1px solid #e7e0d9;
`;

const CardBase = styled.div`
    background: #ffffff;
    border-radius: 24px;
    padding: 24px;
    border: 1px solid #e7e0d9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
`;

const PaymentCard = styled(CardBase)`
    justify-content: space-between;
`;

const LicenseCard = styled(CardBase)``;

const EmptyCard = styled(CardBase)`
    justify-content: center;
    color: #a1887f;
    font-size: 15px;
`;

const CardContent = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const CardIcon = styled.div`
    font-size: 28px;
`;

const CardInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const CardLabel = styled.span`
    font-size: 16px;
    font-weight: 500;
    color: #5d4037;
`;

const CardSubLabel = styled.span`
    font-size: 14px;
    color: #a1887f;
`;

const StyledButton = styled.button`
    background: #a47551;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 14px 20px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
    text-align: center;

    &:hover {
        background: #8c6443;
    }
`;

const AddButton = styled(StyledButton)`
    background: #f5f1ed;
    color: #5d4037;

    &:hover {
        background: #e7e0d9;
    }
`;

const RepresentiveButton = styled.button`
    background: #d7ccc8;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: not-allowed;
`;