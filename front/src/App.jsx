import { Route, Routes } from 'react-router-dom';
<<<<<<< HEAD

// 공통 레이아웃
import Layout from "./components/Layout.jsx";

// 페이지 컴포넌트
import Welcome from "./components/Welcome.jsx";
import Index from "./components/Index.jsx";
import Reservation from "./components/Reservation.jsx";
import MapPage from "./components/Map.jsx";
import CarSelect from "./components/CarSelect.jsx";
import InsuranceSelect from "./components/InsuranceSelect.jsx";
import Checkout from "./components/Checkout.jsx";
import PaymentOptions from "./components/PaymentOptions.jsx";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
      <Routes>
        {/* Layout 컴포넌트가 하위 모든 페이지의 공통 레이아웃을 담당합니다. */}
        <Route element={<Layout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Index />} />
          <Route path="/reserve" element={<Reservation />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/cars" element={<CarSelect />} />
          <Route path="/insurance" element={<InsuranceSelect />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-options" element={<PaymentOptions />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Route>
      </Routes>
=======
import Index from './components/Index.jsx';
import Welcome from './components/Welcome.jsx';
import Reservation from './components/Reservation.jsx';
import Layout from './components/Layout.jsx';
import MapPage from './components/Map.jsx'; // MapPage 컴포넌트를 import 합니다.
import CarSelect from './components/CarSelect.jsx';
import InsuranceSelect from './components/InsuranceSelect.jsx';
import AdminPage from './pages/AdminPage';
import OcrPage from './pages/OcrPage'; // 새로 만든 OCR

function App() {
  return (
    <Routes>
      {/* Layout 컴포넌트가 하위 모든 페이지의 공통 레이아웃을 담당합니다. */}
      <Route element={<Layout />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Index />} />
        <Route path="/reserve" element={<Reservation />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/cars" element={<CarSelect />} />
        <Route path="/insurance" element={<InsuranceSelect />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/ocr" element={<OcrPage />} />
      </Route>
    </Routes>
>>>>>>> 1094113da2b7a160ca9d0aa289b7b47bc608f5f8
  );
}

export default App;