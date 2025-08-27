import { useMemo } from "react";
import styled from "styled-components";
import { HiOutlineChevronRight } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import lamborghiniHuracanSrc from "../../assets/images/cars/lamborghini-huracan.png";
import astonMartinDB12Src from "../../assets/images/cars/aston-martin-db12.png";
import fordMustangMachESrc from "../../assets/images/cars/ford-mustang-mach-e.png";
import ferrari12CilindriSrc from "../../assets/images/cars/ferrari-12-cilindri.png";

/** 고정가 제거된 기본 차량 리스트 */
const LUXURY_CARS = [
    { id: "lamborghini-huracan", name: "람보르기니 우라칸", img: lamborghiniHuracanSrc },
    { id: "aston-martin-db12",   name: "애스턴 마틴 DB12",  img: astonMartinDB12Src },
    { id: "ford-mustang-mach-e", name: "포드 머스탱 마하-E", img: fordMustangMachESrc },
    { id: "ferrari-12-cilindri", name: "페라리 12 칠린드리", img: ferrari12CilindriSrc },
];

const CarSelect = ({
                       locationName = "반얀트리 호텔",
                       cars = LUXURY_CARS,
                   }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 이전 페이지(Map.jsx)에서 넘겨준 모든 정보(날짜, 장소, price 등)
    const info = useMemo(() => location.state || {}, [location.state]);
    // info.start, info.end, info.price, info.billing, info.locationName

    const handleSelectCar = (car) => {
        navigate("/insurance", {
            state: { ...info, car }, // 예약/장소/요금 + 선택 차량까지 묶어서 다음 페이지로
        });
    };

    return (
        <Wrap>
            <HeaderCard>
                <HeaderLine>
                    <Dot /> <Label>대여·반납</Label>
                    <Value>{info.locationName || locationName}</Value>
                </HeaderLine>
                {/* 원하면 총 요금 미리보기도 여기서 보여줄 수 있어요:
        {typeof info.price === "number" && (
          <SubValue>예상 요금: {info.price.toLocaleString()}원</SubValue>
        )} */}
            </HeaderCard>

            <List>
                {cars.map((car) => (
                    <Item key={car.id} onClick={() => handleSelectCar(car)}>
                        <Thumb>
                            <img src={car.img} alt={car.name} />
                        </Thumb>
                        <Meta>
                            <CarName>{car.name}</CarName>
                        </Meta>
                        <NextIcon>
                            <HiOutlineChevronRight size={22} />
                        </NextIcon>
                    </Item>
                ))}
            </List>
        </Wrap>
    );
};

export default CarSelect;

/* ==== styles ==== */
const Wrap = styled.div``;

const HeaderCard = styled.div`
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e7e0d9; /* Moca: Beige Border */
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    padding: 14px 16px;
    margin-bottom: 14px;
`;

const HeaderLine = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
`;

const Label = styled.span`
    font-size: 12px;
    color: #795548; /* Moca: Medium Brown */
    min-width: 60px;
`;

const Value = styled.span`
    font-weight: 600;
    font-size: 14px;
    color: #5d4037; /* Moca: Dark Brown */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const SubValue = styled.div`
    margin-top: 6px;
    font-size: 13px;
    color: #795548;
`;

const Dot = styled.span`
    width: 6px; height: 6px; border-radius: 50%; background:#a47551; display:inline-block; /* Moca: Primary */
`;

const List = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0; margin: 0; list-style: none;
`;

const Item = styled.li`
    display: grid;
    grid-template-columns: 130px 1fr auto;
    align-items: center;
    gap: 16px;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e7e0d9; /* Moca: Beige Border */
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    padding-right: 16px;
    overflow: hidden;
    transition: transform .06s ease, box-shadow .12s ease;
    cursor: pointer;
    &:active { transform: scale(0.995); }
`;

const Thumb = styled.div`
    width: 130px; height: 100px;
    overflow: hidden; background:#f3f3f3;
    img { width: 100%; height: 100%; object-fit: contain; display:block; }
`;

const Meta = styled.div`
    display: flex; flex-direction: column; gap: 4px; min-width: 0;
`;

const CarName = styled.div`
    font-size: 16px; font-weight: 700; color:#5d4037;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;

const NextIcon = styled.div`
    width: 28px; height: 28px; border-radius: 999px; border: 1px solid #e7e0d9; background:#fff;
    display: grid; place-items: center;
    color: #adb5bd;
`;
