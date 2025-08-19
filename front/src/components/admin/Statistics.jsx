import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// 실제 애플리케이션에서는 API를 통해 데이터를 받아옵니다.
const sampleData = [
    { name: '1월', '예약 건수': 400, '매출(만원)': 240 },
    { name: '2월', '예약 건수': 300, '매출(만원)': 139 },
    { name: '3월', '예약 건수': 200, '매출(만원)': 980 },
    { name: '4월', '예약 건수': 278, '매출(만원)': 390 },
    { name: '5월', '예약 건수': 189, '매출(만원)': 480 },
    { name: '6월', '예약 건수': 239, '매출(만원)': 380 },
];

function Statistics() {
    return (
        <div className="statistics-widget">
            <h2>월별 예약 통계</h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={sampleData}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="예약 건수" fill="#8884d8" />
                        <Bar dataKey="매출(만원)" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Statistics