import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// MOCA 테마 색상 정의
const colors = {
  primary: '#a47551', // Moca: Medium-Dark Brown
  secondary: '#795548', // Moca: Medium Brown
  light: '#f7f5f3', // Moca: Light Background
  ivory: '#faf8f5', // Moca: Ivory
  sand: '#e7e0d9', // Moca: Beige Border
  white: '#ffffff',
  text: '#2e1a11', // Moca: Dark Text
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// 공통 컴포넌트
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${colors.ivory} 0%,
    ${colors.light} 50%,
    #f0e6d6 100%
  );
  padding: 1.5rem;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: ${colors.white};
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(164, 117, 81, 0.1);
  border: 1px solid ${colors.sand};
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(164, 117, 81, 0.15);
    transform: translateY(-2px);
  }
`;

const HeaderCard = styled(Card)`
  margin-bottom: 2rem;
  background: linear-gradient(135deg, ${colors.white} 0%, ${colors.ivory} 100%);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    ${colors.primary} 0%,
    ${colors.secondary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
`;

const Grid = styled.div`
  display: grid;
  gap: 1.5rem;

  &.stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    margin-bottom: 2rem;
  }

  &.main-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    margin-bottom: 2rem;
  }
`;

// 통계 카드 관련 컴포넌트
const StatCard = styled(Card)`
  border-color: ${(props) => props.borderColor};

  &:hover {
    border-color: ${(props) => props.hoverColor};
  }
`;

const StatCardContent = styled.div`
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  width: 3rem;
  height: 3rem;
  background: ${(props) => props.gradient};
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-right: 1rem;

  span {
    font-size: 1.25rem;
    color: white;
  }
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.p`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.color || colors.text};
  margin-bottom: 0.25rem;
`;

const StatUnit = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(props) => props.color};
`;

// 프로그레스 바
const ProgressBar = styled.div`
  width: 100%;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${(props) => props.gradient};
  border-radius: 0.25rem;
  width: ${(props) => props.width}%;
  transition: width 0.5s ease;
`;

// 섹션 헤더
const SectionHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
`;

const SectionIcon = styled.span`
  width: 2rem;
  height: 2rem;
  background: ${(props) => props.gradient};
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
`;

// 버튼
const Button = styled.button`
  background: ${(props) =>
    props.gradient ||
    `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`};
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: ${(props) =>
    props.size === 'large' ? '1rem 1.5rem' : '0.75rem 1rem'};
  font-weight: 600;
  font-size: ${(props) => (props.size === 'large' ? '1rem' : '0.875rem')};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(164, 117, 81, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(164, 117, 81, 0.4);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  width: ${(props) => (props.fullWidth ? '100%' : 'auto')};
`;

// 상태 배지
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(props) =>
    props.type === 'success'
      ? '#d1fae5'
      : props.type === 'error'
      ? '#fecaca'
      : '#dbeafe'};
  color: ${(props) =>
    props.type === 'success'
      ? '#065f46'
      : props.type === 'error'
      ? '#991b1b'
      : '#1e40af'};
`;

// 테이블 관련
const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid ${colors.sand};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, ${colors.light} 0%, ${colors.sand} 100%);
`;

const TableHeaderCell = styled.th`
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:first-child {
    border-top-left-radius: 0.75rem;
  }

  &:last-child {
    border-top-right-radius: 0.75rem;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${colors.sand};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${colors.ivory};
  }
`;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: ${colors.text};

  &.session-id {
    font-family: 'Monaco', 'Menlo', monospace;
    background: ${colors.light};
    border-radius: 0.5rem;
    font-weight: 600;
  }
