import { Routes, Route, NavLink } from 'react-router-dom'
import Statistics from './Statistics.jsx'

// 아직 만들지 않은 페이지를 위한 임시 컴포넌트
const Placeholder = ({ title }) => (
    <div className="placeholder">
        <h2>{title}</h2>
        <p>이 페이지는 현재 개발 중입니다.</p>
    </div>
);

function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <h3>관리자 메뉴</h3>
                <nav className="admin-nav">
                    {/* 모든 경로를 절대 경로로 명시하여 명확성을 높입니다. */}
                    <NavLink to="/admin" end>통계</NavLink>
                    <NavLink to="/admin/reservations">예약 관리</NavLink>
                    <NavLink to="/admin/users">사용자 관리</NavLink>
                    <NavLink to="/admin/vehicles">차량 관리</NavLink>
                </nav>
            </aside>
            <main className="admin-content">
                {/* 관리자 페이지 내부의 컨텐츠를 교체하기 위한 중첩 라우트 */}
                <Routes>
                    <Route index element={<Statistics />} />
                    <Route path="reservations" element={<Placeholder title="예약 관리" />} />
                    <Route path="users" element={<Placeholder title="사용자 관리" />} />
                    <Route path="vehicles" element={<Placeholder title="차량 관리" />} />
                </Routes>
            </main>
        </div>
    )
}

export default AdminDashboard