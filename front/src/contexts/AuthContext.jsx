import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // 토큰 유효성 검증 함수
  const validateTokenWithServer = async (token) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.valid;
      }
      return false;
    } catch (error) {
      console.error('토큰 검증 중 오류:', error);
      return false;
    }
  };

  // 토큰 만료 시간 확인 함수
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('토큰 디코딩 오류:', error);
      return true;
    }
  };

  // 자동 로그아웃 함수
  const autoLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    setUser(null);
    console.log('토큰이 만료되어 자동 로그아웃되었습니다.');
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('accessToken');

      if (storedUser && storedToken) {
        // 1. 먼저 토큰 만료 시간 체크 (클라이언트 사이드)
        if (isTokenExpired(storedToken)) {
          autoLogout();
          setAuthLoading(false);
          return;
        }

        // 2. 서버에서 토큰 유효성 검증
        const isValid = await validateTokenWithServer(storedToken);

        if (isValid) {
          // 토큰이 유효한 경우 로그인 상태 유지
          const parsedUser = JSON.parse(storedUser);
          parsedUser.token = storedToken;
          setUser(parsedUser);
        } else {
          // 토큰이 무효한 경우 자동 로그아웃
          autoLogout();
        }
      }

      setAuthLoading(false);
    };

    checkAuthStatus();
  }, []);

  // API 요청 시 토큰 만료 확인을 위한 axios 인터셉터 설정
  useEffect(() => {
    const handleTokenExpiration = () => {
      const token = localStorage.getItem('accessToken');
      if (token && isTokenExpired(token)) {
        autoLogout();
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
    };

    // API 호출 전에 토큰 만료 확인
    const interceptor = setInterval(handleTokenExpiration, 60000); // 1분마다 체크

    return () => clearInterval(interceptor);
  }, []);

  // 일반 로그인 함수
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
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.accessToken;

        localStorage.setItem('accessToken', token);

        const decodedUser = jwtDecode(token);
        const userData = {
          userId: decodedUser.sub,
          username: decodedUser.username,
          role: decodedUser.role,
          token: token,
        };

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        navigate('/home');
        return true;
      } else {
        const errorData = await response.text();
        alert(errorData || '아이디 또는 비밀번호가 일치하지 않습니다.');
        return false;
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      alert('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 함수
  const register = async (userId, password, userName) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          password: password,
          userName: userName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.accessToken;

        localStorage.setItem('accessToken', token);

        const decodedUser = jwtDecode(token);
        const userData = {
          userId: decodedUser.sub,
          username: decodedUser.username,
          role: decodedUser.role,
          token: token,
        };

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        navigate('/home');
        alert(`${userData.username}님, 환영합니다! 회원가입이 완료되었습니다.`);
        return true;
      } else {
        const errorData = await response.text();
        alert(errorData || '회원가입 중 오류가 발생했습니다.');
        return false;
      }
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      alert('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkUserId = async (userId) => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/auth/check-userid',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('ID 중복 체크 실패');
      }
    } catch (error) {
      console.error('ID 중복 체크 중 오류 발생:', error);
      throw error;
    }
  };

  const loginWithToken = (token) => {
    try {
      localStorage.setItem('accessToken', token);

      const decodedUser = jwtDecode(token);

      const userData = {
        userId: decodedUser.sub,
        username: decodedUser.username,
        role: decodedUser.role,
        token: token,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      navigate('/home');
      alert(`${userData.username}님, 환영합니다!`);
    } catch (error) {
      console.error('토큰 처리 중 오류 발생:', error);
      alert('로그인 처리에 실패했습니다.');
    }
  };

  const logout = () => {
    navigate('/');

    setTimeout(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      setUser(null);
    }, 0);
  };

  const value = {
    user,
    login,
    register,
    checkUserId,
    logout,
    loginWithToken,
    loading,
    authLoading,
    autoLogout, // 다른 컴포넌트에서도 사용할 수 있도록 export
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
