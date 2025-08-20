import { useMemo, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { HiCheck, HiOutlineShieldCheck } from "react-icons/hi";

const PLANS = [
    {
        id: "basic",
        title: "베이직",
        features: [
            "면책금: 수리비 20%",
            "보상한도: 100만",
            "단독사고: 이용자 보상",
        ],
    },
    {
        id: "standard",
        title: "스탠다드",
        features: [
            "면책금: 면제",
            "보상한도: 300만",
            "단독사고: 이용자 보상",
        ],
    },
    {
        id: "premium",
        title: "프리미엄",
        features: [
            "면책금: 면제",
            "보상한도: 무제한",
            "단독사고: 면제",
        ],
        recommended: true,
    },
];

const InsuranceSelect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selected, setSelected] = useState(null);

    const info = useMemo(() => location.state || {}, [location.state]);

    const handlePay = () => {
        if (!selected) return;
        navigate("/checkout", { state: { ...info, insurance: selected } });
    };

    return (
        <Wrap>
            <Header>
                <HiOutlineShieldCheck size={18} />
                <span>보험 선택</span>
            </Header>

            <Cards role="radiogroup" aria-label="보험 선택">
                {PLANS.map((p) => {
                    const isActive = selected?.id === p.id;
                    return (
                        <Card
                            key={p.id}
                            role="radio"
                            aria-checked={isActive}
                            tabIndex={0}
                            $active={isActive}
                            onClick={() => setSelected(p)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") setSelected(p);
                            }}
                        >
                            {isActive && (
                                <Badge>
                                    <HiCheck size={16} />
                                </Badge>
                            )}
                            {p.recommended && <Ribbon>추천</Ribbon>}
                            <Title>{p.title}</Title>
                            <List>
                                {p.features.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </List>
                        </Card>
                    );
                })}
            </Cards>

            <PayBar>
                <PayButton
                    type="button"
                    disabled={!selected}
                    onClick={handlePay}
                    aria-disabled={!selected}
                >
                    {selected ? `${selected.title}로 결제하기` : "결제하기"}
                </PayButton>
            </PayBar>
        </Wrap>
    );
};

export default InsuranceSelect;

/* ===== styles ===== */
const Wrap = styled.div`
  padding: 16px 16px 96px;
`;

const Header = styled.div`
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-weight: 700;
  margin-bottom: 12px;
  color: #5d4037; /* Moca: Dark Brown */
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  position: relative;
  text-align: left;
  background: #fff;
  border-radius: 16px;
  padding: 16px 14px;
  border: 2px solid ${({ $active }) => ($active ? "#a47551" : "#e7e0d9")}; /* Moca: Primary Brown / Beige */
  box-shadow: ${({ $active }) =>
    $active ? "0 10px 24px rgba(164, 117, 81, .18)" : "0 6px 18px rgba(0,0,0,.06)"}; /* Moca: Shadow */
  transform: ${({ $active }) => ($active ? "translateY(-2px)" : "none")};
  transition: all .15s ease;
  cursor: pointer;
  outline: none;

  &:hover { border-color: #a47551; } /* Moca: Primary Brown */
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 800;
  margin: 2px 0 10px;
  color: #5d4037; /* Moca: Dark Brown */
`;

const List = styled.ul`
  display: grid;
  gap: 8px;
  li {
    font-size: 14px;
    color: #795548; /* Moca: Medium Brown */
    list-style: disc;
    margin-left: 18px;
    line-height: 1.35;
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 10px; right: 10px;
  width: 28px; height: 28px;
  border-radius: 999px;
  background: #a47551; /* Moca: Primary Brown */
  color: #fff;
  display: grid; place-items: center;
  box-shadow: 0 6px 16px rgba(164, 117, 81, .35); /* Moca: Shadow */
`;

const Ribbon = styled.span`
  position: absolute;
  top: -8px; left: 12px;
  background: #5d4037; /* Moca: Dark Brown */
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
`;

const PayBar = styled.div`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  padding: 12px 16px 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 30%);
`;

const PayButton = styled.button`
  width: 100%;
  height: 52px;
  border-radius: 999px;
  border: 0;
  font-weight: 800;
  font-size: 16px;
  color: #fff;
  background: ${({ disabled }) => (disabled ? "#d7ccc8" : "#a47551")}; /* Moca: Disabled / Primary */
  box-shadow: ${({ disabled }) =>
    disabled ? "none" : "0 10px 24px rgba(164, 117, 81, .35)"}; /* Moca: Shadow */
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;
