import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 실제 애플리케이션에서는 API를 통해 데이터를 받아옵니다.
const sampleData = [
    { name: '1월', '신규 가입자 수': 120 },
    { name: '2월', '신규 가입자 수': 150 },
    { name: '3월', '신규 가입자 수': 110 },
    { name: '4월', '신규 가입자 수': 180 },
    { name: '5월', '신규 가입자 수': 210 },
    { name: '6월', '신규 가입자 수': 160 },
];

function UserStatistics() {
    return (
        <div className="statistics-widget">
            <h2>월별 신규 가입자 통계</h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <LineChart
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
                        <Line type="monotone" dataKey="신규 가입자 수" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default UserStatistics;