<<<<<<< HEAD
=======
import styled from 'styled-components';
>>>>>>> 1cd2f29692e9d8ec14a2f09dfb01e13317194592
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
} from 'recharts';

// 실제 애플리케이션에서는 API를 통해 데이터를 받아옵니다.
const barSampleData = [
  { name: '1월', '예약 건수': 40, '매출(억원)': 24 },
  { name: '2월', '예약 건수': 30, '매출(억원)': 19 },
  { name: '3월', '예약 건수': 20, '매출(억원)': 90 },
  { name: '4월', '예약 건수': 28, '매출(억원)': 39 },
  { name: '5월', '예약 건수': 19, '매출(억원)': 48 },
  { name: '6월', '예약 건수': 29, '매출(억원)': 38 },
];

const pieSampleData = [
  { name: "예약 완료", value: 750 },
  { name: "예약 취소", value: 200 },
  { name: "노쇼", value: 50 },
];

const COLORS = ["#0088FE", "#FFBB28", "#FF8042"];

function Statistics() {
  return (
      <StatisticsContainer>
        <Widget>
          <WidgetTitle>월별 예약 및 매출</WidgetTitle>
          <ChartContainer>
            <ResponsiveContainer>
              <BarChart
                  data={barSampleData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 13 }}
                />
                <YAxis
                    tick={{ fontSize: 13 }}
                />
                <Tooltip
                    contentStyle={{
                      fontSize: '0.9rem',
                      borderRadius: '8px',
                      border: '1px solid #e7e0d9'
                    }}
                />
                <Legend
                    wrapperStyle={{ fontSize: '0.9rem' }}
                />
                <Bar dataKey="예약 건수" fill="#8884d8" />
                <Bar dataKey="매출(억원)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Widget>

        <Widget>
          <WidgetTitle>예약 상태 분포</WidgetTitle>
          <ChartContainer>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                    data={pieSampleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelStyle={{ fontSize: '0.9rem' }}
                >
                  {pieSampleData.map((entry, index) => (
                      <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                      />
                  ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                      fontSize: '0.9rem',
                      borderRadius: '8px',
                      border: '1px solid #e7e0d9'
                    }}
                />
                <Legend
                    wrapperStyle={{
                      fontSize: '0.9rem',
                      paddingTop: '15px'
                    }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Widget>
      </StatisticsContainer>
  );
}

export default Statistics;

const StatisticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 769px) {
    gap: 24px;
  }
`;

const Widget = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e7e0d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (max-width: 768px) {
    padding: 18px 16px;
  }

  @media (min-width: 769px) {
    padding: 28px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }
`;

const WidgetTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 18px;
  color: #5d4037;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1.15rem;
    margin-bottom: 16px;
  }

  @media (min-width: 769px) {
    font-size: 1.4rem;
    margin-bottom: 26px;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 320px;

  @media (max-width: 480px) {
    height: 300px;
  }

  @media (min-width: 481px) and (max-width: 768px) {
    height: 360px;
  }

  @media (min-width: 769px) {
    height: 450px;
  }
`;
