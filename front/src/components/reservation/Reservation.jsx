import {useMemo, useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";

// ================= Modal Component (Modal.jsx 대체) =================
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};


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
    const navigate = useNavigate(); // react-router-dom의 useNavigate hook 사용

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
    const [passengerCount, setPassengerCount] = useState(1); // 탑승 인원 상태 추가

    const start = useMemo(() => toDateObj(startDate, startTime), [startDate, startTime]);
    const end = useMemo(() => toDateObj(endDate, endTime), [endDate, endTime]);

    // 실시간을 반영한 대여 시작 시간 옵션 목록을 만듭니다.
    const startTimeOptions = useMemo(() => {
        const realTodayStr = toDateStr(new Date());
        if (startDate !== realTodayStr) {
            return allTimeOptions;
        }

        const roundedNow = roundTo10(new Date());
        if (toDateStr(roundedNow) !== realTodayStr) {
            return [];
        }
        const roundedNowTime = toTimeStr(roundedNow);
        return allTimeOptions.filter((t) => t >= roundedNowTime);
    }, [startDate, allTimeOptions]);

    // 날짜나 시간이 바뀔 때마다, 유효하지 않은 시간을 자동으로 보정해주는 기능입니다.
    useEffect(() => {
        if (startTimeOptions.length > 0 && !startTimeOptions.includes(startTime)) {
            setStartTime(startTimeOptions[0]);
            return;
        }

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return;
        }

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
    const UNITS_PER_MIN = 1 / 10;
    const PRICE_PER_UNIT = 50000;
    const price = useMemo(() => {
        if (!diff.valid) return 0;
        const units = Math.ceil((diff.totalMin || 0) * UNITS_PER_MIN);
        return units * PRICE_PER_UNIT;
    }, [diff]);

    const handleOpenModal = () => {
        if (!diff.valid) return;
        setModalOpen(true);
    };

    // ⭐ 다음 페이지로 이동 시, 계산된 price와 passengerCount를 함께 전달!
    const handleConfirmAndNavigate = () => {
        setModalOpen(false); // Close modal before navigating
        navigate("/map", {
            state: {
                startDate: start,
                endDate: end,
                passengerCount: passengerCount,
                price,
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
            <style>{`
                /* General Body Style for Context */
                .app-container {
                    font-family: 'Pretendard', sans-serif;
                    background-color: #F8F5F2; /* Moca-themed light background */
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .box-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 20px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    display: grid;
                    gap: 16px;
                    width: 100%;
                    max-width: 420px;
                }
                .section-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0;
                    color: #5d4037; /* Moca: Dark Brown */
                }
                .field-row {
                    display: grid;
                    grid-template-columns: 90px 1fr;
                    gap: 12px;
                    align-items: center;
                }
                .field-label {
                    font-size: 14px;
                    color: #795548; /* Moca: Medium Brown */
                }
                .select-group {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .select-form {
                    width: 100%;
                    height: 42px;
                    border-radius: 12px;
                    border: 1px solid #e7e0d9; /* Moca: Beige Border */
                    padding: 0 12px;
                    background: #fdfbfa; /* Moca: Light Beige BG */
                    font-size: 14px;
                    color: #5d4037; /* Moca: Dark Brown */
                    outline: none;
                    -webkit-appearance: none;
                    appearance: none;
                    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23795548%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 8px 8px;
                }
                .select-form:focus {
                    border-color: #a47551; /* Moca: Primary Brown */
                    background-color: #fff;
                }
                .divider {
                    border: none;
                    border-top: 1px dashed #e7e0d9; /* Moca: Beige Border */
                    margin: 8px 0;
                }
                .summary {
                    font-size: 15px;
                    color: #795548; /* Moca: Medium Brown */
                    padding: 10px 12px;
                    background: #f5f1ed; /* Moca: Light Brown BG */
                    border-radius: 12px;
                    text-align: center;
                }
                .summary strong {
                    font-weight: 700;
                    color: #5d4037; /* Moca: Dark Brown */
                }
                .confirm-button {
                    margin-top: 4px;
                    height: 52px;
                    border: none;
                    border-radius: 999px; /* Pill shape */
                    color: #fff;
                    font-size: 16px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: background-color 0.2s, box-shadow 0.2s, transform 0.1s;
                    background: #a47551; /* Moca: Primary */
                    box-shadow: 0 10px 24px rgba(164, 117, 81, .35); /* Moca: Shadow */
                }
                .confirm-button:active {
                    transform: scale(0.98);
                    box-shadow: 0 4px 10px rgba(164, 117, 81, .25);
                }
                .confirm-button:disabled {
                    background: #d7ccc8; /* Moca: Disabled */
                    cursor: not-allowed;
                    box-shadow: none;
                }
                .stepper-group {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px; /* 버튼과 숫자 사이 간격 추가 */
                    justify-self: start;
                }
                /* --- SVG 대신 Text를 사용하도록 스타일 수정 --- */
                .stepper-button {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    border: 1px solid #e7e0d9;
                    background: #fff;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background-color 0.2s, color 0.2s, border-color 0.2s, transform 0.1s;
                    
                    /* 텍스트 스타일링 */
                    font-size: 26px; /* 텍스트 크기 */
                    font-weight: 300; /* 얇은 폰트로 세련되게 */
                    color: #795548; /* 기본 텍스트 색상 */
                    line-height: 1; /* 수직 정렬을 위한 line-height 조정 */
                    padding: 0 0 2px 0; /* 미세한 수직 위치 조정 */
                }
                .stepper-button:hover:not(:disabled) {
                    background: #f5f1ed;
                    border-color: #d7ccc8;
                }
                .stepper-button:active:not(:disabled) {
                    transform: scale(0.95);
                }
                .stepper-button:disabled {
                    background: #f5f1ed;
                    cursor: not-allowed;
                    border-color: #f5f1ed;
                    color: #d7ccc8; /* 비활성화 시 텍스트 색상 */
                }
                .stepper-button:focus-visible {
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(164, 117, 81, 0.4);
                }
                .passenger-value-box {
                    min-width: 40px;
                    padding: 0 4px;
                    font-size: 18px;
                    font-weight: 700;
                    color: #5d4037;
                    text-align: center;
                }
                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                }
                .modal-content {
                    background: white;
                    padding: 24px;
                    border-radius: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    width: 90%;
                    max-width: 400px;
                    animation: slideUp 0.4s ease;
                }
                .modal-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #5d4037;
                    margin: 0;
                    text-align: center;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 80px 1fr;
                    gap: 12px;
                    background-color: #f5f1ed;
                    padding: 16px;
                    border-radius: 12px;
                }
                .info-label {
                    font-weight: 600;
                    color: #795548;
                }
                .info-value {
                    color: #5d4037;
                    font-weight: 500;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
            <div className="app-container">
                <section className="box-card">
                    <h2 className="section-title">이용시간</h2>

                    <div className="field-row">
                        <div className="field-label">대여시각</div>
                        <div className="select-group">
                            <select className="select-form" value={startDate} onChange={(e) => setStartDate(e.target.value)}>
                                {dateOptions.map((d) => (
                                    <option key={d.value} value={d.value}>
                                        {d.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="select-form"
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
                            </select>
                        </div>
                    </div>

                    <hr className="divider"/>

                    <div className="field-row">
                        <div className="field-label">반납시각</div>
                        <div className="select-group">
                            <select className="select-form" value={endDate} onChange={(e) => setEndDate(e.target.value)}>
                                {dateOptions.map((d) => (
                                    <option key={d.value} value={d.value}>
                                        {d.label}
                                    </option>
                                ))}
                            </select>
                            <select className="select-form" value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                                {allTimeOptions.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <hr className="divider"/>

                    <div className="summary">
                        총 <strong>{diff.days > 0 && `${diff.days}일 `}{diff.hours}시간 {diff.minutes}분</strong> 이용
                    </div>



                    <div className="field-row">
                        <div className="field-label">탑승 인원</div>
                        <div className="stepper-group" aria-label="탑승 인원 선택">
                            <button
                                type="button"
                                className="stepper-button"
                                aria-label="인원 감소"
                                onClick={() => setPassengerCount(p => Math.max(1, p - 1))}
                                disabled={passengerCount <= 1}
                            >
                                -
                            </button>

                            <span className="passenger-value-box" aria-live="polite">
                                {passengerCount}
                            </span>

                            <button
                                type="button"
                                className="stepper-button"
                                aria-label="인원 증가"
                                onClick={() => setPassengerCount(p => p + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button className="confirm-button" disabled={!diff.valid} onClick={handleOpenModal}>
                        예약 확인하기
                    </button>
                </section>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="modal-title">예약 내용을 확인해주세요</h2>
                <div className="info-grid">
                    <span className="info-label">대여</span>
                    <span className="info-value">{formatKorean(start)}</span>
                    <span className="info-label">반납</span>
                    <span className="info-value">{formatKorean(end)}</span>
                    <span className="info-label">총 이용</span>
                    <span className="info-value">
                        {diff.days > 0 && `${diff.days}일 `}
                        {diff.hours > 0 && `${diff.hours}시간 `}
                        {diff.minutes > 0 && `${diff.minutes}분`}
                    </span>
                    <span className="info-label">탑승 인원</span>
                    <span className="info-value">{passengerCount}명</span>
                </div>
                <button className="confirm-button" onClick={handleConfirmAndNavigate}>
                    지도에서 찾기
                </button>
            </Modal>
        </>
    );
};

// This is necessary for the component to be rendered in some environments
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
    if (isNaN(d.getTime())) return "";
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

