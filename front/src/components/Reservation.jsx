import { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";


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
            const label =
                i === 0 ? `오늘 (${mm}/${dd})` : i === 1 ? `내일 (${mm}/${dd})` : `${mm}/${dd}`;
            arr.push({ value: `${yyyy}-${mm}-${dd}`, label });
        }
        return arr;
    }, []);

    // 00:00 ~ 23:50, 10분 단위
    const timeOptions = useMemo(() => {
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

    const [isModalOpen, setModalOpen] = useState(false);

    const diff = useMemo(() => {
        const ms = end - start;
        if (isNaN(ms) || ms <= 0) return { days: 0, hours: 0, minutes: 0, valid: false };
        const totalMin = Math.floor(ms / (60 * 1000));
        const days = Math.floor(totalMin / (60 * 24));
        const hours = Math.floor((totalMin - days * 24 * 60) / 60);
        const minutes = totalMin % 60;
        return { days, hours, minutes, valid: true };
    }, [start, end]);

    const handleOpenModal = () => {
        if (!diff.valid) return;
        setModalOpen(true);
    };

    const handleConfirmAndNavigate = () => {
        navigate("/map", { state: { start, end } });
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
                    <Select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                        {timeOptions.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </Select>
                </SelectGroup>
            </FieldRow>

            <Divider />

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
                        {timeOptions.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </Select>
                </SelectGroup>
            </FieldRow>

            <Summary>
                총{" "}
                <strong>
                    {diff.days}일 {diff.hours}시간 {diff.minutes}분
                </strong>{" "}
                이용
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
  margin: 0 0 4px 0;
  color: #222;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 12px;
  align-items: center;
`;

const FieldLabel = styled.div`
  font-size: 14px;
  color: #495057;
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
  border: 1px solid #e9ecef;
  padding: 0 12px;
  background: #f8f9fa;
  font-size: 14px;
  color: #212529;
  outline: none;
  &:focus {
    border-color: #ced4da;
    background: #fff;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed #e9ecef;
  margin: 8px 0;
`;

const Summary = styled.div`
  font-size: 15px;
  color: #343a40;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
  strong {
    font-weight: 700;
  }
`;

const ConfirmButton = styled.button`
  margin-top: 4px;
  height: 52px;
  border: none;
  border-radius: 16px;
  background: #1f8ef1;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease, opacity 0.2s ease;
  &:active {
    transform: scale(0.99);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/** ================= Modal Styles ================= */
const ModalTitle = styled.h2`
    font-size: 18px;
    font-weight: 700;
    color: #212529;
    margin: 0;
    text-align: center;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 12px;
    background-color: #f8f9fa;
    padding: 16px;
    border-radius: 12px;
`;

const InfoLabel = styled.span`
    font-weight: 600;
    color: #495057;
`;

const InfoValue = styled.span`
    color: #212529;
`;

const ModalConfirmButton = styled(ConfirmButton)`
    background-color: #20c997; /* 다음 단계로 넘어가는 버튼 색상 변경 */
`;
