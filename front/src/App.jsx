import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";

import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

// Page Components
import Welcome from "./components/Welcome.jsx";
import Index from "./components/Index.jsx";
import Reservation from "./components/reservation/Reservation.jsx";
import Layout from "./components/Layout.jsx";
import MapPage from "./components/reservation/Map.jsx";
import CarSelect from "./components/reservation/CarSelect.jsx";
import InsuranceSelect from "./components/reservation/InsuranceSelect.jsx";
import Checkout from "./components/reservation/Checkout.jsx";
import PaymentOptions from "./components/reservation/PaymentOptions.jsx";
import PaymentResult from "./components/reservation/PaymentResult.jsx";
import AdminPage from "./pages/AdminPage";
import OcrPage from "./pages/OcrPage";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx"; // 추가
import KakaoCallback from "./components/common/KakaoCallback.jsx";
import NoticesPage from "./components/notices/Notices.jsx";
import MyPage from "./pages/MyPage.jsx";
import FAQPage from './pages/FAQPage';
import NoticeWritePage from './components/notices/NoticeWritePage.jsx';
import PaymentsAndLicenses from "./pages/PaymentsAndLicenses.jsx";
import AddPaymentPage from "./pages/AddPaymentPage.jsx";

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
          <Route path="/notices/write" element={<NoticeWritePage/>} />
          <Route path="/payments-licenses" element={<PaymentsAndLicenses />} />
          <Route path="/add-payment" element={<AddPaymentPage />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* Protected Route for My Page */}
          <Route element={<ProtectedRoute />}>
            <Route path="/mypage" element={<MyPage />} />
          </Route>

          {/* Protected Route for Admin Page */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>
        </Route>
0-
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
    </AuthProvider>
  );
}

export default App;
