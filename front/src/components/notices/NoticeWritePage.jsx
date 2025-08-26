import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const NoticeWritePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Use useAuth to get user info

    // 1. 입력 내용을 관리하기 위한 state
    const [category, setCategory] = useState('안내'); // 기본 카테고리
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // Get admin name from logged-in user, fallback to '관리자'
    const adminName = user?.username || '관리자';

    // 2. '완료' 버튼 클릭 시 실행될 함수
    const handleSubmit = () => {
        // 간단한 유효성 검사
        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (!content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        // 백엔드 API로 전송할 데이터
        const newNotice = {
            category,
            title,
            content,
            writer: adminName, // Add adminName to the notice data
        };

        // TODO: 실제 API 호출 시에는 인증 토큰(JWT)을 헤더에 담아 보내야 합니다.
        fetch('http://localhost:8080/api/notices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(newNotice),
        })
            .then(response => {
                if (response.status === 201) { // 201 Created
                    alert('공지사항이 성공적으로 등록되었습니다.');
                    navigate('/notices'); // 등록 후 공지사항 목록 페이지로 이동
                } else {
                    alert('등록에 실패했습니다.');
                }
            })
            .catch(error => console.error('공지사항 등록 중 오류 발생:', error));
    };

    return (
        <PageLayout>
            <Header>
                <BackButton onClick={() => navigate(-1)}>‹</BackButton>
                <PageTitle>공지사항 작성</PageTitle>
            </Header>

            <FormContainer>
                <InputGroup>
                    <Label>카테고리</Label>
                    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="안내">안내</option>
                        <option value="신규서비스">신규서비스</option>
                        <option value="업데이트">업데이트</option>
                    </Select>
                </InputGroup>

                <InputGroup>
                    <Label>제목</Label>
                    <Input
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </InputGroup>

                <AdminInfo>작성자: {adminName}</AdminInfo>

                <InputGroup>
                    <Label>내용</Label>
                    <TextArea
                        placeholder="내용을 입력하세요"
                        rows={15}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </InputGroup>

                <SubmitButton onClick={handleSubmit}>완료</SubmitButton>
            </FormContainer>
        </PageLayout>
    );
};

export default NoticeWritePage;

/* ============ styles ============ */
const PageLayout = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 16px;
    box-sizing: border-box;
    background-color: #f7f5f3;
`;

const Header = styled.header`
    display: flex;
    align-items: center;
    padding: 8px 0;
    margin-bottom: 24px;
    flex-shrink: 0;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    font-size: 32px;
    font-weight: bold;
    color: #5d4037;
    cursor: pointer;
    padding: 0 16px 0 0;
    line-height: 1;
`;

const PageTitle = styled.h1`
    font-size: 20px;
    font-weight: 700;
    color: #5d4037;
    margin: 0;
`;

const FormContainer = styled.div`
    background: #ffffff;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #3e2723;
`;

const commonInputStyles = css`
    width: 100%;
    padding: 12px;
    border: 1px solid #d7ccc8;
    border-radius: 8px;
    font-size: 15px;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: #5d4037;
    }
`;

const Input = styled.input`
    ${commonInputStyles}
`;

const Select = styled.select`
    ${commonInputStyles}
    background-color: white;
`;

const TextArea = styled.textarea`
    ${commonInputStyles}
    resize: vertical;
`;

const AdminInfo = styled.div`
    text-align: right;
    font-size: 14px;
    color: #a1887f;
    margin-top: -12px;
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 14px;
    font-size: 16px;
    font-weight: 700;
    background-color: #5d4037;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 12px;

    &:hover {
        background-color: #4e342e;
    }
`;
