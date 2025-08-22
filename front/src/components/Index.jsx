import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <BigCard role="button" onClick={() => navigate('/reserve')}>
        <CardIcon>📅</CardIcon>
        <CardTitle>예약</CardTitle>
      </BigCard>

      <TwoCol>
        <SmallCard role="button" onClick={() => navigate('/reservations')}> {/* 예약내역이 마이페이지의 주 기능이므로 링크는 유지합니다. */}
          <CardIcon>📝</CardIcon>
          <CardTitle>마이페이지</CardTitle>
        </SmallCard>
        <SmallCard role="button" onClick={() => navigate('/ocr')}>
          <CardIcon>🪪</CardIcon>
          <CardTitle>운전면허증 등록</CardTitle>
        </SmallCard>
      </TwoCol>
      <BottomPanel>
        <PanelButton onClick={() => navigate('/notices')}>
          <span role="img" aria-label="공지사항">
            📢
          </span>
          <span>공지사항</span>
        </PanelButton>
        <PanelButton onClick={() => navigate('/payments-licenses')}>
          <span role="img" aria-label="결제·면허">
            💳
          </span>
          <span>결제·면허</span>
        </PanelButton>
        <PanelButton onClick={() => navigate('/support')}>
          <span role="img" aria-label="고객센터">
            ❓
          </span>
          <span>고객센터</span>
        </PanelButton>
      </BottomPanel>

      {/* 관리자 페이지로 이동하는 버튼 추가 */}
      <AdminCard role="button" onClick={() => navigate('/admin')}>
        <CardIcon>⚙️</CardIcon>
        <CardTitle>관리자 페이지</CardTitle>
      </AdminCard>
    </PageLayout>
  );
};

export default Index;

/* ============ styles ============ */
const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px; /* 컴포넌트 사이의 간격을 일정하게 관리합니다 */
`;

const CardBase = styled.div`
  background: #ffffff;
  border-radius: 24px; /* 모서리를 좀 더 둥글게 */
  padding: 24px;
  cursor: pointer;
  display: grid;
  place-items: center;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(164, 117, 81, 0.15); /* Moca: Shadow */
    border-color: #d7ccc8;
  }

  &:active {
    transform: translateY(0);
    transition-duration: 0.05s;
  }
`;

const BigCard = styled(CardBase)`
  height: 140px; /* 전체적인 균형을 위해 높이를 살짝 늘립니다 */
  /* 아이콘과 텍스트가 그룹으로 묶여 중앙 정렬되도록 수정 */
  grid-template-rows: auto auto;
  align-content: center;
  gap: 12px; /* 아이콘과 텍스트 사이의 간격을 조금 더 줍니다 */
`;

const CardIcon = styled.div`
  display: grid;
  place-items: center;
  font-size: 36px;
  line-height: 1;
`;

const CardTitle = styled.div`
  font-size: 18px;
  font-weight: 700; /* 폰트 두께를 살짝 올려 가독성을 높입니다 */
  color: #5d4037; /* Moca: Dark Brown */
`;

const SmallCard = styled(CardBase)`
  height: 100px;
  /* 아이콘과 제목을 세로로 배치합니다 */
  grid-template-rows: auto auto;
  align-content: center;
  gap: 8px;

  /* 작은 카드에 맞게 아이콘과 제목 크기를 조정합니다 */
  & > ${CardIcon} {
    font-size: 28px;
  }
  & > ${CardTitle} {
    font-size: 16px;
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const AdminCard = styled(CardBase)`
  height: 80px; /* 다른 카드들과의 균형을 위해 높이 조정 */
  background: #fafafa; /* 관리자용 메뉴임을 구분하기 위해 다른 배경색 사용 */
  border-color: #e0e0e0;
  grid-template-columns: auto 1fr; /* 아이콘과 텍스트를 가로로 배치 */
  align-items: center;
  justify-content: start;
  text-align: left;
  gap: 20px;

  & > ${CardIcon} {
    font-size: 28px;
  }

  & > ${CardTitle} {
    font-size: 16px;
    color: #616161;
  }

  &:hover {
    background: #f5f5f5;
    border-color: #bdbdbd;
  }
`;

const BottomPanel = styled.section`
  /* margin-top: 8px; // PageLayout으로 대체되어 더 이상 필요 없습니다 */
  padding: 8px;
  background: #ffffff;
  border-radius: 24px;
  display: grid;
  border: 1px solid #e7e0d9; /* Moca: Beige Border */
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const PanelButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 14px;
  padding: 16px 8px;
  display: grid;
  place-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #795548; /* Moca: Medium Brown */
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    background: #f5f1ed; /* Moca: Light Brown BG */
    color: #5d4037; /* Moca: Dark Brown */
  }

  /* 첫 번째 span(이모지) 스타일 */
  & > span:first-of-type {
    font-size: 24px;
    line-height: 1;
  }

  &:active {
    transform: translateY(1px); /* 헤더 버튼과 동일하게 눌리는 효과로 변경 */
    transition-duration: 0.05s;
  }

  & > span {
    white-space: nowrap;
  }
`;
