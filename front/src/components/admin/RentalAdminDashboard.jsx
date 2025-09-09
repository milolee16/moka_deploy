import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const RentalAdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [vehicleStats, setVehicleStats] = useState(null);
  const [regionStats, setRegionStats] = useState(null);
  const [error, setError] = useState({});

  // 개별 로딩 상태 (기존 로직과 동일)
  const [loadingStates, setLoadingStates] = useState({
    dashboard: true,
    monthly: true,
    vehicle: true,
    region: true,
  });

  useEffect(() => {
    // 병렬로 각 통계를 개별 로드 (기존 로직)
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

  // 유틸리티 함수들 (기존과 동일)
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

  // 차트 데이터 변환 (기존 로직)
  const monthlyData = monthlyStats
    ? monthlyStats.monthly.months?.map((month, index) => ({
        name: month.substring(5), // "2024-12" -> "12"
        count: monthlyStats.monthly.counts[index],
        revenue: monthlyStats.revenue.revenues
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

  return (
    <MobileContainer>
      <MobileTitle>MOCA 대시보드</MobileTitle>

      {/* 통계 카드들 */}
      <StatsGrid>
        {loadingStates.dashboard ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : dashboardStats ? (
          <>
            <StatCard color="#fff3e0">
              <StatIcon>📊</StatIcon>
              <StatNumber>{dashboardStats.totalReservations || 0}</StatNumber>
              <StatLabel>총 예약</StatLabel>
            </StatCard>
            <StatCard color="#e8f5e8">
              <StatIcon>🚗</StatIcon>
              <StatNumber>{dashboardStats.totalCars || 0}</StatNumber>
              <StatLabel>총 차량</StatLabel>
            </StatCard>
            <StatCard color="#e3f2fd">
              <StatIcon>👥</StatIcon>
              <StatNumber>{dashboardStats.totalUsers || 0}</StatNumber>
              <StatLabel>사용자</StatLabel>
            </StatCard>
            <StatCard color="#fce4ec">
              <StatIcon>📍</StatIcon>
              <StatNumber>{dashboardStats.totalLocations || 0}</StatNumber>
              <StatLabel>지점수</StatLabel>
            </StatCard>
          </>
        ) : error.dashboard ? (
          <ErrorCard>통계 카드를 불러올 수 없습니다.</ErrorCard>
        ) : null}
      </StatsGrid>

      {/* 월별 예약 현황 */}
      {loadingStates.monthly ? (
        <ChartSection>
          <SectionTitle>월별 예약 현황</SectionTitle>
          <SkeletonChart />
        </ChartSection>
      ) : monthlyData.length > 0 ? (
        <ChartSection>
          <SectionTitle>월별 예약 현황</SectionTitle>
          <ChartCard>
            <SimpleChart>
              {monthlyData.map((data, index) => (
                <ChartBar key={index}>
                  <Bar height={data.count * 4} />
                  <BarLabel>{data.name}월</BarLabel>
                  <BarValue>{data.count}</BarValue>
                </ChartBar>
              ))}
            </SimpleChart>
          </ChartCard>
        </ChartSection>
      ) : error.monthly ? (
        <ErrorSection>
          <SectionTitle>월별 예약 현황</SectionTitle>
          <ErrorCard>월별 통계를 불러올 수 없습니다.</ErrorCard>
        </ErrorSection>
      ) : null}

      {/* 차량 타입별 현황 */}
      {loadingStates.vehicle ? (
        <StatusSection>
          <SectionTitle>차량 타입별 현황</SectionTitle>
          <SkeletonCard />
        </StatusSection>
      ) : vehicleTypeData.length > 0 ? (
        <StatusSection>
          <SectionTitle>차량 타입별 현황</SectionTitle>
          <StatusGrid>
            {vehicleTypeData.map((data, index) => (
              <StatusCard key={index}>
                <StatusDot
                  color={
                    ['#a47551', '#795548', '#8d6e63', '#bcaaa4', '#d7ccc8'][
                      index % 5
                    ]
                  }
                />
                <StatusInfo>
                  <StatusName>{data.name}</StatusName>
                  <StatusCount>{data.value}대</StatusCount>
                </StatusInfo>
              </StatusCard>
            ))}
          </StatusGrid>
        </StatusSection>
      ) : error.vehicle ? (
        <ErrorSection>
          <SectionTitle>차량 타입별 현황</SectionTitle>
          <ErrorCard>차량 타입 통계를 불러올 수 없습니다.</ErrorCard>
        </ErrorSection>
      ) : null}

      {/* 현재 상태 현황 */}
      {loadingStates.dashboard ? (
        <StatusSection>
          <SectionTitle>현재 상태 현황</SectionTitle>
          <SkeletonCard />
        </StatusSection>
      ) : dashboardStats ? (
        <StatusSection>
          <SectionTitle>현재 상태 현황</SectionTitle>

          {/* 예약 상태 */}
          {dashboardStats.reservationStatusStats && (
            <StatusSubSection>
              <StatusSubTitle>📅 예약 상태</StatusSubTitle>
              <StatusGrid>
                {Object.entries(dashboardStats.reservationStatusStats).map(
                  ([status, count]) => (
                    <StatusCard key={status}>
                      <ReservationStatusDot status={status} />
                      <StatusInfo>
                        <StatusName>{getStatusLabel(status)}</StatusName>
                        <StatusCount>{count}건</StatusCount>
                      </StatusInfo>
                    </StatusCard>
                  )
                )}
              </StatusGrid>
            </StatusSubSection>
          )}

          {/* 차량 상태 */}
          {dashboardStats.carStatusStats && (
            <StatusSubSection>
              <StatusSubTitle>🚗 차량 상태</StatusSubTitle>
              <StatusGrid>
                {Object.entries(dashboardStats.carStatusStats).map(
                  ([status, count]) => (
                    <StatusCard key={status}>
                      <CarStatusDot status={status} />
                      <StatusInfo>
                        <StatusName>{getCarStatusLabel(status)}</StatusName>
                        <StatusCount>{count}대</StatusCount>
                      </StatusInfo>
                    </StatusCard>
                  )
                )}
              </StatusGrid>
            </StatusSubSection>
          )}

          {/* 면허증 승인 */}
          {dashboardStats.licenseStats && (
            <StatusSubSection>
              <StatusSubTitle>📄 면허증 승인</StatusSubTitle>
              <StatusGrid>
                {Object.entries(dashboardStats.licenseStats).map(
                  ([status, count]) => (
                    <StatusCard key={status}>
                      <LicenseStatusDot status={status} />
                      <StatusInfo>
                        <StatusName>
                          {status === 'approved' ? '승인됨' : '대기중'}
                        </StatusName>
                        <StatusCount>{count}건</StatusCount>
                      </StatusInfo>
                    </StatusCard>
                  )
                )}
              </StatusGrid>
            </StatusSubSection>
          )}
        </StatusSection>
      ) : error.dashboard ? (
        <ErrorSection>
          <SectionTitle>현재 상태 현황</SectionTitle>
          <ErrorCard>상태 현황을 불러올 수 없습니다.</ErrorCard>
        </ErrorSection>
      ) : null}
    </MobileContainer>
  );
};

export default RentalAdminDashboard;

// 스켈레톤 애니메이션 (기존과 동일)
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Moca Color Scheme Mobile-First Styled Components
const MobileContainer = styled.div`
  padding: 0;
  background: transparent;
  width: 100%;
`;

const MobileTitle = styled.h1`
  margin: 0 0 20px 0;
  color: #5d4037; /* Moca: Dark Brown */
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
`;

const SkeletonCard = styled.div`
  height: 80px;
  background: #f5f1ed; /* Moca: Light Brown BG */
  background-image: linear-gradient(
    90deg,
    #f5f1ed 0px,
    #e7e0d9 40px,
    #f5f1ed 80px
  );
  background-size: 200px;
  animation: ${shimmer} 1.2s ease-in-out infinite;
  border-radius: 16px;
`;

const SkeletonChart = styled(SkeletonCard)`
  height: 200px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${(props) => props.color || '#ffffff'};
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
  box-shadow: 0 4px 12px rgba(164, 117, 81, 0.08); /* Moca: Shadow */
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(164, 117, 81, 0.15);
  }
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
`;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #5d4037; /* Moca: Dark Brown */
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #795548; /* Moca: Medium Brown */
  font-weight: 500;
`;

const ChartSection = styled.div`
  margin-bottom: 24px;
`;

const ErrorSection = styled(ChartSection)``;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #5d4037; /* Moca: Dark Brown */
  margin: 0 0 12px 0;
`;

const ChartCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
  box-shadow: 0 4px 12px rgba(164, 117, 81, 0.08); /* Moca: Shadow */
`;

const SimpleChart = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 120px;
  gap: 8px;
`;

const ChartBar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const Bar = styled.div`
  width: 100%;
  max-width: 30px;
  background: linear-gradient(
    180deg,
    #a47551,
    #795548
  ); /* Moca: Primary to Medium Brown */
  border-radius: 4px 4px 0 0;
  height: ${(props) => Math.max(props.height, 10)}px;
  margin-bottom: 8px;
`;

const BarLabel = styled.div`
  font-size: 0.7rem;
  color: #795548; /* Moca: Medium Brown */
  margin-bottom: 2px;
`;

const BarValue = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #5d4037; /* Moca: Dark Brown */
`;

const StatusSection = styled.div`
  margin-bottom: 24px;
`;

const StatusSubSection = styled.div`
  margin-bottom: 20px;
`;

const StatusSubTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #5d4037; /* Moca: Dark Brown */
  margin: 0 0 12px 0;
`;

const StatusGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatusCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
  box-shadow: 0 4px 12px rgba(164, 117, 81, 0.08); /* Moca: Shadow */
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => props.color};
  flex-shrink: 0;
`;

const ReservationStatusDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(props) => {
    switch (props.status) {
      case 'CONFIRMED':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'IN_PROGRESS':
        return '#3b82f6';
      case 'COMPLETED':
        return '#795548';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#795548';
    }
  }};
`;

const CarStatusDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(props) => {
    switch (props.status) {
      case 'AVAILABLE':
        return '#10b981';
      case 'RENTED':
        return '#f59e0b';
      case 'MAINTENANCE':
        return '#ef4444';
      default:
        return '#795548';
    }
  }};
`;

const LicenseStatusDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(props) => {
    switch (props.status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      default:
        return '#795548';
    }
  }};
`;

const StatusInfo = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusName = styled.div`
  font-size: 0.9rem;
  color: #5d4037; /* Moca: Dark Brown */
  font-weight: 500;
`;

const StatusCount = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #a47551; /* Moca: Primary */
`;

const ErrorCard = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid #fecaca;
  font-size: 0.9rem;
`;