`;

// 로딩 및 에러 상태
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

const LoadingSpinner = styled.div`
  width: 4rem;
  height: 4rem;
  border: 4px solid ${colors.sand};
  border-top: 4px solid ${colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 1.125rem;
  font-weight: 500;
  color: ${colors.secondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: ${colors.error};
`;

const ErrorText = styled.p`
  font-size: 1.125rem;
  color: ${colors.error};
  margin-bottom: 1.5rem;
`;

// 메인 컴포넌트
const AutoMLDashboard = () => {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (endpoint, options = {}) => {
    const baseURL =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000'
        : 'https://YOUR-PROD-DOMAIN';

    const response = await fetch(`${baseURL}${endpoint}`, {
      timeout: 30000,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsRes, sessionsRes] = await Promise.all([
        apiCall('/ml_stats'),
        apiCall('/sessions'),
      ]);

      setStats(statsRes);
      setSessions(sessionsRes.sessions || []);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      const response = await apiCall('/retrain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 'retrain completed') {
        alert('모델 재훈련이 완료되었습니다!');
        loadData();
      } else {
        alert('재훈련에 실패했습니다: ' + response.error);
      }
    } catch (err) {
      console.error('재훈련 실패:', err);
      alert('재훈련 중 오류가 발생했습니다.');
    } finally {
      setRetraining(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.8) return colors.success;
    if (accuracy >= 0.6) return colors.warning;
    return colors.error;
  };

  const getAccuracyGradient = (accuracy) => {
    if (accuracy >= 0.8)
      return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (accuracy >= 0.6)
      return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>데이터 로딩 중...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorText>{error}</ErrorText>
          <Button onClick={loadData}>다시 시도</Button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <ContentWrapper>
        {/* 헤더 */}
        <HeaderCard>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <Title>MOCA AutoML 대시보드</Title>
              <Subtitle>
                챗봇 AI 모델의 성능과 학습 현황을 실시간으로 모니터링합니다.
              </Subtitle>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  마지막 업데이트
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: colors.text,
                  }}
                >
                  {new Date().toLocaleTimeString('ko-KR')}
                </div>
              </div>
              <Button onClick={loadData} title="새로고침">
                🔄
              </Button>
            </div>
          </div>
        </HeaderCard>

        {/* 통계 카드 */}
        <Grid className="stats-grid">
          <StatCard borderColor="#3b82f6" hoverColor="#2563eb">
            <StatCardContent>
              <IconWrapper gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)">
                <span>📚</span>
              </IconWrapper>
              <StatInfo>
                <StatLabel>훈련 데이터</StatLabel>
                <StatValue>{stats?.training_data_count || 0}</StatValue>
                <StatUnit color="#3b82f6">개 샘플</StatUnit>
              </StatInfo>
            </StatCardContent>
          </StatCard>

          <StatCard borderColor={colors.success} hoverColor="#059669">
            <StatCardContent>
              <IconWrapper gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                <span>🎯</span>
              </IconWrapper>
              <StatInfo>
                <StatLabel>예측 정확도</StatLabel>
                <StatValue
                  color={getAccuracyColor(stats?.recent_accuracy || 0)}
                >
                  {((stats?.recent_accuracy || 0) * 100).toFixed(1)}%
                </StatValue>
                <ProgressBar>
                  <ProgressFill
                    gradient={getAccuracyGradient(stats?.recent_accuracy || 0)}
                    width={(stats?.recent_accuracy || 0) * 100}
                  />
                </ProgressBar>
              </StatInfo>
            </StatCardContent>
          </StatCard>

          <StatCard borderColor="#8b5cf6" hoverColor="#7c3aed">
            <StatCardContent>
              <IconWrapper gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
                <span>💬</span>
              </IconWrapper>
              <StatInfo>
                <StatLabel>총 예측 수</StatLabel>
                <StatValue>{stats?.prediction_count || 0}</StatValue>
                <StatUnit color="#8b5cf6">회 처리</StatUnit>
              </StatInfo>
            </StatCardContent>
          </StatCard>

          <StatCard borderColor="#f59e0b" hoverColor="#d97706">
            <StatCardContent>
              <IconWrapper gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
                <span>📝</span>
              </IconWrapper>
              <StatInfo>
                <StatLabel>피드백 수</StatLabel>
                <StatValue>{stats?.feedback_count || 0}</StatValue>
                <StatUnit color="#f59e0b">개 수집</StatUnit>
              </StatInfo>
            </StatCardContent>
          </StatCard>
        </Grid>

        {/* 모델 상태 및 성능 */}
        <Grid className="main-grid">
          <Card>
            <SectionHeader>
              <SectionIcon
                gradient={`linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`}
              >
                🤖
              </SectionIcon>
              모델 상태
            </SectionHeader>

            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: colors.ivory,
                  borderRadius: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <span style={{ fontWeight: '500', color: colors.text }}>
                  모델 로드 상태
                </span>
                <StatusBadge type={stats?.model_loaded ? 'success' : 'error'}>
                  {stats?.model_loaded ? '✅ 정상 작동' : '❌ 오류'}
                </StatusBadge>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: colors.ivory,
                  borderRadius: '0.75rem',
                }}
              >
                <span style={{ fontWeight: '500', color: colors.text }}>
                  벡터라이저 상태
                </span>
                <StatusBadge
                  type={stats?.vectorizer_loaded ? 'success' : 'error'}
                >
                  {stats?.vectorizer_loaded ? '✅ 정상 작동' : '❌ 오류'}
                </StatusBadge>
              </div>
            </div>

            <Button
              fullWidth
              size="large"
              onClick={handleRetrain}
              disabled={retraining}
            >
              {retraining ? '🔄 재훈련 진행 중...' : '🚀 수동 재훈련 시작'}
            </Button>
          </Card>

          <Card>
            <SectionHeader>
              <SectionIcon gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)">
                📊
              </SectionIcon>
              성능 지표
            </SectionHeader>

            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                }}
              >
                <span style={{ fontWeight: '500', color: '#6b7280' }}>
                  최근 정확도
                </span>
                <span
                  style={{
                    fontWeight: '700',
                    color: getAccuracyColor(stats?.recent_accuracy || 0),
                  }}
                >
                  {((stats?.recent_accuracy || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <ProgressBar style={{ height: '0.75rem' }}>
                <ProgressFill
                  gradient={getAccuracyGradient(stats?.recent_accuracy || 0)}
                  width={(stats?.recent_accuracy || 0) * 100}
                />
              </ProgressBar>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  padding: '0.75rem',
                  background: '#d1fae5',
                  borderRadius: '0.75rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: colors.success,
                  }}
                >
                  80%+
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#065f46',
                  }}
                >
                  우수
                </div>
              </div>
              <div
                style={{
                  padding: '0.75rem',
                  background: '#fef3c7',
                  borderRadius: '0.75rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: colors.warning,
                  }}
                >
                  60-79%
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#92400e',
                  }}
                >
                  보통
                </div>
              </div>
              <div
                style={{
                  padding: '0.75rem',
                  background: '#fecaca',
                  borderRadius: '0.75rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: colors.error,
                  }}
                >
                  &lt;60%
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#991b1b',
                  }}
                >
                  개선필요
                </div>
              </div>
            </div>
          </Card>
        </Grid>

        {/* 활성 세션 */}
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <SectionHeader style={{ marginBottom: 0 }}>
              <SectionIcon gradient="linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)">
                👥
              </SectionIcon>
              활성 세션 ({sessions.length})
            </SectionHeader>
            <Button onClick={loadData}>🔄 새로고침</Button>
          </div>

          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💤</div>
              <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
                현재 활성 세션이 없습니다.
              </p>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>세션 ID</TableHeaderCell>
                    <TableHeaderCell>메시지 수</TableHeaderCell>
                    <TableHeaderCell>생성 시간</TableHeaderCell>
                    <TableHeaderCell>마지막 활동</TableHeaderCell>
                    <TableHeaderCell>상태</TableHeaderCell>
                  </tr>
                </TableHeader>
                <tbody>
                  {sessions.map((session) => (
                    <TableRow key={session.session_id}>
                      <TableCell className="session-id">
                        {session.session_id.slice(-12)}...
                      </TableCell>
                      <TableCell style={{ fontWeight: '600' }}>
                        {session.message_count}개
                      </TableCell>
                      <TableCell style={{ color: '#6b7280' }}>
                        {formatDate(session.created_at)}
                      </TableCell>
                      <TableCell style={{ color: '#6b7280' }}>
                        {formatDate(session.last_activity)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          type={session.is_expired ? 'error' : 'success'}
                        >
                          {session.is_expired ? '⏰ 만료됨' : '🟢 활성'}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </ContentWrapper>
    </Container>
  );
};

export default AutoMLDashboard;
