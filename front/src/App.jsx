import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Index from './components/Index.jsx';
import Welcome from './components/Welcome.jsx';
import Reservation from './components/Reservation.jsx';
import Layout from './components/Layout.jsx';
import MapPage from './components/Map.jsx';
import CarSelect from './components/CarSelect.jsx';
import InsuranceSelect from './components/InsuranceSelect.jsx';
import AdminPage from './pages/AdminPage';
import OcrPage from './pages/OcrPage';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 공통 Layout이 적용되는 페이지 그룹 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Index />} />
          <Route path="/reserve" element={<Reservation />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/cars" element={<CarSelect />} />
          <Route path="/insurance" element={<InsuranceSelect />} />
          <Route path="/ocr" element={<OcrPage />} />
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>
        </Route>
        {/* Layout이 적용되지 않는 페이지 (예: 로그인) */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
