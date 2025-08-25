import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";

function PaymentResult() {
    const { status } = useParams();
    const navigate = useNavigate();

    const resultMessages = {
        success: {
            title: "결제가 성공적으로 완료되었습니다.",
            message: "MOCA와 함께 즐거운 시간 되세요!",
            icon: "✅",
        },
        cancel: {
            title: "결제가 취소되었습니다.",
            message: "다시 시도하시려면 홈으로 이동해주세요.",
            icon: "⚠️",
        },
        fail: {
            title: "결제에 실패했습니다.",
            message: "문제가 지속되면 고객센터로 문의해주세요.",
            icon: "❌",
        },
    };

    const currentResult = resultMessages[status] || resultMessages.fail;

    return (
        <PageLayout>
            <Icon>{currentResult.icon}</Icon>
            <Title>{currentResult.title}</Title>
            <Message>{currentResult.message}</Message>
            <HomeButton onClick={() => navigate("/home")}>
                홈으로 돌아가기
            </HomeButton>
        </PageLayout>
    );
}

export default PaymentResult;

/* ============ styles ============ */
const PageLayout = styled.main`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 40px 16px;
    min-height: 100vh; /* 화면 한가운데 정렬 */
    text-align: center;
`;

const Icon = styled.div`
    font-size: 48px;
`;

const Title = styled.h1`
    font-size: 20px;
    font-weight: 700;
    color: #5d4037;
`;

const Message = styled.p`
    font-size: 16px;
    color: #6d4c41;
    margin: 0;
`;

const HomeButton = styled.button`
    margin-top: 16px;
    padding: 12px 28px;
    font-size: 15px;
    font-weight: 600;
    color: white;
    background-color: #8b4513;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #a0522d;
    }
`;
