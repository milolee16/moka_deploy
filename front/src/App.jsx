import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
    return (
        <Router>
            {/* 간단한 페이지 이동을 위한 네비게이션 */}
            <nav className="main-nav">
                <Link to="/">홈</Link>
                <Link to="/admin">관리자 대시보드</Link>
            </nav>

            <Routes>
                <Route path="/" element={<HomePage />} />
                {/* /admin으로 시작하는 모든 경로를 AdminPage에서 처리합니다. */}
                <Route path="/admin/*" element={<AdminPage />} />
            </Routes>
        </Router>
    )
}

export default App