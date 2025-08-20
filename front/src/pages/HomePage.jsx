import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'

function HomePage() {
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // 백엔드 API 호출 함수
    const testConnection = async () => {
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const response = await fetch('/api/hello')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setMessage(data.message)
        } catch (err) {
            console.error('API 호출 에러:', err)
            setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>

            <h1>Moca Project</h1>
            <h2>React + Spring Boot 연결 테스트</h2>

            <div className="card">
                <button
                    onClick={testConnection}
                    disabled={loading}
                    className="test-button"
                >
                    {loading ? '연결 테스트 중...' : '백엔드 연결 테스트'}
                </button>

                {message && (
                    <div className="success-message">
                        <h3>✅ 연결 성공!</h3>
                        <p>{message}</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <h3>❌ 연결 실패</h3>
                        <p>{error}</p>
                        <p>
                            <strong>해결 방법:</strong><br/>
                            1. 백엔드 서버가 실행 중인지 확인 (http://localhost:8080)<br/>
                            2. 터미널에서 <code>cd back && ./gradlew bootRun</code> 실행
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}

export default HomePage