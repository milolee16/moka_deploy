import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Star = ({ selected = false, onClick = f => f }) => (
  <StarIcon onClick={onClick}>{selected ? '★' : '☆'}</StarIcon>
);

const ReturnPage = () => {
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState(0);
  const [cleanlinessIssues, setCleanlinessIssues] = useState([]);
  const [damageType, setDamageType] = useState('');
  const [damageDescription, setDamageDescription] = useState('');

  const handleNext = () => setStep(step + 1);

  const handleCheckboxChange = (issue) => {
    if (cleanlinessIssues.includes(issue)) {
      setCleanlinessIssues(cleanlinessIssues.filter(i => i !== issue));
    } else {
      setCleanlinessIssues([...cleanlinessIssues, issue]);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <BoxCard>
            <Title>반납이 완료되었습니다.</Title>
            <Message>이용해주셔서 감사합니다.</Message>
            <ConfirmButton onClick={handleNext}>피드백을 남겨주세요</ConfirmButton>
          </BoxCard>
        );
      case 1:
        return (
          <BoxCard>
            <Title>차량 청결도 확인</Title>
            <Message>차량 내부는 깨끗했나요?</Message>
            <div>
              {[...Array(5)].map((n, i) => (
                <Star key={i} selected={i < rating} onClick={() => setRating(i + 1)} />
              ))}
            </div>
            <CheckboxContainer>
              <CheckboxLabel>
                🥤 쓰레기 방치
                <input type="checkbox" onChange={() => handleCheckboxChange('쓰레기 방치')} />
              </CheckboxLabel>
              <CheckboxLabel>
                🐾 반려동물 흔적
                <input type="checkbox" onChange={() => handleCheckboxChange('반려동물 흔적')} />
              </CheckboxLabel>
              <CheckboxLabel>
                🚬 흡연 흔적/냄새
                <input type="checkbox" onChange={() => handleCheckboxChange('흡연 흔적/냄새')} />
              </CheckboxLabel>
              <CheckboxLabel>
                ☕️ 시트 오염
                <input type="checkbox" onChange={() => handleCheckboxChange('시트 오염')} />
              </CheckboxLabel>
              <CheckboxLabel>
                👜 분실물 발견
                <input type="checkbox" onChange={() => handleCheckboxChange('분실물 발견')} />
              </CheckboxLabel>
            </CheckboxContainer>
            <ConfirmButton onClick={handleNext}>다음</ConfirmButton>
          </BoxCard>
        );
      case 2:
        return (
          <BoxCard>
            <Title>차량 상태 및 불편점 확인</Title>
            <Message>이번 이용 중, 기존에 없던 새로운 손상이나 문제가 발생했나요?</Message>
            <ButtonContainer>
              <ConfirmButton onClick={() => setStep(4)}>아니요, 문제 없었어요</ConfirmButton>
              <ConfirmButton onClick={handleNext}>네, 새로운 문제가 있어요</ConfirmButton>
            </ButtonContainer>
          </BoxCard>
        );
      case 3:
        return (
          <BoxCard>
            <Title>상세 내용 입력</Title>
            <SelectForm value={damageType} onChange={(e) => setDamageType(e.target.value)}>
              <option value="">문제 유형을 선택하세요</option>
              <option value="계기판 경고등">계기판 경고등</option>
              <option value="타이어 문제">타이어 문제</option>
              <option value="외부 스크래치">외부 스크래치</option>
              <option value="내부 파손">내부 파손</option>
              <option value="기타">기타</option>
            </SelectForm>
            <Textarea
              placeholder="상세 설명을 입력하세요 (선택 사항)"
              value={damageDescription}
              onChange={(e) => setDamageDescription(e.target.value)}
            />
            <ConfirmButton onClick={() => setStep(4)}>제출</ConfirmButton>
          </BoxCard>
        );
      case 4:
        return (
          <BoxCard>
            <Title>소중한 피드백 감사합니다!</Title>
            <Message>다음 운전자가 기분 좋게 이용할 수 있을 거예요.</Message>
            <HomeButton to="/">홈으로 돌아가기</HomeButton>
          </BoxCard>
        );
      default:
        return null;
    }
  };

  return <PageLayout>{renderStep()}</PageLayout>;
};

export default ReturnPage;

const PageLayout = styled.div`
  font-family: 'Pretendard', sans-serif;
  background-color: #F8F5F2;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const BoxCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 20px;
  width: 100%;
  max-width: 420px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #5d4037;
  margin: 0;
`;

const Message = styled.p`
  font-size: 16px;
  color: #795548;
  margin: 0;
`;

const HomeButton = styled(Link)`
  margin-top: 4px;
  height: 52px;
  border: none;
  border-radius: 999px; /* Pill shape */
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s, transform 0.1s;
  background: #a47551; /* Moca: Primary */
  box-shadow: 0 10px 24px rgba(164, 117, 81, .35); /* Moca: Shadow */
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4px 10px rgba(164, 117, 81, .25);
  }
`;

const ConfirmButton = styled.button`
  margin-top: 4px;
  height: 52px;
  border: none;
  border-radius: 999px; /* Pill shape */
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s, transform 0.1s;
  background: #a47551; /* Moca: Primary */
  box-shadow: 0 10px 24px rgba(164, 117, 81, .35); /* Moca: Shadow */
  width: 100%;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4px 10px rgba(164, 117, 81, .25);
  }

  &:disabled {
    background: #d7ccc8; /* Moca: Disabled */
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StarIcon = styled.span`
  cursor: pointer;
  font-size: 2.5rem;
  color: #ffc107;
  margin: 0 5px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 1rem;
  text-align: left;
`;

const CheckboxLabel = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 16px;
  color: #5d4037;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    border: 1px solid #e7e0d9;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    transition: background-color 0.2s;

    &:checked {
      background-color: #a47551;
      border-color: #a47551;
    }
  }
`;

const SelectForm = styled.select`
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #e7e0d9;
  padding: 0 16px;
  background: #fdfbfa;
  font-size: 16px;
  color: #5d4037;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23795548%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 8px 8px;
  box-sizing: border-box;

  &:focus {
    border-color: #a47551;
    background-color: #fff;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 16px;
  height: 120px;
  border-radius: 12px;
  border: 1px solid #e7e0d9;
  background: #fdfbfa;
  font-size: 16px;
  color: #5d4037;
  resize: vertical;
  box-sizing: border-box;
  outline: none;

  &::placeholder {
    color: #b0a49a;
  }

  &:focus {
    border-color: #a47551;
    background-color: #fff;
  }
`;
