import React, { useEffect, useState, useRef } from 'react'; // useRef import 확인
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const KakaoCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    const [message, setMessage] = useState("로그인 처리 중..."); // 사용자에게 보여줄 메시지 상태
    const hasRun = useRef(false); // useRef 사용을 위해 React.useRef -> useRef로 변경

    useEffect(() => {
        if (hasRun.current) {
            return;
        }

        const handleOAuthKakao = async () => {
            const code = new URLSearchParams(location.search).get('code');

            if (code) {
                hasRun.current = true;
                try {
                    const response = await axios.post('http://localhost:8080/api/auth/kakao/login', { code });
                    const { accessToken } = response.data;

                    if (accessToken) {
                        loginWithToken(accessToken);
                        // 성공 메시지는 loginWithToken에서 alert로 보여주므로 여기서 별도 처리 안 함
                    } else {
                        throw new Error("액세스 토큰을 받지 못했습니다.");
                    }
                } catch (error) {
                    console.error("카카오 로그인 처리 실패:", error);

                    // --- 👇 여기가 핵심 수정 부분 ---
                    if (error.response && error.response.status === 429) {
                        // 429 에러일 경우
                        setMessage("요청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.");
                        alert("요청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.");
                    } else {
                        // 그 외 다른 에러일 경우
                        setMessage("로그인에 실패했습니다. 다시 시도해주세요.");
                        alert("로그인에 실패했습니다.");
                    }
                    navigate('/loginTest');
                }
            } else {
                alert("카카오 인증 코드를 받지 못했습니다.");
                navigate('/loginTest');
            }
        };

        handleOAuthKakao();
    }, [location, navigate, loginWithToken]);

    return (
        <></>
    );
};

export default KakaoCallback;