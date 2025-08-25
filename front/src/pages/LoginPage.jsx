import { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import KakaoLoginButton from '../components/KakaoLoginButton.jsx';

const LoginPage = ({ redirectPath }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 입력값 검증
    if (!username.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    // 로그인 시도
    await login(username.trim(), password);
  };

  return (
      <LoginContainer>
        <LoginForm onSubmit={handleSubmit}>
          <h2>로그인</h2>
          <Input
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
          />
          <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>

          <OrSeparator>또는</OrSeparator>
          <KakaoLoginButton redirectPath={redirectPath} />

          <HomeLink to="/">메인 페이지로 돌아가기</HomeLink>
        </LoginForm>
      </LoginContainer>
  );
};

export default LoginPage;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 50px;
  min-height: 100vh;
  background-color: #f5f1ed;
  box-sizing: border-box;
`;

const LoginForm = styled.form`
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

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
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

const HomeLink = styled(Link)`
  margin-top: 8px;
  text-align: center;
  color: #795548;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const OrSeparator = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
  margin: 8px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
  }

  &:not(:empty)::before {
    margin-right: .25em;
  }

  &:not(:empty)::after {
    margin-left: .25em;
  }
`;