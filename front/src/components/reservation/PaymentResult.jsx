import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";            // ✅ 추가
import styled from "styled-components";
import axios from "axios"; // Import axios for API call
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth

function PaymentResult() {
    const { status } = useParams();
    const navigate = useNavigate();
    const { user, authLoading } = useAuth(); // Get user and authLoading from AuthContext

    console.log("User object in PaymentResult:", user); // Add this line
    console.log("Auth loading status:", authLoading); // Add this line


    // API base URL (same as in PaymentOptions.jsx)
    const API_BASE_URL =
        import.meta.env.MODE === "development" ? "http://192.168.2.23:8080" : "http://localhost:8080";

    // ✅ iframe으로 열렸다면 상위(top)로 탈출해서 중복 헤더 제거!
    useEffect(() => {
        try {
            if (window.top !== window.self) {
                // replace: 뒤로가기에 결제 iframe이 남지 않게
                window.top.location.replace(window.location.href);
            }
        } catch (e) {
            // 혹시 cross-origin 에러가 나면(거의 없음) 그냥 무시
        }
    }, []);

    // New useEffect for saving reservation
    useEffect(() => {
        // Only attempt to save if auth is not loading and status is success
        if (!authLoading && status === "success") {
            const storedInfo = sessionStorage.getItem('reservationInfo');
            if (storedInfo) {
                const info = JSON.parse(storedInfo);
                sessionStorage.removeItem('reservationInfo'); // Clear stored info

                // Ensure dates are Date objects before converting to ISO string
                const startDateObj = info.startDate ? new Date(info.startDate) : null;
                const endDateObj = info.endDate ? new Date(info.endDate) : null;

                // Construct ReservationRequestDto
                const reservationData = {
                    carId: info.car?.id,
                    locationName: info.locationName, // Assuming locationName is available in info
                    startDate: startDateObj?.toISOString(),
                    endDate: endDateObj?.toISOString(),
                    passengerCount: info.passengerCount, // Assuming passengerCount is available in info
                    memo: info.memo, // Assuming memo is available in info
                    totalAmount: info.payment?.totalPrice,
                };

                // Make API call to save reservation
                const saveReservation = async () => {
                    // Check if user and token exist
                    if (!user || !user.token) {
                        console.error("User not authenticated or token not available. Cannot save reservation.");
                        return; // Exit if no user or token
                    }

                    try {
                        await axios.post(`${API_BASE_URL}/api/reservations`, reservationData, {
                            headers: {
                                Authorization: `Bearer ${user.token}`,
                            },
                        });
                        console.log("Reservation saved successfully!");
                        // Optionally, show a success message or redirect
                    } catch (error) {
                        console.error("Failed to save reservation:", error);
                        // Optionally, show an error message to the user
                    }
                };

                saveReservation();
            } else {
                console.warn("No reservation info found in sessionStorage for successful payment.");
            }
        }
    }, [status, authLoading, user]); // Depend on status, authLoading, and user

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
    min-height: 100vh;
    text-align: center;
`;
const Icon = styled.div`font-size: 48px;`;
const Title = styled.h1`font-size: 20px; font-weight: 700; color: #5d4037;`;
const Message = styled.p`font-size: 16px; color: #6d4c41; margin: 0;`;
const HomeButton = styled.button`
    margin-top: 16px; padding: 12px 28px; font-size: 15px; font-weight: 600;
    color: white; background-color: #8b4513; border: none; border-radius: 12px; cursor: pointer;
    transition: background-color 0.2s ease;
    &:hover { background-color: #a0522d; }
`;
