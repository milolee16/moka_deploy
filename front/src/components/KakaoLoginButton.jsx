import styled from "styled-components";
import { useState } from 'react';
import KakaoLoginImage from '../../public/images/login/kakao_login_medium_wide.png'; // Import the local image

const KakaoLoginButton = ({ redirectPath = "/auth/kakao/callback" }) => {
    const [isLoading, setIsLoading] = useState(false);

    const KAKAO_REST_API_KEY = "8232a2b7504ba934a6dacac363619fa8";
    const KAKAO_REDIRECT_URI = "http://localhost:3000/auth/kakao/callback/test";
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

    const handleLogin = () => {
        if (isLoading) return;

        setIsLoading(true);
        window.location.href = KAKAO_AUTH_URL;
    };

    return (
        <StyledKakaoButton onClick={handleLogin} disabled={isLoading}>
            <img src={KakaoLoginImage} alt="카카오 로그인" />
        </StyledKakaoButton>
    );
};

export default KakaoLoginButton;

const StyledKakaoButton = styled.button`
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    overflow: hidden;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }

    img {
        height: 100%;
        width: 100%;
        object-fit: cover;
    }
`;