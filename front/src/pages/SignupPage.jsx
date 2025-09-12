import { useState, useCallback } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Modal from "../components/Modal.jsx";

const SignupPage = () => {
    const [formData, setFormData] = useState({
        userId: "",
        password: "",
        confirmPassword: "",
        userName: "",
        birthDate: "",
        phoneNumber: ""
    });
    const [userIdChecked, setUserIdChecked] = useState(false);
    const [userIdAvailable, setUserIdAvailable] = useState(false);
    const [ageValidation, setAgeValidation] = useState({ isValid: true, message: '' });
    const [isModalOpen, setModalOpen] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const { register, checkUserId, loading } = useAuth();
    const navigate = useNavigate();

    const validateAge = useCallback((birthDate) => {
        if (birthDate.length !== 6) {
            setAgeValidation({ isValid: true, message: '' });
            return true;
        }

        let year = parseInt(birthDate.substring(0, 2), 10);
        const month = parseInt(birthDate.substring(2, 4), 10);
        const day = parseInt(birthDate.substring(4, 6), 10);
        year = year >= 30 ? 1900 + year : 2000 + year;

        // Check if the date is valid
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
            setAgeValidation({ isValid: false, message: '만 18세 미만은 회원가입이 불가능합니다.' });
            return false;
        } else {
            setAgeValidation({ isValid: true, message: '' });
            return true;
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phoneNumber') {
            const cleaned = value.replace(/\D/g, '');
            let formatted = cleaned;
            if (cleaned.length > 3 && cleaned.length <= 7) {
                formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
            } else if (cleaned.length > 7) {
                formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
            }
            setFormData(prev => ({ ...prev, [name]: formatted }));
        } else if (name === 'birthDate') {
            const cleaned = value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [name]: cleaned }));
            validateAge(cleaned);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (name === 'userId') {
            setUserIdChecked(false);
            setUserIdAvailable(false);
        }
    };

    const handleUserIdCheck = async () => {
        if (!formData.userId.trim()) {
            alert("아이디를 입력해주세요.");
            return;
        }
        if (formData.userId.trim().length < 4) {
            alert("아이디는 4자 이상이어야 합니다.");
            return;
        }
        try {
            const result = await checkUserId(formData.userId.trim());
            setUserIdChecked(true);
            setUserIdAvailable(!result.exists);
            alert(result.message);
        } catch (error) {
            alert("ID 중복 체크 중 오류가 발생했습니다.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { userId, password, confirmPassword, userName, birthDate, phoneNumber } = formData;

        if (!userId.trim() || !password.trim() || !confirmPassword.trim() || !userName.trim() || !birthDate.trim() || !phoneNumber.trim()) {
            alert("모든 필드를 입력해주세요.");
            return;
        }
        if (!ageValidation.isValid) {
            alert(ageValidation.message);
            return;
        }
        if (birthDate.length !== 6) {
            alert("생년월일은 6자리로 입력해주세요.");
            return;
        }
        if (!userIdChecked || !userIdAvailable) {
            alert("아이디 중복 확인을 해주세요.");
            return;
        }
        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
        if (password.length < 4) {
            alert("비밀번호는 4자 이상이어야 합니다.");
            return;
        }

        let year = parseInt(birthDate.substring(0, 2), 10);
        const month = birthDate.substring(2, 4);
        const day = birthDate.substring(4, 6);
        year = year >= 30 ? 1900 + year : 2000 + year;
        const fullBirthDateStr = `${year}-${month}-${day}`;

        const userData = await register(
            userId.trim(),
            password,
            userName.trim(),
            fullBirthDateStr,
            phoneNumber.trim()
        );

        if (userData) {
            setNewUserName(userData.username);
            setModalOpen(true);
        }
    };

    const closeModalAndNavigate = () => {
        setModalOpen(false);
        navigate('/home');
    };

    return (
        <>
            <SignupContainer>
                <SignupForm onSubmit={handleSubmit}>
                    <h2>회원가입</h2>

                    <InputGroup>
                        <InputWrapper>
                            <Input
                                type="text"
                                name="userId"
                                placeholder="아이디를 입력하세요 (4자 이상)"
                                value={formData.userId}
                                onChange={handleInputChange}
                                disabled={loading}
                                required
                            />
                            <CheckButton
                                type="button"
                                onClick={handleUserIdCheck}
                                disabled={loading || !formData.userId.trim()}
                            >
                                중복확인
                            </CheckButton>
                        </InputWrapper>
                        {userIdChecked && (
                            <CheckMessage $available={userIdAvailable}>
                                {userIdAvailable ? "사용 가능한 ID입니다" : "이미 사용 중인 ID입니다"}
                            </CheckMessage>
                        )}
                    </InputGroup>

                    <Input
                        type="text"
                        name="userName"
                        placeholder="이름을 입력하세요"
                        value={formData.userName}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                    />

                    <InputGroup>
                        <Input
                            type="text"
                            name="birthDate"
                            placeholder="생년월일 6자리를 입력해주세요 (예: 990101)"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            maxLength="6"
                            disabled={loading}
                            required
                        />
                        {!ageValidation.isValid && (
                            <CheckMessage $available={false}>
                                {ageValidation.message}
                            </CheckMessage>
                        )}
                    </InputGroup>

                    <Input
                        type="tel"
                        name="phoneNumber"
                        placeholder="휴대폰 번호 (010-1234-5678)"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                    />

                    <Input
                        type="password"
                        name="password"
                        placeholder="비밀번호를 입력하세요 (4자 이상)"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                    />

                    <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="비밀번호를 다시 입력하세요"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                    />

                    <Button type="submit" disabled={loading}>
                        {loading ? "가입 중..." : "회원가입"}
                    </Button>

                    <LinkSection>
                        <Link to="/login">이미 계정이 있으신가요? 로그인하기</Link>
                        <HomeLink to="/">메인 페이지로 돌아가기</HomeLink>
                    </LinkSection>
                </SignupForm>
            </SignupContainer>

            <Modal isOpen={isModalOpen} onClose={closeModalAndNavigate}>
                <ModalContent>
                    <h3>{newUserName}님, 환영합니다!</h3>
                    <p>가입이 완료되었습니다.</p>
                    <p>실제 차량을 예약하려면 운전면허증 등록이 필요해요.</p>
                </ModalContent>
                <ModalActions>
                    <ModalButton
                        primary
                        onClick={() => navigate('/ocr')}
                    >
                        지금 면허증 등록하기
                    </ModalButton>
                    <ModalButton onClick={closeModalAndNavigate}>
                        다음에 할게요
                    </ModalButton>
                </ModalActions>
            </Modal>
        </>
    );
};

export default SignupPage;

/* ============ styles ============ */
const SignupContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 50px;
  min-height: 100vh;
  background-color: #f5f1ed;
  box-sizing: border-box;
`;

const SignupForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  width: 100%;
  max-width: 400px;
  margin: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  flex: 1;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const CheckButton = styled.button`
  padding: 12px 16px;
  border: none;
  border-radius: 4px;
  background-color: #795548;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: #5d4037;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const CheckMessage = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.$available ? '#4caf50' : '#f44336'};
  font-weight: 500;
`;

const Button = styled.button`
  padding: 12px;
  border: none;
  border-radius: 4px;
  background-color: #5d4037;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #4e342e;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LinkSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  
  a {
    text-align: center;
    color: #795548;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const HomeLink = styled(Link)`
  color: #aaa !important;
`;

const ModalContent = styled.div`
    text-align: center;
    h3 {
        margin-top: 0;
        margin-bottom: 8px;
        color: #333;
    }
    p {
        margin: 4px 0;
        color: #666;
        font-size: 0.95rem;
    }
`;

const ModalActions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
`;

const ModalButton = styled.button`
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    ${({ primary }) => primary ? `
        background-color: #795548;
        color: white;
        border-color: #795548;
        &:hover {
            background-color: #5d4037;
            border-color: #5d4037;
        }
    ` : `
        background-color: #fff;
        color: #555;
        &:hover {
            background-color: #f1f3f5;
        }
    `}
`;