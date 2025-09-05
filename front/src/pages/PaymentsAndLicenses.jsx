import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPaymentLicenseInfo, deletePaymentMethod } from '../services/paymentLicenseService';

// Helper function to format card number for display
const formatCardNumber = (number) => {
    if (!number) return '';
    const cleaned = number.replace(/\D/g, ''); // Ensure only digits
    if (cleaned.length === 16) {
        return `${cleaned.substring(0, 4)}-****-****-${cleaned.substring(12, 16)}`;
    }
    return cleaned.match(/.{1,4}/g)?.join('-') || cleaned; // Fallback for non-16 digit numbers
};

// Helper function to format license number for display
const formatLicenseNumber = (number) => {
    if (!number) return '';
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 12) { // Assuming 12 digits for XX-XXXXXXXX-XX
        return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 10)}-${cleaned.substring(10, 12)}`;
    }
    return cleaned; // Return as is if not 10 or 12 digits
};

// Helper function to format resident registration number for display
const formatResidentRegistrationNumber = (number) => {
    if (!number || number.length !== 13) return number; // Ensure 13 digits
    return `${number.substring(0, 6)}-${number.substring(6, 7)}******`; // Mask last 6 digits
};

const PaymentsAndLicenses = () => {
    const navigate = useNavigate();
    const { user, authLoading } = useAuth();
    const [payments, setPayments] = useState([]);
    const [license, setLicense] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInfo = () => {
        if (user) {
            setLoading(true);
            getPaymentLicenseInfo()
                .then(data => {
                    setPayments(data.payments || []);
                    setLicense(data.license);
                })
                .catch(error => {
                    console.error("Failed to fetch payment and license info:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }

    useEffect(() => {
        if (!authLoading) {
            fetchInfo();
        }
    }, [user, authLoading]);

    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('정말로 이 결제 수단을 삭제하시겠습니까?')) {
            try {
                await deletePaymentMethod(paymentId);
                alert('결제 수단이 삭제되었습니다.');
                // Refetch the data to update the list
                fetchInfo();
            } catch (error) {
                console.error("Failed to delete payment method:", error);
                alert('결제 수단 삭제에 실패했습니다.');
            }
        }
    };

    if (loading) {
        return <PageWrapper><div>Loading...</div></PageWrapper>;
    }

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

    return (
        <PageWrapper>
            <Title>결제 및 면허 관리</Title>

            <Section>
                <SectionTitle>결제 수단</SectionTitle>
                {payments && payments.length > 0 ? (
                    payments.map(p => (
                        <PaymentCard key={p.paymentId}>
                            <CardContent>
                                <CardIcon>💳</CardIcon>
                                <CardInfo>
                                    <CardLabel>{p.cardCompany}</CardLabel>
                                    <CardSubLabel>{formatCardNumber(p.cardNumber)}</CardSubLabel>
                                </CardInfo>
                            </CardContent>
                            <ActionButtons>
                                {p.isDefault && (
                                    <RepresentiveButton disabled>대표</RepresentiveButton>
                                )}
                                <DeleteButton onClick={() => handleDeletePayment(p.paymentId)}>DELETE</DeleteButton>
                            </ActionButtons>
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
                {license?.licenseNumber ? (
                    <LicenseCard>
                        <CardContent>
                            <CardIcon>🪪</CardIcon>
                            <CardInfo>
                                <CardLabel>{license.name} ({formatLicenseNumber(license.licenseNumber)})</CardLabel>
                                <CardSubLabel>주민등록번호: {formatResidentRegistrationNumber(license.residentRegistrationNumber)}</CardSubLabel>
                                <CardSubLabel>발급일: {new Date(license.issueDate).toLocaleDateString()}</CardSubLabel>
                                <CardSubLabel>갱신 시작일: {new Date(license.renewalStartDate).toLocaleDateString()}</CardSubLabel>
                                <CardSubLabel>갱신 종료일: {new Date(license.renewalEndDate).toLocaleDateString()}</CardSubLabel>
                            </CardInfo>
                        </CardContent>
                    </LicenseCard>
                ) : (
                    <EmptyCard>등록된 운전면허 정보가 없습니다.</EmptyCard>
                )}
                <StyledButton onClick={() => navigate('/ocr', { state: { isEdit: license?.licenseNumber ? true : false } }) }>
                    {license?.licenseNumber ? '면허 정보 수정' : '면허 정보 등록'}
                </StyledButton>
            </Section>
        </PageWrapper>
    );
};

export default PaymentsAndLicenses;

const ActionButtons = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const DeleteButton = styled.button`
    background: #FFEBEE;
    color: #F44336;
    border: none;
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background: #d32f2f;
    }
`;


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
    vertical-align: middle;
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