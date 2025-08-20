import { useMemo } from "react";
import styled from "styled-components";
import { HiOutlineChevronRight } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import lamborghiniHuracanSrc from "../assets/images/cars/lamborghini-huracan.png";
import astonMartinDB12Src from "../assets/images/cars/aston-martin-db12.png";
import fordMustangMachESrc from "../assets/images/cars/ford-mustang-mach-e.png";
import ferrari12CilindriSrc from "../assets/images/cars/ferrari-12-cilindri.png";

const LUXURY_CARS = [
    {
        id: "lamborghini-huracan",
        name: "람보르기니 우라칸",
        priceText: "₩3,500,000 /일",
        img: lamborghiniHuracanSrc,
    },
    {
        id: "aston-martin-db12",
        name: "애스턴 마틴 DB12",
        priceText: "£850,000 /주",
        img: astonMartinDB12Src,
    },
    {
        id: "ford-mustang-mach-e",
        name: "포드 머스탱 마하=E",
        priceText: "₩2,200,000 /일",
        img: fordMustangMachESrc,
    },
    {
        id: "ferrari-12-cilindri",
        name: "페라리 12 칠린드리",
        priceText: "₩2,800,000 /일",
        img: ferrari12CilindriSrc,
    },
];

const CarSelect = ({
                       locationName = "반얀트리 호텔",
                       cars = LUXURY_CARS,
                   }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 이전 페이지(Map.jsx)에서 넘겨준 모든 정보(날짜, 장소 등)를 'info'라는 변수에 저장합니다.
    const info = useMemo(() => location.state || {}, [location.state]);

    // 'handleSelectCar' 함수는 바로 이곳, CarSelect 컴포넌트 안쪽, return 문 위쪽에 만들어주면 됩니다.
    // 이 함수는 클릭된 자동차의 정보(car)와 이전 페이지의 정보(info)를 합쳐서 다음 페이지로 넘겨주는 역할을 해요.
    const handleSelectCar = (car) => {
        navigate("/insurance", {
            state: { ...info, car },
        });
    };

    return (
        <Wrap>
            <HeaderCard>
                <HeaderLine>
                    <Dot /> <Label>대여·반납</Label>
                    <Value>{info.locationName || locationName}</Value>
                </HeaderLine>
            </HeaderCard>

            <List>
                {cars.map((car) => (
                    <Item key={car.id} onClick={() => handleSelectCar(car)}>
                        <Thumb>
                            <img src={car.img} alt={car.name} />
                        </Thumb>
                        <Meta>
                            <CarName>{car.name}</CarName>
                            <Price>{car.priceText}</Price>
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
const Wrap = styled.div`
  /* Layout 컴포넌트가 페이지의 기본 여백을 관리하므로, 중복되는 padding을 제거하여 일관성을 유지합니다. */
  /* 이 페이지에만 특별히 더 필요한 여백이 있다면 padding-top/bottom 등을 추가할 수 있습니다. */
`;

const HeaderCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
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
  color: #777;
  min-width: 60px;
`;

const Value = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Dot = styled.span`
  width: 6px; height: 6px; border-radius: 50%; background:#222; display:inline-block;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* 브라우저의 기본 ul 스타일(padding, margin)을 제거하여 정렬을 맞춥니다. */
  padding: 0; margin: 0; list-style: none;
`;

const Item = styled.li`
  display: grid;
  /* 이미지 크기에 맞춰 첫 번째 컬럼 너비를 늘려줍니다. */
  grid-template-columns: 130px 1fr auto;
  align-items: center;
  gap: 16px; /* 이미지와 글씨 사이의 간격을 넓힙니다. */
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  /* padding을 제거하고, 이미지가 카드의 일부가 되도록 overflow: hidden을 추가합니다. */
  padding-right: 16px; /* 오른쪽 버튼의 여백만 남겨둡니다. */
  overflow: hidden;
  transition: transform .06s ease, box-shadow .12s ease;
  cursor: pointer; /* 클릭 가능한 요소임을 알려줍니다 */
  &:active { transform: scale(0.995); }
`;

const Thumb = styled.div`
  width: 130px; height: 100px; /* 이미지를 더 크게 키웁니다. */
  overflow: hidden; background:#f3f3f3;
  /* 'cover'는 이미지를 채우기 위해 잘라내고, 'contain'은 잘리지 않게 전체를 보여줍니다. */
  img { width: 100%; height: 100%; object-fit: contain; display:block; }
`;

const Meta = styled.div`
  display: flex; flex-direction: column; gap: 4px; min-width: 0;
`;

const CarName = styled.div`
  font-size: 16px; font-weight: 700; color:#111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;

const Price = styled.div`
  font-size: 13px; color:#666;
`;

const NextIcon = styled.div`
  width: 28px; height: 28px; border-radius: 999px; border: 1px solid #e5e5e5; background:#fff;
  display: grid; place-items: center;
  color: #adb5bd; /* 아이콘 색상을 살짝 연하게 조정하여 덜 튀게 만듭니다. */
`;
