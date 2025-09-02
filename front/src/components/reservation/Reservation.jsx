import {useMemo, useState, useEffect} from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";
import Modal from "../Modal.jsx";

/** ================= helpers (추가) ================= */
// ⭐ 돈 표시용(3자리 콤마) 헬퍼
function formatCurrencyKRW(n) {
    try {
        return n.toLocaleString("ko-KR");
    } catch {
        return `${n}`;
    }
}

/** ================= Component ================= */
const Reservation = () => {
    const navigate = useNavigate(); // 이 페이지에서 navigate를 사용한다면 유지합니다.

    // 오늘 ~ 14일치 날짜 옵션
    const dateOptions = useMemo(() => {
        const arr = [];
        const base = new Date();
        for (let i = 0; i <= 14; i++) {
            const d = new Date(base);
            d.setDate(base.getDate() + i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const label = i === 0 ? `오늘 (${mm}/${dd})` : i === 1 ? `내일 (${mm}/${dd})` : `${mm}/${dd}`;
            arr.push({value: `${yyyy}-${mm}-${dd}`, label});
        }
        return arr;
    }, []);

    // 00:00 ~ 23:50, 10분 단위
    const allTimeOptions = useMemo(() => {
        const arr = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 10) {
                const hh = String(h).padStart(2, "0");
                const mm = String(m).padStart(2, "0");
                arr.push(`${hh}:${mm}`);
            }
        }
        return arr;
    }, []);

    // 초기값: 시작=현재 시각 반올림(10분), 종료=시작+4시간30분
    const roundTo10 = (d) => {
        const copy = new Date(d);
        const m = copy.getMinutes();
        const rounded = Math.ceil(m / 10) * 10;
        copy.setMinutes(rounded === 60 ? 0 : rounded);
        if (rounded === 60) copy.setHours(copy.getHours() + 1);
        copy.setSeconds(0, 0);
        return copy;
    };
    const now10 = roundTo10(new Date());
    const startInitDate = toDateStr(now10);
    const startInitTime = toTimeStr(now10);

    const endInit = new Date(now10.getTime() + (4 * 60 + 30) * 60 * 1000);
    const endInitDate = toDateStr(endInit);
    const endInitTime = toTimeStr(endInit);

    const [startDate, setStartDate] = useState(startInitDate);
    const [startTime, setStartTime] = useState(startInitTime);
    const [endDate, setEndDate] = useState(endInitDate);
    const [endTime, setEndTime] = useState(endInitTime);

    const start = useMemo(() => toDateObj(startDate, startTime), [startDate, startTime]);
    const end = useMemo(() => toDateObj(endDate, endTime), [endDate, endTime]);

    // 실시간을 반영한 대여 시작 시간 옵션 목록을 만듭니다.
    // [수정] 날짜 계산 로직을 더 명확하고 안전하게 변경하여 오류를 방지합니다.
    const startTimeOptions = useMemo(() => {
        const realTodayStr = toDateStr(new Date());
        // 선택된 날짜가 오늘이 아니면 모든 시간을 보여줍니다.
        if (startDate !== realTodayStr) {
            return allTimeOptions;
        }

        // 선택된 날짜가 오늘일 때:
        const roundedNow = roundTo10(new Date());
        // 만약 현재 시각을 반올림했더니 다음날이 되었다면, 오늘 선택 가능한 시간은 없습니다.
        if (toDateStr(roundedNow) !== realTodayStr) {
            return [];
        }
        // 그렇지 않으면, 현재 시간 이후의 시간만 필터링해서 보여줍니다.
        const roundedNowTime = toTimeStr(roundedNow);
        return allTimeOptions.filter((t) => t >= roundedNowTime);
    }, [startDate, allTimeOptions]);

    // 날짜나 시간이 바뀔 때마다, 유효하지 않은 시간을 자동으로 보정해주는 기능입니다.
    // [수정] 날짜가 유효하지 않을 때 프로그램이 멈추는 문제를 해결하고, 로직을 보강합니다.
    useEffect(() => {
        // 1. 시작 시간이 유효한 옵션 목록에 없으면, 가능한 가장 빠른 시간으로 변경합니다.
        if (startTimeOptions.length > 0 && !startTimeOptions.includes(startTime)) {
            setStartTime(startTimeOptions[0]);
            return; // 상태 변경 후에는 다음 렌더링에서 나머지 로직을 처리합니다.
        }

        // 2. 날짜 객체가 유효하지 않으면(e.g. "선택 불가") 오류를 방지하기 위해 여기서 중단합니다.
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return;
        }

        // 3. 시작 시간이 바뀌어서 반납 시간이 더 빨라졌다면, 반납 시간도 자동으로 조정합니다.
        if (end <= start) {
            const newEnd = new Date(start.getTime() + (4 * 60 + 30) * 60 * 1000);
            setEndDate(toDateStr(newEnd));
            setEndTime(toTimeStr(newEnd));
        }
    }, [start, end, startTime, startTimeOptions]);

    const [isModalOpen, setModalOpen] = useState(false);

    // ⭐ 추가: 총 이용 시간 diff 계산 (minutes 합계 포함)
    const diff = useMemo(() => {
        const ms = end - start;
        if (isNaN(ms) || ms <= 0) return {days: 0, hours: 0, minutes: 0, valid: false, totalMin: 0};
        const totalMin = Math.floor(ms / (60 * 1000));
        const days = Math.floor(totalMin / (60 * 24));
        const hours = Math.floor((totalMin - days * 24 * 60) / 60);
        const minutes = totalMin % 60;
        return {days, hours, minutes, valid: true, totalMin};
    }, [start, end]);

    // ⭐ 여기서 “10분당 5만원”으로 요금 계산!
    // - 10분 단위 과금: 보수적으로 올림(Math.ceil) 적용 (혹시라도 분이 딱 안 맞는 상황 대비)
    const UNITS_PER_MIN = 1 / 10; // 1분 = 0.1유닛
    const PRICE_PER_UNIT = 50000; // 유닛(=10분)당 5만원
    const price = useMemo(() => {
        if (!diff.valid) return 0;
        const units = Math.ceil((diff.totalMin || 0) * UNITS_PER_MIN);
        return units * PRICE_PER_UNIT;
    }, [diff]);

    const handleOpenModal = () => {
        if (!diff.valid) return;
        setModalOpen(true);
    };

    // ⭐ 다음 페이지로 이동 시, 계산된 price를 함께 전달!
    const handleConfirmAndNavigate = () => {
        navigate("/map", {
            state: {
                startDate: start,
                endDate: end,
                // 가격 및 요약 정보 전달(다음 페이지에서 그대로 사용 가능)
                price, // 총 요금
                billing: {
                    unitMinutes: 10,
                    unitPrice: PRICE_PER_UNIT,
                    totalMinutes: diff.totalMin,
                    chargedUnits: Math.ceil((diff.totalMin || 0) * UNITS_PER_MIN),
                },
            },
        });
    };

    return (
        <>
            <BoxCard>
                <SectionTitle>이용시간</SectionTitle>

                <FieldRow>
                    <FieldLabel>대여시각</FieldLabel>
                    <SelectGroup>
                        <Select value={startDate} onChange={(e) => setStartDate(e.target.value)}>
                            {dateOptions.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </Select>
                        <Select
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            disabled={startTimeOptions.length === 0}
                        >
                            {startTimeOptions.length > 0 ? (
                                startTimeOptions.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))
                            ) : (
                                <option>선택 불가</option>
                            )}
                        </Select>
                    </SelectGroup>
                </FieldRow>

                <Divider/>

                <FieldRow>
                    <FieldLabel>반납시각</FieldLabel>
                    <SelectGroup>
                        <Select value={endDate} onChange={(e) => setEndDate(e.target.value)}>
                            {dateOptions.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </Select>
                        <Select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                            {allTimeOptions.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </Select>
                    </SelectGroup>
                </FieldRow>

                <Summary>
                    총 <strong>{diff.days}일 {diff.hours}시간 {diff.minutes}분</strong> 이용
                    {/* ⭐ 요금 미리보기(선택사항): 아래 한 줄을 원하면 주석 해제 */}
                    {/* <div style={{ marginTop: 6 }}>예상 요금: <strong>{formatCurrencyKRW(price)}원</strong></div> */}
                </Summary>

                <ConfirmButton disabled={!diff.valid} onClick={handleOpenModal}>
                    확인
                </ConfirmButton>
            </BoxCard>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <ModalTitle>예약 내용을 확인해주세요</ModalTitle>
                <InfoGrid>
                    <InfoLabel>대여</InfoLabel>
                    <InfoValue>{formatKorean(start)}</InfoValue>
                    <InfoLabel>반납</InfoLabel>
                    <InfoValue>{formatKorean(end)}</InfoValue>
                    <InfoLabel>총 이용</InfoLabel>
                    <InfoValue>
                        {diff.days > 0 && `${diff.days}일 `}
                        {diff.hours > 0 && `${diff.hours}시간 `}
                        {diff.minutes > 0 && `${diff.minutes}분`}
                    </InfoValue>
                </InfoGrid>
                <ModalConfirmButton onClick={handleConfirmAndNavigate}>
                    지도에서 찾기
                </ModalConfirmButton>
            </Modal>
        </>
    );
};

