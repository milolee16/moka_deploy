// src/pages/Map.jsx
import { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

/** 5성급 호텔 샘플 (서울 중심부) */
const HOTEL_5STAR = [
    { id: "four-seasons", name: "포시즌스 호텔 서울", lat: 37.57350, lng: 126.97390 },
    { id: "lotte-seoul",  name: "롯데호텔 서울 (소공동)", lat: 37.56469, lng: 126.98199 },
    { id: "plaza",        name: "더 플라자 호텔",         lat: 37.56588, lng: 126.97695 },
    { id: "westin",       name: "웨스틴조선 서울",         lat: 37.56405, lng: 126.98168 },
    { id: "josun-palace", name: "조선 팰리스 서울 강남",   lat: 37.50867, lng: 127.05836 },
];

const MapPage = () => {
    const navigate = useNavigate();

    // 1) 라이브러리 제공 로더 사용 (키는 .env의 VITE_KAKAO_MAP_APP_KEY)
    // 'libraries' 옵션을 명시적으로 빈 배열로 설정하여 옵션 불일치 에러 방지
    const [loading, error] = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_MAP_APP_KEY,
        libraries: [], // 명시적으로 빈 배열로 설정
    });

    // 2) Reservation에서 받은 시간 안전하게 가져오기
    const { state } = useLocation();
    const { start, end } = useMemo(() => {
        const toDate = (v) => (v instanceof Date ? v : v ? new Date(v) : null);
        let s = toDate(state?.start);
        let e = toDate(state?.end);
        if (!s || !e || isNaN(+s) || isNaN(+e) || e <= s) {
            const now = new Date();
            now.setSeconds(0, 0);
            const end = new Date(now.getTime() + (4 * 60 + 30) * 60 * 1000); // Default to 4h 30m later
            return { start: now, end };
        }
        return { start: s, end: e };
    }, [state]);

    // 3) 선택된 장소 (대여=반납 동일)
    const [placeId, setPlaceId] = useState(HOTEL_5STAR[0].id);

    // 4) 지도 중심(처음엔 호텔들 평균 위치로)
    const [center, setCenter] = useState(() => {
        const lat = HOTEL_5STAR.reduce((a, b) => a + b.lat, 0) / HOTEL_5STAR.length;
        const lng = HOTEL_5STAR.reduce((a, b) => a + b.lng, 0) / HOTEL_5STAR.length;
        return { lat, lng };
    });
    const mapRef = useRef(null);

    // 5) 시간 레이블 포맷팅
    const timeLabel = useMemo(() => {
        const fmt = (d) => {
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const hh = String(d.getHours()).padStart(2, "0");
            const mi = String(d.getMinutes()).padStart(2, "0");
            const today = new Date(); today.setHours(0,0,0,0);
            const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
            const dayOnly = new Date(d); dayOnly.setHours(0,0,0,0);

            const timePart = `${hh}:${mi}`;
            if (dayOnly.getTime() === today.getTime()) return `오늘 ${timePart}`;
            if (dayOnly.getTime() === tomorrow.getTime()) return `내일 ${timePart}`;
            return `${mm}/${dd} ${timePart}`;
        };
        return `${fmt(start)} ~ ${fmt(end)}`;
    }, [start, end]);

    // 6) 결제 버튼 핸들러
    const handlePay = () => {
        const place = HOTEL_5STAR.find((h) => h.id === placeId)?.name;
        navigate("/payment", {
            state: { start, end, pickup: place, dropoff: place },
        });
    };

    // 7) 마커 클릭 핸들러
    const onMarkerClick = (h) => {
        setPlaceId(h.id);
        setCenter({ lat: h.lat, lng: h.lng }); // 중심 이동
        // 필요하면 인포윈도우도 추가 가능
    };

    // 8) 장소 선택 드롭다운 변경 핸들러
    const handlePlaceSelect = (e) => {
        const next = HOTEL_5STAR.find((h) => h.id === e.target.value);
        if (!next) return; // 못 찾으면 그냥 리턴
        setPlaceId(next.id);
        setCenter({ lat: next.lat, lng: next.lng }); // 중심 이동
    };

    return (
        <Page>
            <MapWrap>
                {/* 로딩/에러 처리 */}
                {error && (
                    <MapLoading>
                        지도를 불러오지 못했어요.
                        <small style={{ marginTop: 8, color: '#868e96' }}>({error.message})</small>
                    </MapLoading>
                )}

                {/* Map 컴포넌트 사용: div+수동생성 X */}
                {!loading && !error && (
                    <Map
                        center={center}
                        level={5}
                        style={{ width: "100%", height: "100%" }}
                        onCreate={(map) => (mapRef.current = map)}
                    >
                        {HOTEL_5STAR.map((h) => (
                            <MapMarker
                                key={h.id}
                                position={{ lat: h.lat, lng: h.lng }}
                                onClick={() => onMarkerClick(h)}
                            >
                                {/* 선택된 호텔만 라벨 표시 */}
                                {placeId === h.id && (
                                    <div style={{ padding: "6px 10px", color: "#000", background: "#fff", borderRadius: 8 }}>
                                        {h.name}
                                    </div>
                                )}
                            </MapMarker>
                        ))}
                    </Map>
                )}

                {(loading && !error) && <MapLoading>지도를 불러오는 중…</MapLoading>}
            </MapWrap>

            <BottomSheet>
                <Row>
                    <Label>대여 · 반납</Label>
                    <Select
                        value={placeId}
                        onChange={handlePlaceSelect}
                    >
                        {HOTEL_5STAR.map((h) => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                    </Select>
                </Row>

                <Row>
                    <Label>이용시간</Label>
                    <TimePill>{timeLabel}</TimePill>
                </Row>

                <Actions>
                    <PayButton onClick={handlePay}>결제</PayButton>
                </Actions>
            </BottomSheet>
        </Page>
    );
};

export default MapPage;

/* ============== styles ============== */
const Page = styled.main`
    width: 100%; max-width: 560px; margin: 0 auto;
    display: grid; grid-template-rows: 50vh 1fr; gap: 12px;
    padding: 12px 16px 16px; box-sizing: border-box;
`;
const MapWrap = styled.section`
    position: relative; width: 100%; height: 50vh; overflow: hidden;
    border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,.05); background: #f1f3f5;
    /* Removed flexbox centering styles for the placeholder */
`;
const MapLoading = styled.div`
    position: absolute; inset: 0; display: grid; place-items: center;
    font-size: 14px; color: #495057;
`;
const BottomSheet = styled.section`
    background: #fff; border-radius: 20px; padding: 16px; display: grid; gap: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,.05); min-height: 28vh;
`;
const Row = styled.div`
    display: grid; grid-template-columns: 90px 1fr; gap: 12px; align-items: center;
`;
const Label = styled.div`font-size: 14px; color: #495057;`;
const Select = styled.select`
    height: 44px; border-radius: 12px; border: 1px solid #e9ecef;
    background: #f8f9fa; padding: 0 12px; font-size: 14px; color: #212529; outline: none;
    &:focus{ border-color:#ced4da; background:#fff; }
`;
const TimePill = styled.div`
    height: 44px; border-radius: 12px; display: grid; align-items: center;
    padding: 0 12px; background: #f8f9fa; font-size: 14px; color: #343a40;
`;
const Actions = styled.div`
    /* 버튼을 전체 너비로 만들기 위해 grid 레이아웃 제거 */
    margin-top: 4px;
`;
const PayButton = styled.button`
    width: 100%; /* '확인' 버튼처럼 전체 너비 차지 */
    height: 52px; /* '확인' 버튼과 높이 통일 */
    border: none; border-radius: 14px;
    background: #1f8ef1; color: #fff; font-size: 16px; /* '확인' 버튼과 폰트 크기 통일 */ font-weight: 600; cursor: pointer;
    transition: transform .1s ease, opacity .2s ease; &:active{ transform: scale(.99); }
`;
