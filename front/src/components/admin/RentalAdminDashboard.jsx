import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
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

const RentalAdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [vehicleStats, setVehicleStats] = useState(null);
  const [regionStats, setRegionStats] = useState(null);
  const [error, setError] = useState(null);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    dashboard: true,
    monthly: true,
    vehicle: true,
    region: true,
  });

  useEffect(() => {
    // 병렬로 각 통계를 개별 로드
    fetchDashboardStats();
    fetchMonthlyStats();
    fetchVehicleStats();
    fetchRegionStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/rental/admin/dashboard/stats'
      );
      if (!response.ok) throw new Error('대시보드 통계 로드 실패');
      const data = await response.json();
      setDashboardStats(data);
    } catch (err) {
      setError((prev) => ({ ...prev, dashboard: err.message }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, dashboard: false }));
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const [monthlyRes, revenueRes] = await Promise.all([
        fetch(
          'http://localhost:8080/api/rental/admin/stats/monthly-reservations'
        ),
        fetch('http://localhost:8080/api/rental/admin/stats/revenue'),
      ]);

      if (!monthlyRes.ok || !revenueRes.ok)
        throw new Error('월별 통계 로드 실패');

      const monthlyData = await monthlyRes.json();
      const revenueData = await revenueRes.json();

      setMonthlyStats({ monthly: monthlyData, revenue: revenueData });
    } catch (err) {
      setError((prev) => ({ ...prev, monthly: err.message }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, monthly: false }));
    }
  };

  const fetchVehicleStats = async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/rental/admin/stats/vehicle-types'
      );
      if (!response.ok) throw new Error('차량 통계 로드 실패');
      const data = await response.json();
      setVehicleStats(data);
    } catch (err) {
      setError((prev) => ({ ...prev, vehicle: err.message }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, vehicle: false }));
    }
  };

  const fetchRegionStats = async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/rental/admin/stats/regions'
      );
      if (!response.ok) throw new Error('지역 통계 로드 실패');
      const data = await response.json();
      setRegionStats(data);
    } catch (err) {
      setError((prev) => ({ ...prev, region: err.message }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, region: false }));
    }
  };

  // 차트 데이터 변환
  const monthlyData = monthlyStats
    ? monthlyStats.monthly.months?.map((month, index) => ({
        name: month.substring(5), // "2024-12" -> "12"
        예약건수: monthlyStats.monthly.counts[index],
        매출: monthlyStats.revenue.revenues
          ? Math.round(monthlyStats.revenue.revenues[index] / 10000)
          : 0,
      }))
    : [];

  const vehicleTypeData = vehicleStats
    ? Object.entries(vehicleStats).map(([type, count]) => ({
        name: getVehicleTypeLabel(type),
        value: count,
      }))
    : [];

  const regionData = regionStats
    ? Object.entries(regionStats).map(([region, count]) => ({
        name: region,
        예약건수: count,
      }))
    : [];

  const COLORS = ['#5d4037', '#795548', '#8d6e63', '#a1887f', '#bcaaa4'];

  return (
    <DashboardContainer>
      <PageTitle>렌탈 관리자 대시보드</PageTitle>

      {/* 통계 카드들 - 우선 로드 */}
      <StatsCardsContainer>
        {loadingStates.dashboard ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : dashboardStats ? (
          <>
            <StatCard>
              <StatNumber>{dashboardStats.totalReservations || 0}</StatNumber>
              <StatLabel>총 예약</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{dashboardStats.totalCars || 0}</StatNumber>
              <StatLabel>총 차량</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{dashboardStats.totalUsers || 0}</StatNumber>
              <StatLabel>총 사용자</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{dashboardStats.totalLocations || 0}</StatNumber>
              <StatLabel>총 지점</StatLabel>
            </StatCard>
          </>
        ) : (
          <ErrorMessage>통계 카드를 불러올 수 없습니다.</ErrorMessage>
        )}
      </StatsCardsContainer>

      <ChartsGrid>
        {/* 월별 예약 및 매출 */}
        <Widget>
          <WidgetTitle>월별 예약 및 매출 현황</WidgetTitle>
          {loadingStates.monthly ? (
            <SkeletonChart />
          ) : monthlyData.length > 0 ? (
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
          ) : (
            <ErrorMessage>월별 통계를 불러올 수 없습니다.</ErrorMessage>
          )}
        </Widget>

        {/* 차량 타입별 예약 분포 */}
        <Widget>
          <WidgetTitle>차량 타입별 예약 분포</WidgetTitle>
          {loadingStates.vehicle ? (
            <SkeletonChart />
          ) : vehicleTypeData.length > 0 ? (
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
          ) : (
            <ErrorMessage>차량 타입 통계를 불러올 수 없습니다.</ErrorMessage>
          )}
        </Widget>

        {/* 지역별 예약 현황 */}
        <Widget>
          <WidgetTitle>지역별 예약 현황</WidgetTitle>
          {loadingStates.region ? (
            <SkeletonChart />
          ) : regionData.length > 0 ? (
            <ChartContainer>
              <ResponsiveContainer>
                <BarChart
                  layout="horizontal"
                  data={regionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 13 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={60}
                    tick={{ fontSize: 13 }}
                  />
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
          ) : (
            <ErrorMessage>지역별 통계를 불러올 수 없습니다.</ErrorMessage>
          )}
        </Widget>

        {/* 현재 상태 현황 */}
        <Widget>
          <WidgetTitle>현재 상태 현황</WidgetTitle>
          {loadingStates.dashboard ? (
            <SkeletonStatus />
          ) : dashboardStats ? (
            <StatusContainer>
              <StatusSection>
                <StatusTitle>예약 상태</StatusTitle>
                {dashboardStats.reservationStatusStats &&
                  Object.entries(dashboardStats.reservationStatusStats).map(
                    ([status, count]) => (
                      <StatusItem key={status}>
                        <StatusLabel>{getStatusLabel(status)}</StatusLabel>
                        <StatusCount status={status}>{count}</StatusCount>
                      </StatusItem>
                    )
                  )}
              </StatusSection>

              <StatusSection>
                <StatusTitle>차량 상태</StatusTitle>
                {dashboardStats.carStatusStats &&
                  Object.entries(dashboardStats.carStatusStats).map(
                    ([status, count]) => (
                      <StatusItem key={status}>
                        <StatusLabel>{getCarStatusLabel(status)}</StatusLabel>
                        <StatusCount carStatus={status}>{count}</StatusCount>
                      </StatusItem>
                    )
                  )}
              </StatusSection>

              <StatusSection>
                <StatusTitle>면허증 승인</StatusTitle>
                {dashboardStats.licenseStats &&
                  Object.entries(dashboardStats.licenseStats).map(
                    ([status, count]) => (
                      <StatusItem key={status}>
                        <StatusLabel>
                          {status === 'approved' ? '승인됨' : '대기중'}
                        </StatusLabel>
                        <StatusCount licenseStatus={status}>
                          {count}
                        </StatusCount>
                      </StatusItem>
                    )
                  )}
              </StatusSection>
            </StatusContainer>
          ) : (
            <ErrorMessage>상태 현황을 불러올 수 없습니다.</ErrorMessage>
          )}
        </Widget>
      </ChartsGrid>
    </DashboardContainer>
  );
};

