import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const NoticesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 추가
  const [notices, setNotices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [expandedId, setExpandedId] = useState(null);
  const categories = ['전체', '안내', '신규서비스', '업데이트'];

  const isAdmin = user?.role === 'admin';

  // 수정 기능을 위한 state
  const [editingId, setEditingId] = useState(null); // 현재 수정 중인 공지사항의 ID
  const [editedContent, setEditedContent] = useState(''); // 수정 중인 내용

  // 서버에서 공지사항 목록을 가져오는 함수
  const fetchNotices = () => {
    fetch('http://localhost:8080/api/notices')
      .then((response) => {
        if (!response.ok) throw new Error('네트워크 응답 오류');
        return response.json();
      })
      .then((data) => setNotices(data))
      .catch((error) => console.error('공지사항 로딩 실패:', error));
  };

  // 컴포넌트가 처음 로드될 때 공지사항 목록을 가져옵니다.
  useEffect(() => {
    fetchNotices();
  }, []);

  // 글쓰기 페이지로 이동
  const handleWrite = () => navigate('/notices/write');

  // '수정' 버튼 클릭 시, 수정 모드로 전환
  const handleEditClick = (notice) => {
    setEditingId(notice.id);
    setEditedContent(notice.content);
  };

  // '확인' 버튼 클릭 시, 수정된 내용을 DB에 저장
  const handleUpdateSubmit = (noticeToUpdate) => {
    fetch(`http://localhost:8080/api/notices/${noticeToUpdate.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${accessToken}` // TODO: 실제 인증 토큰 추가
      },
      body: JSON.stringify({
        category: noticeToUpdate.category,
        title: noticeToUpdate.title,
        content: editedContent,
      }),
    })
      .then((response) => {
        if (response.ok) {
          alert('수정되었습니다.');
          setEditingId(null);
          fetchNotices();
        } else {
          alert('수정에 실패했습니다.');
        }
      })
      .catch((error) => console.error('수정 처리 중 오류 발생:', error));
  };

  // '삭제' 버튼 클릭 시
  const handleDelete = (id) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      fetch(`http://localhost:8080/api/notices/${id}`, {
        method: 'DELETE',
        // headers: { 'Authorization': `Bearer ${accessToken}` } // TODO: 실제 인증 토큰 추가
      })
        .then((response) => {
          if (response.status === 204) {
            alert('공지사항이 삭제되었습니다.');
            fetchNotices();
          } else {
            alert('삭제에 실패했습니다.');
          }
        })
        .catch((error) => console.error('삭제 처리 중 오류 발생:', error));
    }
  };

  // 공지사항 항목을 열고 닫는 함수
  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setEditingId(null); // 다른 항목을 열면 수정 모드는 자동으로 해제
  };

  // 카테고리 필터링 및 최신순 정렬
  const filteredNotices = [...notices] // 원본 배열 복사
    .filter(
      (notice) =>
        activeCategory === '전체' || notice.category === activeCategory
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 날짜 기준 내림차순 정렬

  return (
    <PageLayout>
      <Header>
        <TitleWrapper>
          <BackButton onClick={() => navigate(-1)}>‹</BackButton>
          <Title>공지사항</Title>
        </TitleWrapper>
      </Header>

      <CategoryTabs>
        <CategoryButtonContainer>
          {categories.map((category) => (
            <CategoryButton
              key={category}
              isActive={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </CategoryButton>
          ))}
        </CategoryButtonContainer>
        {isAdmin && <WriteButton onClick={handleWrite}>글쓰기</WriteButton>}
      </CategoryTabs>

      <NoticeList>
        {filteredNotices.map((notice) => (
          <NoticeItemWrapper key={notice.id}>
            <NoticeItemHeader onClick={() => handleToggle(notice.id)}>
              <NoticeInfo>
                <NoticeTitle>
                  <NoticeCategoryTag>[{notice.category}]</NoticeCategoryTag>
                  {notice.title}
                </NoticeTitle>
                <NoticeMeta>
                  <NoticeWriter>{notice.writer}</NoticeWriter>
                  <NoticeDate>
                    {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                  </NoticeDate>
                </NoticeMeta>
              </NoticeInfo>
              <IconWrapper isExpanded={expandedId === notice.id}>
                <FiChevronDown size={20} />
              </IconWrapper>
            </NoticeItemHeader>

            {expandedId === notice.id &&
              (editingId === notice.id ? (
                // 수정 모드 UI
                <EditContainer>
                  <EditTextArea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={5}
                  />
                  <AdminActions>
                    <ActionButton onClick={() => setEditingId(null)}>
                      취소
                    </ActionButton>
                    <ActionButton onClick={() => handleUpdateSubmit(notice)}>
                      확인
                    </ActionButton>
                  </AdminActions>
                </EditContainer>
              ) : (
                // 일반 보기 모드 UI
                <>
                  <NoticeContent>{notice.content}</NoticeContent>
                  {isAdmin && (
                    <AdminActions>
                      <ActionButton onClick={() => handleEditClick(notice)}>
                        수정
                      </ActionButton>
                      <ActionButton onClick={() => handleDelete(notice.id)}>
                        삭제
                      </ActionButton>
                    </AdminActions>
                  )}
                </>
              ))}
          </NoticeItemWrapper>
        ))}
      </NoticeList>
    </PageLayout>
  );
};

export default NoticesPage;

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
  justify-content: space-between;
  padding: 8px 0;
  margin-bottom: 16px;
  flex-shrink: 0;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
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

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #5d4037;
  margin: 0;
`;

const WriteButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;

  ${({ isActive }) =>
    isActive
      ? css`
          background-color: #5d4037;
          color: #ffffff;
          border: 1px solid #5d4037;
        `
      : css`
          background-color: #ffffff;
          color: #795548;
          border: 1px solid #e7e0d9;

          &:hover {
            background-color: #f5f1ed;
            border-color: #d7ccc8;
          }
        `}
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-shrink: 0;
  overflow-x: auto;
  justify-content: space-between; /* Added this */
`;

const CategoryButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const CategoryButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;

  ${({ isActive }) =>
    isActive
      ? css`
          background-color: #5d4037;
          color: #ffffff;
          border: 1px solid #5d4037;
        `
      : css`
          background-color: #ffffff;
          color: #795548;
          border: 1px solid #e7e0d9;

          &:hover {
            background-color: #f5f1ed;
            border-color: #d7ccc8;
          }
        `}
`;

const NoticeList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const NoticeItemWrapper = styled.div`
  border-bottom: 1px solid #f0ebe5;

  &:last-child {
    border-bottom: none;
  }
`;

const NoticeItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
`;

const NoticeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NoticeTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #3e2723;
  margin: 0;
  display: flex;
  align-items: center;
`;

const NoticeCategoryTag = styled.span`
  font-weight: 700;
  color: #a1887f;
  margin-right: 8px;
`;

const NoticeDate = styled.p`
  font-size: 13px;
  color: #a1887f;
  margin: 0;
`;

const IconWrapper = styled.div`
  color: #a1887f;
  transition: transform 0.3s ease;
  transform: ${({ isExpanded }) =>
    isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const NoticeContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #595959;
  white-space: pre-wrap;
  padding: 0 16px 16px;
`;

const EditContainer = styled.div`
  padding: 0 16px 16px;
`;

const EditTextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #d7ccc8;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #5d4037;
  }
`;

const AdminActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 16px 16px;

  ${EditContainer} & {
    padding-top: 10px;
    padding-bottom: 0;
  }
`;

const ActionButton = styled.button`
  background-color: #f5f1ed;
  border: 1px solid #e7e0d9;
  color: #5d4037;
  font-weight: 600;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e7e0d9;
  }
`;

const NoticeMeta = styled.div`
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: #a1887f;
`;

const NoticeWriter = styled.span`
  font-weight: 600;
  color: #795548;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #a1887f;
  font-size: 15px;
`;
