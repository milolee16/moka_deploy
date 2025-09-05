import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import heroImageSrc from "../../public/images/cars/aston-martin-db12.png";
import {useEffect} from "react";
import axios from "axios";

const Welcome = () => {
    const navigate = useNavigate();

    useEffect( () => {
        const fetchData = async () => {
            try {
                const res = await axios.get("http://localhost:5000/test");
                console.log(res.data);
            } catch (err) {
                console.error("Flask 연결 오류:", err);
            }


        };
        const fetchData2 = async () => {
            try {
                const res = await axios.post("http://localhost:5000/get_response");
                console.log(res.data);
            } catch (err) {
                console.error("ai타고옴?", err);
            }


        };

        fetchData2();
        }, []);


    return (
        <Page>
            <HeroCard>
                <HeroImage src={heroImageSrc} alt="애스턴 마틴 DB12 차량" />
                <HeroText>
                    <Title>
                        프리미엄 차량을
                        <br />
                        가장 편리하게
                    </Title>
                    <Subtitle>모카와 함께 특별한 여정을 시작하세요.</Subtitle>
                </HeroText>
            </HeroCard>
            <ReserveButton onClick={() => navigate("/home")}>
                지금 시작하기
            </ReserveButton>
        </Page>
    );
};

export default Welcome;

/* ============ styles ============ */

const Page = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 40px;
    /* Layout에서 제공하는 padding을 제외한 실제 뷰포트 높이를 채우도록 설정 */
    min-height: calc(100vh - 82px - 32px);
`;

const HeroCard = styled.div`
    /* 특별한 스타일 없이 Page의 flex 설정에 따라 중앙 정렬됩니다. */
`;

const HeroImage = styled.img`
    width: 100%;
    max-width: 400px;
    margin-bottom: 24px;
    object-fit: contain;
`;

const HeroText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Title = styled.h1`
    font-size: 28px;
    font-weight: 800;
    line-height: 1.4;
    color: #5d4037; /* Moca: Dark Brown */
    margin: 0;
`;

const Subtitle = styled.p`
    font-size: 16px;
    color: #795548; /* Moca: Medium Brown */
    margin: 0;
`;

const ReserveButton = styled.button`
    width: 100%;
    height: 52px;
    border-radius: 999px; /* Pill shape */
    border: none;
    background: #a47551; /* Moca: Primary */
    color: #fff;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: background-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 10px 24px rgba(164, 117, 81, 0.35); /* Moca: Shadow */

    &:active {
        transform: scale(0.99);
    }
`;