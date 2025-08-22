import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";

// Common Layout
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

// Page Components
import Welcome from "./components/Welcome.jsx";
import Index from "./components/Index.jsx";
import Reservation from "./components/Reservation.jsx";
import MapPage from "./components/Map.jsx";
import CarSelect from "./components/CarSelect.jsx";
import InsuranceSelect from "./components/InsuranceSelect.jsx";
import Checkout from "./components/Checkout.jsx";
import PaymentOptions from "./components/PaymentOptions.jsx";
import PaymentResult from "./components/PaymentResult.jsx";
import AdminPage from "./pages/AdminPage";
import OcrPage from "./pages/OcrPage";
import LoginPage from "./pages/LoginPage.jsx";

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
        <Route path="/payment/result/:status" element={<PaymentResult />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
