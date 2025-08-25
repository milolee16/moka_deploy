import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";

import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

// Page Components
import Welcome from "./components/Welcome.jsx";
import Index from "./components/Index.jsx";
import Reservation from "./components/Reservation.jsx";
import Layout from './components/Layout.jsx';
import MapPage from "./components/Map.jsx";
import CarSelect from "./components/CarSelect.jsx";
import InsuranceSelect from "./components/InsuranceSelect.jsx";
import Checkout from "./components/Checkout.jsx";
import PaymentOptions from "./components/PaymentOptions.jsx";
import PaymentResult from "./components/PaymentResult.jsx";
import AdminPage from "./pages/AdminPage";
import OcrPage from "./pages/OcrPage";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx"; // 추가
import KakaoCallback from './components/common/KakaoCallback.jsx';

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

            {/* Protected Route for Admin Page */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin/*" element={<AdminPage />} />
            </Route>
          </Route>

          {/* Routes without the common Layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/payment/result/:status" element={<PaymentResult />} />

          {/* Kakao login routes */}
          <Route path="/loginTest" element={<LoginPage redirectPath="/auth/kakao/callback/test" />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
          <Route path="/auth/kakao/callback/test" element={<KakaoCallback />} />
        </Routes>
      </AuthProvider>
  );
}

export default App;