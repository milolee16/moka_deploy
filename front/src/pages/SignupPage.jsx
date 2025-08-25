import { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const SignupPage = () => {
    const [formData, setFormData] = useState({
        userId: "",
        password: "",
        confirmPassword: "",
        userName: ""
    });
    const [userIdChecked, setUserIdChecked] = useState(false);
    const [userIdAvailable, setUserIdAvailable] = useState(false);
    const { register, checkUserId, loading } = useAuth();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // ID가 변경되면 중복 체크 상태를 초기화
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

        // 입력값 검증
        if (!formData.userId.trim()) {
            alert("아이디를 입력해주세요.");
            return;
        }
        if (!formData.password.trim()) {
            alert("비밀번호를 입력해주세요.");
            return;
        }
        if (!formData.confirmPassword.trim()) {
            alert("비밀번호 확인을 입력해주세요.");
            return;
        }
        if (!formData.userName.trim()) {
            alert("이름을 입력해주세요.");
            return;
        }

        // 아이디 중복 체크 확인
        if (!userIdChecked || !userIdAvailable) {
            alert("아이디 중복 확인을 해주세요.");
            return;
        }

        // 비밀번호 일치 확인
        if (formData.password !== formData.confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 비밀번호 길이 확인
        if (formData.password.length < 4) {
            alert("비밀번호는 4자 이상이어야 합니다.");
            return;
        }

        // 회원가입 시도
        await register(
            formData.userId.trim(),
            formData.password,
            formData.userName.trim()
        );
    };

    return (
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