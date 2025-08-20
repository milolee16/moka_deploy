import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 실제 애플리케이션에서는 API를 통해 데이터를 받아옵니다.
const sampleData = [
  { name: '1월', '신규 고객 예약': 65, '재방문 고객 예약': 335 },
  { name: '2월', '신규 고객 예약': 50, '재방문 고객 예약': 250 },
  { name: '3월', '신규 고객 예약': 70, '재방문 고객 예약': 130 },
  { name: '4월', '신규 고객 예약': 80, '재방문 고객 예약': 198 },
  { name: '5월', '신규 고객 예약': 60, '재방문 고객 예약': 129 },
  { name: '6월', '신규 고객 예약': 90, '재방문 고객 예약': 149 },
];

function UserStatistics() {
  return (
    <div className="statistics-widget">
      <h2>신규/재방문 고객 예약 분석</h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={sampleData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="신규 고객 예약" stackId="a" fill="#8884d8" />
            <Bar dataKey="재방문 고객 예약" stackId="a" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UserStatistics;