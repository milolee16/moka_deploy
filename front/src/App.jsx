import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// front/src/App.js (WebSocket 초기화 추가)
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useWebSocket } from './hooks/useWebSocket';

// Page Components
import Welcome from './components/Welcome.jsx';
import Index from './components/Index.jsx';
import Reservation from './components/reservation/Reservation.jsx';
import Layout from './components/Layout.jsx';
import MapPage from './components/reservation/Map.jsx';
import CarSelect from './components/reservation/CarSelect.jsx';
import InsuranceSelect from './components/reservation/InsuranceSelect.jsx';
import Checkout from './components/reservation/Checkout.jsx';
import PaymentOptions from './components/reservation/PaymentOptions.jsx';
import PaymentResult from './components/reservation/PaymentResult.jsx';
import AdminPage from './pages/AdminPage';
import OcrPage from './pages/OcrPage';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx'; // 추가
import KakaoCallback from './components/common/KakaoCallback.jsx';
import NoticesPage from './components/notices/Notices.jsx';
import MyPage from './pages/MyPage.jsx';
import FAQPage from './pages/FAQPage';
import NoticeWritePage from './components/notices/NoticeWritePage.jsx';
import PaymentsAndLicenses from './pages/PaymentsAndLicenses.jsx';
import AddPaymentPage from './pages/AddPaymentPage.jsx';
import Chatbot from './components/Chatbot.jsx'; // 🔥 챗봇 컴포넌트 추가
import ChatbotWidget from './components/ChatbotWidget.jsx';

const WebSocketInitializer = ({ children }) => {
  const { user } = useAuth();
  const { connect, disconnect, getConnectionStatus } = useWebSocket();

  useEffect(() => {
    if (user) {
      // 사용자가 로그인한 경우 WebSocket 연결
      connect();

      // 연결 상태 로깅 (개발 시에만)
      //   if (process.env.NODE_ENV === 'development') {
      //     const interval = setInterval(() => {
      //       const status = getConnectionStatus();
      //       console.log('WebSocket 상태:', status);
      //     }, 30000); // 30초마다

      //     return () => clearInterval(interval);
      //   }
    } else {
      // 사용자가 로그아웃한 경우 WebSocket 연결 해제
      disconnect();
    }
  }, [user, connect, disconnect, getConnectionStatus]);

  // 앱 종료 시 연결 정리
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes with the common Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Index />} />
          <Route path="/reserve" element={<Reservation />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/cars" element={<CarSelect />} />
          <Route path="/insurance" element={<InsuranceSelect />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-options" element={<PaymentOptions />} />
          <Route path="/ocr" element={<OcrPage />} />
          <Route path="/payment-result/:status" element={<PaymentResult />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/notices/write" element={<NoticeWritePage />} />
          <Route path="/payments-licenses" element={<PaymentsAndLicenses />} />
          <Route path="/add-payment" element={<AddPaymentPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/chatbot" element={<Chatbot />} />{' '}
          {/* 🔥 챗봇 라우트 추가 */}
          {/* Protected Route for My Page */}
          <Route element={<ProtectedRoute />}>
            <Route path="/mypage" element={<MyPage />} />
          </Route>
          {/* Protected Route for Admin Page */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>
        </Route>

        {/* Routes without the common Layout */}
        <Route
          path="/login"
          element={<LoginPage redirectPath="/auth/kakao/callback" />}
        />
        <Route
          path="/loginTest"
          element={<LoginPage redirectPath="/auth/kakao/callback/test" />}
        />
        <Route path="/signup" element={<SignupPage />} />
        {/* KakaoCallback 컴포넌트가 두 개의 다른 콜백 경로를 모두 처리 */}
        <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
        <Route path="/auth/kakao/callback/test" element={<KakaoCallback />} />
      </Routes>
      {/* 오른쪽 하단 챗봇 위젯 */}
      <ChatbotWidget /> {/* 🔥 Layout 밖에서 항상 보이도록 */}
    </AuthProvider>
  );
}

export default App;
