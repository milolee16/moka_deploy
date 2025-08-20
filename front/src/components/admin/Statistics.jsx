import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// 실제 애플리케이션에서는 API를 통해 데이터를 받아옵니다.
const sampleData = [
    { name: '1월', '예약 건수': 40, '매출(억원)': 24 },
    { name: '2월', '예약 건수': 30, '매출(억원)': 19 },
    { name: '3월', '예약 건수': 20, '매출(억원)': 90 },
    { name: '4월', '예약 건수': 28, '매출(억원)': 39 },
    { name: '5월', '예약 건수': 19, '매출(억원)': 48 },
    { name: '6월', '예약 건수': 29, '매출(억원)': 38 },
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
                        <Bar dataKey="매출(억원)" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Statistics