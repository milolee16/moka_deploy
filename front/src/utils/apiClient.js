// src/utils/apiClient.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터 - 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 오류 시 자동 로그아웃
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 무효한 경우
      console.log('인증 오류: 자동 로그아웃 처리');

      // localStorage 정리
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');

      // 페이지 리로드하여 로그인 페이지로 이동
      window.location.href = '/';

      // 사용자에게 알림
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
