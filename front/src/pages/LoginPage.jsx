import { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
// 1. 카카오 로그인 버튼 컴포넌트를 import 합니다.
import KakaoLoginButton from '../components/KakaoLoginButton.jsx';

// 2. App.jsx로부터 redirectPath를 props로 받도록 수정합니다.
const LoginPage = ({ redirectPath }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
      <LoginContainer>
        <LoginForm onSubmit={handleSubmit}>
          <h2>로그인</h2>
          <Input
              type="text"
              placeholder="아이디 (admin 또는 user)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
          />
          <Input
              type="password"
              placeholder="비밀번호 (password)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
          />
          <Button type="submit">로그인</Button>

          {/* 3. '또는' 구분선과 카카오 로그인 버튼을 추가합니다. */}
          <OrSeparator>또는</OrSeparator>
          <KakaoLoginButton redirectPath={redirectPath} />

          <HomeLink to="/">메인 페이지로 돌아가기</HomeLink>
        </LoginForm>
      </LoginContainer>
  );
};

export default LoginPage;

// --- styled-components 코드는 그대로 유지 ---
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
  &:hover {
    background-color: #4e342e;
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

// 4. '또는' 구분선 스타일을 추가합니다.
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