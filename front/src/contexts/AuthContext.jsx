import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 1. 임시 사용자 데이터 (나중에 DB에서 가져올 데이터)
const mockUsers = [
  { id: 1, username: "admin", password: "password", role: "admin" },
  { id: 2, username: "user", password: "password", role: "user" },
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 페이지 새로고침 시 localStorage를 확인하여 로그인 상태를 유지합니다.
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username, password) => {
    const foundUser = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      // 실제 앱에서는 토큰과 같은 민감한 정보는 저장하지 않습니다.
      const userData = { username: foundUser.username, role: foundUser.role };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      navigate("/home"); // 로그인 성공 시 대시보드(홈) 페이지로 이동
      return true;
    } else {
      alert("아이디 또는 비밀번호가 일치하지 않습니다.");
      return false;
    }
  };

  const logout = () => {
    // 1. 먼저 메인 페이지로 이동시켜, 현재 페이지(e.g. /admin)의
    //    ProtectedRoute가 재실행되는 것을 방지합니다.
    navigate("/");

    // 2. 페이지 이동이 완전히 처리될 시간을 벌기 위해,
    //    상태 변경 로직을 이벤트 루프의 다음 틱으로 보냅니다.
    setTimeout(() => {
      localStorage.removeItem("user");
      setUser(null);
    }, 0);
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};