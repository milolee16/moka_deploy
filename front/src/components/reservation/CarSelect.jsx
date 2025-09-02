import { useMemo, useEffect, useState } from "react";
import styled from "styled-components";
import { HiOutlineChevronRight } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";

const CarSelect = ({ locationName = "반얀트리 호텔" }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const carImages = import.meta.glob("../assets/images/cars/*", { eager: true });

    useEffect(() => {
        const fetchCars = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:8080/api/rental/admin/cars");

                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error("Error response from server:", response.status, response.statusText, errorBody);
                    throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                                const formattedData = data.map(car => {
                    return {
                        id: car.id,
                        carName: car.carName,
                        imageUrl: car.imageUrl,
                        rentPricePer10min: car.rentPricePer10min
                    };
                });
                setCars(formattedData);
            } catch (error) {
                console.error("Failed to fetch cars:", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCars();
    }, []);

    // 이전 페이지(Map.jsx)에서 넘겨준 모든 정보(날짜, 장소, price 등)
    const info = useMemo(() => location.state || {}, [location.state]);
    // info.start, info.end, info.price, info.billing, info.locationName

    const handleSelectCar = (car) => {
        navigate("/insurance", {
            state: { ...info, car }, // 예약/장소/요금 + 선택 차량까지 묶어서 다음 페이지로
        });
    };

    if (loading) {
        return <Wrap>Loading...</Wrap>;
    }

    if (error) {
        return <Wrap>Error: {error.message}</Wrap>;
    }

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
                            <img
                                src={car.imageUrl}
                                alt={car.carName}
                            />
                        </Thumb>
                        <Meta>
                            <CarName>{car.carName}</CarName> {/* VehicleType.name에서 온 표시용 이름 */}
                            <CarPrice>10분당 {car.rentPricePer10min.toLocaleString()}원</CarPrice>
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

const CarPrice = styled.div`
    font-size: 14px; color: #795548;
`;

const NextIcon = styled.div`
    width: 28px; height: 28px; border-radius: 999px; border: 1px solid #e7e0d9; background:#fff;
    display: grid; place-items: center;
    color: #adb5bd;
`;
