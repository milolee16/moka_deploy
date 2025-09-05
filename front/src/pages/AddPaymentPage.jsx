import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addPaymentMethod } from '../services/paymentLicenseService';

const AddPaymentPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cardCompany, setCardCompany] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!user || !user.username) {
            setError('로그인이 필요합니다.');
            return;
        }

        const paymentData = {
            userId: user.username, // userId 대신 username 사용
            cardCompany,
            cardNumber,
            cardExpiryDate: expiryDate,
            isRepresentative: false // 기본값, 대표카드 설정은 별도 로직 필요
        };

        try {
            await addPaymentMethod(paymentData);
            alert('카드가 성공적으로 등록되었습니다.');
            navigate('/payments-licenses'); // 등록 후 이전 페이지로 이동
        } catch (err) {
            console.error("Failed to add payment method:", err);
            setError('카드 등록에 실패했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <PageWrapper>
            <Title>새 결제수단 추가</Title>
            <Form onSubmit={handleSubmit}>
                <InputGroup>
                    <Label htmlFor="card-company">카드사</Label>
                    <Input 
                        id="card-company" 
                        type="text" 
                        value={cardCompany} 
                        onChange={(e) => setCardCompany(e.target.value)} 
                        placeholder="예: 신한카드"
                        required 
                    />
                </InputGroup>
                <InputGroup>
                    <Label htmlFor="card-number">카드 번호</Label>
                    <Input 
                        id="card-number" 
                        type="text" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)} 
                        placeholder="- 없이 숫자만 입력"
                        maxLength="16"
                        required
                    />
                </InputGroup>
                <InputGroup>
                    <Label htmlFor="expiry-date">만료일 (MM/YY)</Label>
                    <Input 
                        id="expiry-date" 
                        type="text" 
                        value={expiryDate} 
                        onChange={(e) => setExpiryDate(e.target.value)} 
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                    />
                </InputGroup>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <SubmitButton type="submit">등록하기</SubmitButton>
            </Form>
        </PageWrapper>
    );
};

export default AddPaymentPage;

const PageWrapper = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #f5f1ed;
  height: 100%;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #5d4037;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #795548;
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #d7ccc8;
  background: #ffffff;
  font-size: 16px;
  color: #5d4037;

  &::placeholder {
    color: #a1887f;
  }

  &:focus {
    outline: none;
    border-color: #a47551;
    box-shadow: 0 0 0 2px rgba(164, 117, 81, 0.2);
  }
`;

const ErrorMessage = styled.p`
    color: red;
    font-size: 14px;
    text-align: center;
`;

const SubmitButton = styled.button`
  background: #a47551;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 16px;

  &:hover {
    background: #8c6443;
  }
`;