export default Reservation;

/** ================= helpers ================= */
function toDateStr(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function toTimeStr(d) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

function toDateObj(dateStr, timeStr) {
    try {
        const [y, m, d] = dateStr.split("-").map(Number);
        const [hh, mm] = timeStr.split(":").map(Number);
        return new Date(y, m - 1, d, hh, mm, 0, 0);
    } catch {
        return new Date(NaN);
    }
}

function formatKorean(d) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const targetDate = new Date(d);
    targetDate.setHours(0, 0, 0, 0);

    let dayLabel;
    if (targetDate.getTime() === today.getTime()) {
        dayLabel = "오늘";
    } else if (targetDate.getTime() === tomorrow.getTime()) {
        dayLabel = "내일";
    } else {
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        dayLabel = `${mm}/${dd}`;
    }

    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dayLabel} ${hh}:${mi}`;
}

/** ================= styles (Index.jsx 톤 재사용) ================= */
const BoxCard = styled.section`
    background: #ffffff;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: grid;
    gap: 16px;
`;

const SectionTitle = styled.h2`
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #5d4037; /* Moca: Dark Brown */
`;

const FieldRow = styled.div`
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 12px;
    align-items: center;
`;

const FieldLabel = styled.div`
    font-size: 14px;
    color: #795548; /* Moca: Medium Brown */
