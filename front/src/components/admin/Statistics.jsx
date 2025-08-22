import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// 실제 애플리케이션에서는 API를 통해 데이터를 받아옵니다.
const sampleData = [
  { name: "1월", "예약 건수": 40, "매출(억원)": 24 },
  { name: "2월", "예약 건수": 30, "매출(억원)": 19 },
  { name: "3월", "예약 건수": 20, "매출(억원)": 90 },
  { name: "4월", "예약 건수": 28, "매출(억원)": 39 },
  { name: "5월", "예약 건수": 19, "매출(억원)": 48 },
  { name: "6월", "예약 건수": 29, "매출(억원)": 38 },
];

const pieSampleData = [
  { name: "예약 완료", value: 750 },
  { name: "예약 취소", value: 200 },
  { name: "노쇼", value: 50 },
];

const COLORS = ["#0088FE", "#FFBB28", "#FF8042"];

function Statistics() {
  return (
    <>
      <div className="statistics-widget">
        <h2>월별 예약 및 매출</h2>
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={barSampleData}
              margin={{
                top: 5,
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
              <Bar dataKey="예약 건수" fill="#8884d8" />
              <Bar dataKey="매출(억원)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="statistics-widget" style={{ marginTop: "2rem" }}>
        <h2>예약 상태 분포</h2>
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieSampleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieSampleData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

export default Statistics;
