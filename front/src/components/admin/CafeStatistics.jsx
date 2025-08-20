import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 실제 애플리케이션에서는 API를 통해 데이터를 받아옵니다.
const sampleData = [
    { name: '1월', '신규 등록 카페 수': 15 },
    { name: '2월', '신규 등록 카페 수': 22 },
    { name: '3월', '신규 등록 카페 수': 18 },
    { name: '4월', '신규 등록 카페 수': 25 },
    { name: '5월', '신규 등록 카페 수': 30 },
    { name: '6월', '신규 등록 카페 수': 26 },
];

function CafeStatistics() {
    return (
        <div className="statistics-widget">
            <h2>월별 신규 등록 카페 통계</h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <AreaChart
                        data={sampleData}
                        margin={{
                            top: 10, right: 30, left: 0, bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="신규 등록 카페 수" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default CafeStatistics;