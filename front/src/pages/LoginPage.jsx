import { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
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
  background-color: #5d4037; /* Moca: Dark Brown */
  color: white;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #4e342e;
  }
`;