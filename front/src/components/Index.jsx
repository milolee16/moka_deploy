import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <PageLayout>
      <BigCard role="button" onClick={() => navigate('/reserve')}>
        <CardIcon>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M320-680q-50 0-85-35t-35-85q0-50 35-85t85-35q38 0 69 22.5t45 57.5h326v80h-40v80h-80v-80H434q-14 35-45 57.5T320-680Zm0-80q17 0 28.5-11.5T360-800q0-17-11.5-28.5T320-840q-17 0-28.5 11.5T280-800q0 17 11.5 28.5T320-760Zm40 500q17 0 28.5-11.5T400-300q0-17-11.5-28.5T360-340q-17 0-28.5 11.5T320-300q0 17 11.5 28.5T360-260Zm240 0q17 0 28.5-11.5T640-300q0-17-11.5-28.5T600-340q-17 0-28.5 11.5T560-300q0 17 11.5 28.5T600-260ZM200-376l66-192q5-14 16.5-23t25.5-9h344q14 0 25.5 9t16.5 23l66 192v264q0 14-9 23t-23 9h-16q-14 0-23-9t-9-23v-48H280v48q0 14-9 23t-23 9h-16q-14 0-23-9t-9-23v-264Zm106-64h348l-28-80H334l-28 80Zm-26 80v120-120Zm0 120h400v-120H280v120Z"/></svg>
        </CardIcon>
        <CardTitle>예약</CardTitle>
      </BigCard>

      <TwoCol>
        <SmallCard role="button" onClick={() => navigate('/mypage')}>
          <CardIcon><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M560-680v-80h320v80H560Zm0 160v-80h320v80H560Zm0 160v-80h320v80H560Zm-240-40q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM80-160v-76q0-21 10-40t28-30q45-27 95.5-40.5T320-360q56 0 106.5 13.5T522-306q18 11 28 30t10 40v76H80Zm86-80h308q-35-20-74-30t-80-10q-41 0-80 10t-74 30Zm154-240q17 0 28.5-11.5T360-520q0-17-11.5-28.5T320-560q-17 0-28.5 11.5T280-520q0 17 11.5 28.5T320-480Zm0-40Zm0 280Z"/></svg></CardIcon>
          <CardTitle>마이페이지</CardTitle>
        </SmallCard>
        <SmallCard role="button" onClick={() => navigate('/ocr')}>
          <CardIcon><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M560-440h200v-80H560v80Zm0-120h200v-80H560v80ZM200-320h320v-22q0-45-44-71.5T360-440q-72 0-116 26.5T200-342v22Zm160-160q33 0 56.5-23.5T440-560q0-33-23.5-56.5T360-640q-33 0-56.5 23.5T280-560q0 33 23.5 56.5T360-480ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"/></svg></CardIcon>
          <CardTitle>운전면허증 등록</CardTitle>
        </SmallCard>
      </TwoCol>
      <BottomPanel>
        <PanelButton onClick={() => navigate('/notices')}>
          <span role="img" aria-label="공지사항">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m260-80-40-40v-160H80v-80l60-106v-94H80v-80h360v80h-60v94l60 106v80H300v160l-40 40Zm220-80v-80h320v-480H80q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H480ZM172-360h176l-48-84v-116h-80v116l-48 84Zm88 0Z"/></svg>
          </span>
          <span>공지사항</span>
        </PanelButton>
        <PanelButton onClick={() => navigate('/payments-licenses')}>
          <span role="img" aria-label="결제수단">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v240H160v240h400v80H160Zm0-480h640v-80H160v80ZM760-80v-120H640v-80h120v-120h80v120h120v80H840v120h-80ZM160-240v-480 480Z"/></svg>
          </span>
          <span>결제·면허</span>
        </PanelButton>
        <PanelButton onClick={() => navigate('/faq')}>
          <span role="img" aria-label="고객센터">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
          </span>
          <span>고객센터</span>
        </PanelButton>
      </BottomPanel>

      {/* 관리자 페이지로 이동하는 버튼 추가 */}
      {user?.role === 'admin' && (
        <AdminCard role="button" onClick={() => navigate('/admin')}>
          <CardIcon><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T404-360h-4q-71 0-127.5 18T180-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H80Zm560 40-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80Zm40-120q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-560q33 0 56.5-23.5T480-640q0-33-23.5-56.5T400-720q-33 0-56.5 23.5T320-640q0 33 23.5 56.5T400-560Zm0-80Zm12 400Z"/></svg></CardIcon>
          <CardTitle>관리자 페이지</CardTitle>
        </AdminCard>
      )}
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
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;

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
