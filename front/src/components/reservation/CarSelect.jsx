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

    // 필터 상태
    const [brandFilter, setBrandFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('');

    useEffect(() => {
        const fetchCars = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:8080/api/rental/admin/cars");
                if (!response.ok) throw new Error(`Server responded with ${response.status}`);

                const data = await response.json();
                
                // 데이터 가공 (브랜드 및 차종 추가)
                const formattedData = data.map(car => {
                    const brand = car.carName.split(' ')[0];
                    
                    // DB의 vehicleTypeCode에 따라 차종을 결정하는 로직으로 수정
                    let type;
                    if (car.vehicleTypeCode === 'EV') {
                        type = '전기차';
                    } else if (car.vehicleTypeCode === 'SUV') {
                        type = 'SUV';
                    } else {
                        type = '세단/쿠페'; // 기본값
                    }
                    
                    return {
                        ...car,
                        brand,
                        type,
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

    const info = useMemo(() => location.state || {}, [location.state]);

    const handleSelectCar = (car) => {
        navigate("/insurance", {
            state: { ...info, car },
        });
    };

    // 필터링과 정렬 로직
    const filteredAndSortedCars = useMemo(() => {
        let result = [...cars];

        // 브랜드 필터
        if (brandFilter) {
            result = result.filter(car => car.brand === brandFilter);
        }

        // 차종 필터
        if (typeFilter) {
            result = result.filter(car => car.type === typeFilter);
        }

        // 가격 정렬
        if (sortOrder === 'price_asc') {
            result.sort((a, b) => a.rentPricePer10min - b.rentPricePer10min);
        } else if (sortOrder === 'price_desc') {
            result.sort((a, b) => b.rentPricePer10min - a.rentPricePer10min);
        }

        return result;
    }, [cars, brandFilter, typeFilter, sortOrder]);

    // 필터 옵션 생성
    const carBrands = useMemo(() => [...new Set(cars.map(car => car.brand))], [cars]);
    const carTypes = useMemo(() => [...new Set(cars.map(car => car.type))], [cars]);

    if (loading) return <Wrap>Loading...</Wrap>;
    if (error) return <Wrap>Error: {error.message}</Wrap>;

    return (
        <Wrap>
            <HeaderCard>
                <HeaderLine>
                    <Dot /> <Label>대여·반납</Label>
                    <Value>{info.locationName || locationName}</Value>
                </HeaderLine>
            </HeaderCard>

            <FilterContainer>
                <Select onChange={(e) => setBrandFilter(e.target.value)}>
                    <option value="">모든 브랜드</option>
                    {carBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </Select>
                <Select onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">모든 차종</option>
                    {carTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </Select>
                <Select onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="">기본 정렬</option>
                    <option value="price_asc">가격 낮은 순</option>
                    <option value="price_desc">가격 높은 순</option>
                </Select>
            </FilterContainer>

            <List>
                {filteredAndSortedCars.map((car) => (
                    <Item key={car.id} onClick={() => handleSelectCar(car)}>
                        <Thumb>
                            <img src={car.imageUrl} alt={car.carName} />
                        </Thumb>
                        <Meta>
                            <CarName>{car.carName}</CarName>
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
    border: 1px solid #e7e0d9;
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
    color: #795548;
    min-width: 60px;
`;

const Value = styled.span`
    font-weight: 600;
    font-size: 14px;
    color: #5d4037;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Dot = styled.span`
    width: 6px; height: 6px; border-radius: 50%; background:#a47551; display:inline-block;
`;

const FilterContainer = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
`;

const Select = styled.select`
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #e7e0d9;
    background-color: #fff;
    font-size: 14px;
    color: #5d4037;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%235D4037%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position: right 10px top 50%;
    background-size: .65em auto;
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
    border: 1px solid #e7e0d9;
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
