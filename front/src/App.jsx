import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DriverLicensePage from './pages/DriverLicensePage'

// Home 페이지 (연결 테스트)
function Home() {
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const testConnection = async () => {
        setLoading(true)
        setError('')
        setMessage('')
        try {
            const response = await fetch('/api/hello')
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const data = await response.json()
            setMessage(data.message)
        } catch (err) {
            console.error('API call error:', err)
            setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank" rel="noreferrer">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noreferrer">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>

            <h1>Moca Project</h1>
            <h2>React + Spring Boot 연결 테스트</h2>

            <div className="card">
                <button onClick={testConnection} disabled={loading}>
                    {loading ? '연결 테스트 중...' : '백엔드 연결 테스트'}
                </button>

                {message && <div className="success-message">✅ {message}</div>}
                {error && <div className="error-message">❌ {error}</div>}
            </div>
        </>
    )
}

function App() {
    return (
        <div className="App">
            <nav style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <Link to="/" style={{ marginRight: '1rem' }}>홈 (연결 테스트)</Link>
                <Link to="/driver-license">운전면허증 OCR</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/driver-license" element={<DriverLicensePage />} />
            </Routes>
        </div>
    )
}

export default App
