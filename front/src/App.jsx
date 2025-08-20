import { Route, Routes } from 'react-router-dom';
import Index from './components/Index.jsx';
import Welcome from './components/Welcome.jsx';
import Reservation from './components/Reservation.jsx';
import Layout from './components/Layout.jsx';
import MapPage from './components/Map.jsx'; // MapPage 컴포넌트를 import 합니다.
import CarSelect from './components/CarSelect.jsx';
import InsuranceSelect from './components/InsuranceSelect.jsx';
import AdminPage from './pages/AdminPage';

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
      </Route>
    </Routes>
  );
}

export default App;