`;

const SelectGroup = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
`;

const Select = styled.select`
    width: 100%;
    height: 42px;
    border-radius: 12px;
    border: 1px solid #e7e0d9; /* Moca: Beige Border */
    padding: 0 12px;
    background: #fdfbfa; /* Moca: Light Beige BG */
    font-size: 14px;
    color: #5d4037; /* Moca: Dark Brown */
    outline: none;

    &:focus {
        border-color: #a47551; /* Moca: Primary Brown */
        background: #fff;
    }
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px dashed #e7e0d9; /* Moca: Beige Border */
    margin: 8px 0;
`;

const Summary = styled.div`
    font-size: 15px;
    color: #795548; /* Moca: Medium Brown */
    padding: 10px 12px;
    background: #f5f1ed; /* Moca: Light Brown BG */
    border-radius: 12px;
    text-align: center;

    strong {
        font-weight: 700;
        color: #5d4037; /* Moca: Dark Brown */
    }
`;

const ConfirmButton = styled.button`
    margin-top: 4px;
    height: 52px;
    border: none;
    border-radius: 999px; /* Pill shape */
    color: #fff;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: background-color 0.2s, box-shadow 0.2s;
    background: #a47551; /* Moca: Primary */
    box-shadow: 0 10px 24px rgba(164, 117, 81, .35); /* Moca: Shadow */

    &:active {
        transform: scale(0.99);
    }

    &:disabled {
        background: #d7ccc8; /* Moca: Disabled */
        cursor: not-allowed;
        box-shadow: none;
    }
`;

/** ================= Modal Styles ================= */
const ModalTitle = styled.h2`
    font-size: 18px;
    font-weight: 700;
    color: #5d4037; /* Moca: Dark Brown */
    margin: 0;
    text-align: center;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 12px;
    background-color: #f5f1ed; /* Moca: Light Brown BG */
    padding: 16px;
    border-radius: 12px;
`;

const InfoLabel = styled.span`
    font-weight: 600;
    color: #795548; /* Moca: Medium Brown */
`;

const InfoValue = styled.span`
    color: #5d4037; /* Moca: Dark Brown */
`;

const ModalConfirmButton = styled(ConfirmButton)``; /* ConfirmButton 스타일을 그대로 상속 */
