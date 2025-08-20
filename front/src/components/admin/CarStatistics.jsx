import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 실제 애플리케이션에서는 API를 통해 데이터를 받아옵니다.
const sampleData = [
  { name: '소나타', '예약 건수': 450 },
  { name: '아반떼', '예약 건수': 410 },
  { name: '그랜저', '예약 건수': 380 },
  { name: 'K5', '예약 건수': 350 },
  { name: 'GV80', '예약 건수': 280 },
  { name: '카니발', '예약 건수': 250 },
  { name: '레이', '예약 건수': 180 },
];

function CarStatistics() {
  return (
    <div className="statistics-widget">
      <h2>차종별 인기 순위</h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={sampleData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip />
            <Legend />
            <Bar dataKey="예약 건수" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CarStatistics;