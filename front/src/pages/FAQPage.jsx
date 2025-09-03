import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';

// 샘플 데이터: 총 10개로 확장
const sampleFaqs = [
    {
        id: 1,
        category: '서비스 이용',
        question: '비대면으로 예약하고 바로 차량을 이용할 수 있나요?',
        answer: '네, 저희 앱을 통해 예약, 결제, 차량 문 제어까지 모두 비대면으로 가능합니다. 예약 완료 후 앱의 스마트키로 차량을 바로 이용해보세요.'
    },
    {
        id: 2,
        category: '결제',
        question: '자동차 보험은 자동으로 적용되나요? 추가 보험 가입이 필요한가요?',
        answer: '모든 차량은 자동차 종합보험(대인, 대물, 자손)에 기본으로 가입되어 있습니다. 운행 전, 자기차량손해(자차) 보험 상품을 선택하여 가입하실 수 있으며, 이는 운전자 과실로 인한 차량 수리비를 보장해줍니다.'
    },
    {
        id: 3,
        category: '서비스 이용',
        question: '차량 반납 장소는 어디인가요? 지정된 장소가 있나요?',
        answer: '대여한 장소에 그대로 반납하는 것이 원칙입니다. 만약 다른 장소에 반납(편도 반납)을 원하시면, 예약 시 편도 가능 차량인지 확인 후 이용해주세요. 지정된 주차 구역(차고지)이 아닌 곳에 반납 시 추가 요금이 발생할 수 있습니다.'
    },
    {
        id: 4,
        category: '계정',
        question: '운전자 등록 조건은 어떻게 되나요? (나이, 운전 경력)',
        answer: '만 21세 이상, 운전면허 취득일로부터 1년 이상 경과한 고객님만 운전자로 등록하고 서비스를 이용하실 수 있습니다. 일부 고급 차종의 경우 별도의 연령 및 경력 조건이 적용될 수 있습니다.'
    },
    {
        id: 5,
        category: '서비스 이용',
        question: '이용 시간을 연장하고 싶으면 어떻게 하나요?',
        answer: '반납 시간 이전에 앱 내의 [이용 내역 > 연장하기] 버튼을 통해 연장이 가능합니다. 단, 다음 예약이 있는 차량의 경우 연장이 불가능할 수 있습니다.'
    },
    {
        id: 6,
        category: '결제',
        question: '예약을 취소하면 수수료가 발생하나요?',
        answer: '예약 취소 시점에 따라 수수료 정책이 다르게 적용됩니다. 대여 시작 24시간 이전에 취소할 경우 전액 환불되며, 그 이후에는 시간대별로 수수료가 차등 부과됩니다. 자세한 내용은 [이용 약관 > 취소 및 환불 규정]을 확인해주세요.'
    },
    {
        id: 7,
        category: '서비스 이용',
        question: '차량 유류비는 어떻게 정산되나요?',
        answer: '차량 내에 비치된 주유카드를 이용해 주유해주세요. 유류비는 반납 후 실제 주행 거리에 따라 km당 유류비로 계산되어 등록된 카드로 자동 청구됩니다.'
    },
    {
        id: 8,
        category: '기타',
        question: '운행 중 사고가 나거나 차량에 문제가 생기면 어떻게 해야 하나요?',
        answer: '즉시 운행을 중단하고 안전한 곳으로 차량을 이동시킨 후, 앱 내의 고객센터 또는 긴급출동 버튼을 통해 연락주세요. 24시간 언제든지 신속하게 도와드리겠습니다.'
    },
    {
        id: 9,
        category: '기타',
        question: '차량 내에서 흡연이 가능한가요?',
        answer: '모든 차량 내에서는 흡연(전자담배 포함)이 엄격히 금지되어 있습니다. 쾌적한 이용 환경을 위해 모든 고객님의 협조를 부탁드리며, 위반 시 페널티 요금 및 실내 클리닝 비용이 부과됩니다.'
    },
    {
        id: 10,
        category: '기타',
        question: '차량에 물건을 두고 내렸어요. 어떻게 찾을 수 있나요?',
        answer: '고객센터로 연락주시면 분실물 접수를 도와드립니다. 차량 반납 후 24시간 이내에 접수된 건에 한해 최대한 수색을 도와드리지만, 분실물에 대한 보상은 어려우니 내리시기 전에 꼭 확인 부탁드립니다.'
    }
];


