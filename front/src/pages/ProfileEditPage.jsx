import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClientWithRefresh'; // Import the API client

const ProfileEditPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        birthDate: '',
        phoneNumber: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [ageValidation, setAgeValidation] = useState({ isValid: true, message: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    setLoading(true);
                    const response = await apiClient.get('/api/users/profile');
                    const { username, birthDate, phoneNumber } = response.data;
                    setFormData(prev => ({
                        ...prev,
                        username: username || '',
                        birthDate: birthDate || '',
                        phoneNumber: phoneNumber || ''
                    }));
                } catch (error) {
                    console.error("Failed to fetch profile:", error);
                    alert('프로필 정보를 불러오는 데 실패했습니다.');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const validateAge = useCallback((birthDate) => {
        if (!birthDate || birthDate.length !== 6) {
            setAgeValidation({ isValid: true, message: '' });
            return true;
        }
        let year = parseInt(birthDate.substring(0, 2), 10);
        const month = parseInt(birthDate.substring(2, 4), 10);
        const day = parseInt(birthDate.substring(4, 6), 10);
        year = year >= 30 ? 1900 + year : 2000 + year;

        const generatedDate = new Date(year, month - 1, day);
        if (generatedDate.getFullYear() !== year || generatedDate.getMonth() !== month - 1 || generatedDate.getDate() !== day) {
            setAgeValidation({ isValid: false, message: '유효하지 않은 생년월일입니다.' });
            return false;
        }

        const today = new Date();
        const birth = generatedDate;
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        if (age < 18) {
            setAgeValidation({ isValid: false, message: '만 18세 미만은 사용할 수 없습니다.' });
            return false;
        } else {
            setAgeValidation({ isValid: true, message: '' });
            return true;
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'phoneNumber') {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length > 3 && cleaned.length <= 7) {
                finalValue = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
            } else if (cleaned.length > 7) {
                finalValue = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
            }
        } else if (name === 'birthDate') {
            finalValue = value.replace(/\D/g, '');
            validateAge(finalValue);
        }
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSave = async () => {
        const { newPassword, confirmPassword, birthDate } = formData;

        if (newPassword && newPassword !== confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        if (birthDate && !validateAge(birthDate)) {
            alert(ageValidation.message);
            return;
        }

        try {
            const payload = { ...formData };
            // Do not send confirmPassword to backend
            delete payload.confirmPassword;
            // Only send password fields if newPassword is set
            if (!payload.newPassword) {
                delete payload.currentPassword;
                delete payload.newPassword;
            }

            const response = await apiClient.put('/api/users/profile', payload);
            alert(response.data.message || '프로필이 성공적으로 업데이트되었습니다.');
            navigate('/mypage');
        } catch (error) {
            console.error("Failed to update profile:", error);
            const errorMessage = error.response?.data?.error || '프로필 업데이트에 실패했습니다.';
            alert(errorMessage);
        }
    };

    const handleCancel = () => {
        navigate('/mypage');
    };

    if (loading) {
        return <PageWrapper><div>Loading...</div></PageWrapper>;
    }

    return (
        <PageWrapper>
            <Title>프로필 수정</Title>

            <FormSection>
                <InputGroup>
                    <Label>아이디</Label>
                    <ReadOnlyInput type="text" value={user.userId} readOnly />
                </InputGroup>

                <InputGroup>
                    <Label htmlFor="username">이름</Label>
                    <Input id="username" name="username" type="text" value={formData.username} onChange={handleInputChange} />
                </InputGroup>

                <InputGroup>
                    <Label htmlFor="birthDate">생년월일 (6자리)</Label>
                    <Input id="birthDate" name="birthDate" type="text" value={formData.birthDate} onChange={handleInputChange} maxLength="6" placeholder="예: 990101" />
                    {!ageValidation.isValid && (
                        <ValidationMessage $available={false}>
                            {ageValidation.message}
                        </ValidationMessage>
                    )}
                </InputGroup>

                <InputGroup>
                    <Label htmlFor="phoneNumber">휴대폰 번호</Label>
                    <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} placeholder="010-1234-5678" />
                </InputGroup>
            </FormSection>

            <FormSection>
                <SectionTitle>비밀번호 변경</SectionTitle>
                <InputGroup>
                    <Label htmlFor="currentPassword">현재 비밀번호</Label>
                    <Input id="currentPassword" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleInputChange} placeholder="비밀번호 변경 시 입력" />
                </InputGroup>
                <InputGroup>
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <Input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleInputChange} />
                </InputGroup>
                <InputGroup>
                    <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} />
                </InputGroup>
            </FormSection>

            <ButtonContainer>
                <StyledButton onClick={handleSave}>저장</StyledButton>
                <StyledButton onClick={handleCancel} variant="secondary">취소</StyledButton>
            </ButtonContainer>
        </PageWrapper>
    );
};

export default ProfileEditPage;

// --- Styled Components ---
const ValidationMessage = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  color: ${props => props.$available ? '#4caf50' : '#f44336'};
  font-weight: 500;
`;

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

const FormSection = styled.section`
    margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: #795548;
    padding-bottom: 8px;
    border-bottom: 1px solid #e7e0d9;
    margin-bottom: 16px;
`;

const InputGroup = styled.div`
    margin-bottom: 16px;
`;

const Label = styled.label`
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #a1887f;
    margin-bottom: 8px;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid #d7ccc8;
    border-radius: 8px;
    font-size: 16px;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: #a47551;
    }
`;

const ReadOnlyInput = styled(Input)`
    background-color: #f5f5f5;
    cursor: not-allowed;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 16px;
    justify-content: center;
`;

const StyledButton = styled.button`
    background: ${props => (props.variant === 'secondary' ? '#f5f1ed' : '#a47551')};
    color: ${props => (props.variant === 'secondary' ? '#5d4037' : 'white')};
    border: none;
    border-radius: 12px;
    padding: 14px 28px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background: ${props => (props.variant === 'secondary' ? '#e7e0d9' : '#8c6443')};
    }
`;
