import { useState } from 'react'

export default function DriverLicensePage() {
    const [file, setFile] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) return alert("이미지를 선택해주세요.")

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const fd = new FormData()
            fd.append("file", file)

            const res = await fetch("/ocr/driver-license/recognize", {
                method: "POST",
                body: fd,
            })

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
            const data = await res.json()
            setResult(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2>운전면허증 OCR 인식</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFile(e.target.files[0])}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "인식 중..." : "OCR 실행"}
                </button>
            </form>

            {error && <div style={{ color: 'red' }}>❌ {error}</div>}
            {result && (
                <div style={{ marginTop: '1rem' }}>
                    <h3>인식 결과</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}