// 유틸리티 함수들
const getStatusLabel = (status) => {
  const labels = {
    PENDING: '대기중',
    CONFIRMED: '확정',
    IN_PROGRESS: '진행중',
    COMPLETED: '완료',
    CANCELLED: '취소',
  };
  return labels[status] || status;
};

const getCarStatusLabel = (status) => {
  const labels = {
    AVAILABLE: '이용가능',
    RENTED: '대여중',
    MAINTENANCE: '정비중',
  };
  return labels[status] || status;
};

const getVehicleTypeLabel = (type) => {
  const labels = {
    COMPACT: '소형차',
    MIDSIZE: '중형차',
    FULLSIZE: '대형차',
    SUV: 'SUV',
    VAN: '승합차',
  };
  return labels[type] || type;
};

export default RentalAdminDashboard;

/* ============ Styled Components ============ */

// 스켈레톤 애니메이션
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const SkeletonBase = styled.div`
  background: #f6f7f8;
  background-image: linear-gradient(
    90deg,
    #f6f7f8 0px,
    #e2e5e7 40px,
    #f6f7f8 80px
  );
  background-size: 200px;
  animation: ${shimmer} 1.2s ease-in-out infinite;
  border-radius: 8px;
`;

const SkeletonCard = styled(SkeletonBase)`
  height: 120px;
  border-radius: 24px;
`;

const SkeletonChart = styled(SkeletonBase)`
  height: 320px;

  @media (min-width: 769px) {
    height: 380px;
  }
`;

const SkeletonStatus = styled(SkeletonBase)`
  height: 200px;
`;

// 기존 스타일 컴포넌트들
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
        case 'CONFIRMED':
          return 'background-color: #28a745;';
        case 'PENDING':
          return 'background-color: #ffc107; color: #212529;';
        case 'IN_PROGRESS':
          return 'background-color: #17a2b8;';
        case 'COMPLETED':
          return 'background-color: #6c757d;';
        case 'CANCELLED':
          return 'background-color: #dc3545;';
        default:
          return 'background-color: #5d4037;';
      }
    }
    if (carStatus) {
      switch (carStatus) {
        case 'AVAILABLE':
          return 'background-color: #28a745;';
        case 'RENTED':
          return 'background-color: #ffc107; color: #212529;';
        case 'MAINTENANCE':
          return 'background-color: #dc3545;';
        default:
          return 'background-color: #5d4037;';
      }
    }
    if (licenseStatus) {
      switch (licenseStatus) {
        case 'approved':
          return 'background-color: #28a745;';
        case 'pending':
          return 'background-color: #ffc107; color: #212529;';
        default:
          return 'background-color: #5d4037;';
      }
    }
    return 'background-color: #5d4037;';
  }}
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #dc3545;
  font-size: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
`;