const FaqPage = () => {
    const navigate = useNavigate();
    const [faqs, setFaqs] = useState(sampleFaqs);
    const [activeCategory, setActiveCategory] = useState('전체');
    const [expandedId, setExpandedId] = useState(null);
    const categories = ['전체', '계정', '결제', '서비스 이용', '기타'];

    /*
    // NOTE: 실제 API 연동 시 아래 주석을 해제하고 위의 useState([])로 변경하세요.
    useEffect(() => {
        fetch('http://localhost:8080/api/faqs')
            .then(response => response.json())
            .then(data => setFaqs(data))
            .catch(error => console.error("FAQ 로딩 실패:", error));
    }, []);
    */

    const handleToggle = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredFaqs = faqs.filter(faq => activeCategory === '전체' || faq.category === activeCategory);

    return (
        <PageLayout>
            {/* Header와 CategoryTabs에 padding을 개별적으로 추가하여 전체 레이아웃 유지 */}
            <Header>
                <TitleWrapper>
                    <BackButton onClick={() => navigate(-1)}>‹</BackButton>
                    <Title>고객센터</Title>
                </TitleWrapper>
            </Header>

            <CategoryTabs>
                <CategoryButtonContainer>
                    {categories.map((category) => (
                        <CategoryButton key={category} isActive={activeCategory === category} onClick={() => setActiveCategory(category)}>
                            {category}
                        </CategoryButton>
                    ))}
                </CategoryButtonContainer>
            </CategoryTabs>

            {/* FaqList 자체는 padding이 없지만, 내부 콘텐츠에 padding 적용 */}
            <FaqList>
                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq) => (
                        <FaqItemWrapper key={faq.id}>
                            <FaqItemHeader onClick={() => handleToggle(faq.id)}>
                                <FaqInfo>
                                    <FaqQuestion>
                                        <QuestionPrefix>Q.</QuestionPrefix>
                                        {faq.question}
                                    </FaqQuestion>
                                </FaqInfo>
                                <IconWrapper isExpanded={expandedId === faq.id}>
                                    <FiChevronDown size={20}/>
                                </IconWrapper>
                            </FaqItemHeader>

                            {expandedId === faq.id && (
                                <FaqAnswer>
                                    <AnswerPrefix>A.</AnswerPrefix>
                                    {faq.answer}
                                </FaqAnswer>
                            )}
                        </FaqItemWrapper>
                    ))
                ) : (
                    <EmptyMessage>등록된 FAQ가 없습니다.</EmptyMessage>
                )}
            </FaqList>
        </PageLayout>
    );
};

export default FaqPage;

/* ============ styles ============ */

// CHANGED: PageLayout에서 padding 속성 제거
const PageLayout = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 16px; /* Added padding */
    box-sizing: border-box;
    background-color: #f7f5f3;
`;

// NOTE: PageLayout의 padding을 제거했으므로, Header와 Tabs에 개별적으로 좌우 padding을 줍니다.
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
    padding-right: 16px;
    line-height: 1;
`;

const Title = styled.h1`
    font-size: 20px;
    font-weight: 700;
    color: #5d4037;
    margin: 0;
`;

const CategoryTabs = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-shrink: 0;
    overflow-x: auto;
    /* Removed horizontal padding */
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
    background-color: ${({isActive}) => (isActive ? '#5d4037' : '#ffffff')};
    color: ${({isActive}) => (isActive ? '#ffffff' : '#795548')};
    border: 1px solid ${({isActive}) => (isActive ? '#5d4037' : '#e7e0d9')};

    &:hover {
        background-color: ${({isActive}) => (isActive ? '#5d4037' : '#f5f1ed')};
        border-color: ${({isActive}) => (isActive ? '#5d4037' : '#d7ccc8')};
    }
`;

const FaqList = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-radius: 16px; // 리스트 상단에도 둥근 모서리 적용
    margin: 0 0 16px; /* Removed horizontal margin */

    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
`;

const FaqItemWrapper = styled.div`
    border-bottom: 1px solid #f0ebe5;

    &:last-child {
        border-bottom: none;
    }
`;

// NOTE: 리스트 아이템 내부에 padding을 주어 콘텐츠가 가장자리에 붙지 않도록 합니다.
const FaqItemHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    cursor: pointer;
`;

const FaqInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const FaqQuestion = styled.h2`
    font-size: 16px;
    font-weight: 600;
    color: #3e2723;
    margin: 0;
    display: flex;
    align-items: center;
`;

const QuestionPrefix = styled.span`
    font-weight: 700;
    color: #a1887f;
    margin-right: 8px;
    font-size: 18px;
`;

const IconWrapper = styled.div`
    color: #a1887f;
    transition: transform 0.3s ease;
    transform: ${({isExpanded}) => (isExpanded ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const FaqAnswer = styled.div`
    font-size: 14px;
    line-height: 1.6;
    color: #595959;
    white-space: pre-wrap;
    padding: 0 16px 16px;
    display: flex;
`;

const AnswerPrefix = styled.span`
    font-weight: 700;
    color: #5d4037;
    margin-right: 8px;
    font-size: 18px;
`;

const EmptyMessage = styled.div`
    text-align: center;
    padding: 40px;
    color: #a1887f;
    font-size: 15px;
`;