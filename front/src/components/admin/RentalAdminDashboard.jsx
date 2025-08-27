import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
    LineChart,
    Line
} from 'recharts';

const RentalAdminDashboard = () => {
    const [stats, setStats] = useState({
        dashboard: {},
        monthlyReservations: {},
        vehicleTypes: {},
        regions: {},
        dailyReservations: {},
        revenue: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/rental/admin/stats/summary');
            if (!response.ok) throw new Error('통계 데이터를 가져오는데 실패했습니다.');

            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingContainer>통계 데이터를 불러오는 중...</LoadingContainer>;
    if (error) return <ErrorContainer>오류: {error}</ErrorContainer>;

    const { dashboard, monthlyReservations, vehicleTypes, regions, revenue } = stats;

    // 차트 데이터 변환
    const monthlyData = monthlyReservations.months ? monthlyReservations.months.map((month, index) => ({
        name: month.substring(5), // "2024-12" -> "12"
        예약건수: monthlyReservations.counts[index],
        매출: revenue.revenues ? Math.round(revenue.revenues[index] / 10000) : 0 // 만원 단위로 변환
    })) : [];

    const vehicleTypeData = Object.entries(vehicleTypes || {}).map(([type, count]) => ({
        name: getVehicleTypeLabel(type),
        value: count
    }));

    const regionData = Object.entries(regions || {}).map(([region, count]) => ({
        name: region,
        예약건수: count
    }));

    const COLORS = ['#5d4037', '#795548', '#8d6e63', '#a1887f', '#bcaaa4'];

    return (
        <DashboardContainer>
            <PageTitle>렌탈 관리자 대시보드</PageTitle>

            {/* 전체 통계 카드들 */}
            <StatsCardsContainer>
                <StatCard>
                    <StatNumber>{dashboard.totalReservations || 0}</StatNumber>
                    <StatLabel>총 예약</StatLabel>
                </StatCard>
                <StatCard>
                    <StatNumber>{dashboard.totalCars || 0}</StatNumber>
                    <StatLabel>총 차량</StatLabel>
                </StatCard>
                <StatCard>
                    <StatNumber>{dashboard.totalUsers || 0}</StatNumber>
                    <StatLabel>총 사용자</StatLabel>
                </StatCard>
                <StatCard>
                    <StatNumber>{dashboard.totalLocations || 0}</StatNumber>
                    <StatLabel>총 지점</StatLabel>
                </StatCard>
            </StatsCardsContainer>

            <ChartsGrid>
                {/* 월별 예약 및 매출 */}
                <Widget>
                    <WidgetTitle>월별 예약 및 매출 현황</WidgetTitle>
                    <ChartContainer>
                        <ResponsiveContainer>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                                <YAxis tick={{ fontSize: 13 }} />
                                <Tooltip
                                    contentStyle={{
                                        fontSize: '0.9rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e7e0d9',
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '0.9rem' }} />
                                <Bar dataKey="예약건수" fill="#5d4037" />
                                <Bar dataKey="매출" fill="#795548" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Widget>

                {/* 차량 타입별 예약 분포 */}
                <Widget>
                    <WidgetTitle>차량 타입별 예약 분포</WidgetTitle>
                    <ChartContainer>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={vehicleTypeData}
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
                                    {vehicleTypeData.map((entry, index) => (
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
                                        border: '1px solid #e7e0d9',
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{
                                        fontSize: '0.9rem',
                                        paddingTop: '15px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Widget>

                {/* 지역별 예약 현황 */}
                <Widget>
                    <WidgetTitle>지역별 예약 현황</WidgetTitle>
                    <ChartContainer>
                        <ResponsiveContainer>
                            <BarChart
                                layout="horizontal"
                                data={regionData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tick={{ fontSize: 13 }} />
                                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 13 }} />
                                <Tooltip
                                    contentStyle={{
                                        fontSize: '0.9rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e7e0d9',
                                    }}
                                />
                                <Bar dataKey="예약건수" fill="#8d6e63" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Widget>

                {/* 예약/차량/면허 상태 현황 */}
                <Widget>
                    <WidgetTitle>현재 상태 현황</WidgetTitle>
                    <StatusContainer>
                        <StatusSection>
                            <StatusTitle>예약 상태</StatusTitle>
                            {dashboard.reservationStatusStats && Object.entries(dashboard.reservationStatusStats).map(([status, count]) => (
                                <StatusItem key={status}>
                                    <StatusLabel>{getStatusLabel(status)}</StatusLabel>
                                    <StatusCount status={status}>{count}</StatusCount>
                                </StatusItem>
                            ))}
                        </StatusSection>

                        <StatusSection>
                            <StatusTitle>차량 상태</StatusTitle>
                            {dashboard.carStatusStats && Object.entries(dashboard.carStatusStats).map(([status, count]) => (
                                <StatusItem key={status}>
                                    <StatusLabel>{getCarStatusLabel(status)}</StatusLabel>
                                    <StatusCount carStatus={status}>{count}</StatusCount>
                                </StatusItem>
                            ))}
                        </StatusSection>

                        <StatusSection>
                            <StatusTitle>면허증 승인</StatusTitle>
                            {dashboard.licenseStats && Object.entries(dashboard.licenseStats).map(([status, count]) => (
                                <StatusItem key={status}>
                                    <StatusLabel>{status === 'approved' ? '승인됨' : '대기중'}</StatusLabel>
                                    <StatusCount licenseStatus={status}>{count}</StatusCount>
                                </StatusItem>
                            ))}
                        </StatusSection>
                    </StatusContainer>
                </Widget>
            </ChartsGrid>
        </DashboardContainer>
    );
};

// 유틸리티 함수들
const getStatusLabel = (status) => {
    const labels = {
        'PENDING': '대기중',
        'CONFIRMED': '확정',
        'IN_PROGRESS': '진행중',
        'COMPLETED': '완료',
        'CANCELLED': '취소'
    };
    return labels[status] || status;
};

const getCarStatusLabel = (status) => {
    const labels = {
        'AVAILABLE': '이용가능',
        'RENTED': '대여중',
        'MAINTENANCE': '정비중'
    };
    return labels[status] || status;
};

const getVehicleTypeLabel = (type) => {
    const labels = {
        'COMPACT': '소형차',
        'MIDSIZE': '중형차',
        'FULLSIZE': '대형차',
        'SUV': 'SUV',
        'VAN': '승합차'
    };
    return labels[type] || type;
};

export default RentalAdminDashboard;

/* ============ Styled Components ============ */

const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    width: 78vw;
    min-height: 100vh;
    background-color: #f7f5f3;

    @media (min-width: 769px) {
        gap: 24px;
        padding: 24px;
    }
`;

const PageTitle = styled.h1`
  margin: 0 0 16px 0;
  color: #5d4037;
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;

  @media (min-width: 769px) {
    font-size: 2.2rem;
    margin-bottom: 24px;
  }
`;

const StatsCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (min-width: 769px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
`;

const StatCard = styled.div`
  background: #ffffff;
  border-radius: 24px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e7e0d9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(164, 117, 81, 0.15);
    border-color: #d7ccc8;
  }

  @media (min-width: 769px) {
    padding: 28px;
  }
`;

const StatNumber = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: #5d4037;
  margin-bottom: 8px;

  @media (min-width: 769px) {
    font-size: 2.8rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: #795548;
  font-weight: 500;

  @media (min-width: 769px) {
    font-size: 1.1rem;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 769px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
`;

const Widget = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e7e0d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

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

  @media (min-width: 769px) {
    height: 380px;
  }
`;

const StatusContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 769px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatusTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #5d4037;
  font-size: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #e7e0d9;
  padding-bottom: 8px;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e7e0d9;
`;

const StatusLabel = styled.span`
  font-weight: 500;
  color: #5d4037;
  font-size: 0.9rem;
`;

const StatusCount = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
  
  ${({ status, carStatus, licenseStatus }) => {
    if (status) {
        switch (status) {
            case 'CONFIRMED': return 'background-color: #28a745;';
            case 'PENDING': return 'background-color: #ffc107; color: #212529;';
            case 'IN_PROGRESS': return 'background-color: #17a2b8;';
            case 'COMPLETED': return 'background-color: #6c757d;';
            case 'CANCELLED': return 'background-color: #dc3545;';
            default: return 'background-color: #5d4037;';
        }
    }
    if (carStatus) {
        switch (carStatus) {
            case 'AVAILABLE': return 'background-color: #28a745;';
            case 'RENTED': return 'background-color: #ffc107; color: #212529;';
            case 'MAINTENANCE': return 'background-color: #dc3545;';
            default: return 'background-color: #5d4037;';
        }
    }
    if (licenseStatus) {
        switch (licenseStatus) {
            case 'approved': return 'background-color: #28a745;';
            case 'pending': return 'background-color: #ffc107; color: #212529;';
            default: return 'background-color: #5d4037;';
        }
    }
    return 'background-color: #5d4037;';
}}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
  color: #5d4037;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
  color: #dc3545;
`;