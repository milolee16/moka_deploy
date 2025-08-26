import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    // Don't render anything until the auth state is determined
    return null; 
  }

  if (!user) {
    // 1. 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
    // alert("로그인이 필요합니다."); // 사용성 개선을 위해 alert 제거
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    // 2. 관리자 전용 페이지에 일반 사용자가 접근 시 홈으로 리디렉션
    // alert("관리자 권한이 없습니다."); // 사용성 개선을 위해 alert 제거
    return <Navigate to="/" replace />;
  }

  // 3. 허가된 사용자는 요청한 페이지를 보여줌
  return <Outlet />;
};

export default ProtectedRoute;