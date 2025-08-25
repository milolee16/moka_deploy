import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 페이지 새로고침 시 localStorage를 확인하여 로그인 상태를 유지합니다.
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 일반 로그인 함수 (백엔드 API 호출)
  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: username,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.accessToken;

        // JWT 토큰을 localStorage에 저장
        localStorage.setItem("accessToken", token);

        // 토큰 디코딩하여 사용자 정보 추출
        const decodedUser = jwtDecode(token);
        const userData = {
          username: decodedUser.username,
          role: decodedUser.role
        };

        // 사용자 정보 저장 및 상태 업데이트
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        // 로그인 성공 시 홈 페이지로 이동
        navigate("/home");
        return true;
      } else {
        const errorData = await response.text();
        alert(errorData || "아이디 또는 비밀번호가 일치하지 않습니다.");
        return false;
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
      alert("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 카카오 로그인 성공 후 호출될 함수
  const loginWithToken = (token) => {
    try {
      // 토큰을 localStorage에 저장
      localStorage.setItem("accessToken", token);

      // 토큰을 디코딩하여 사용자 정보를 추출
      const decodedUser = jwtDecode(token);

      // AuthContext의 user 상태를 업데이트하고, localStorage에도 저장
      const userData = { username: decodedUser.username, role: decodedUser.role };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // 로그인 성공 후 홈 페이지로 이동
      navigate("/home");
      alert(`${userData.username}님, 환영합니다!`);

    } catch (error) {
      console.error("토큰 처리 중 오류 발생:", error);
      alert("로그인 처리에 실패했습니다.");
    }
  };

  const logout = () => {
    // 메인 페이지로 이동
    navigate("/");

    // 상태 변경 로직을 이벤트 루프의 다음 틱으로 보냄
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      setUser(null);
    }, 0);
  };

  const value = {
    user,
    login,
    logout,
    loginWithToken,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};