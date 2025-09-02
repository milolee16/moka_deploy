// src/pages/Map.jsx
import {useEffect, useMemo, useRef, useState} from "react";
import styled from "styled-components";
import {useLocation, useNavigate} from "react-router-dom";
import {Map, MapMarker, CustomOverlayMap, useKakaoLoader} from "react-kakao-maps-sdk";
import ReactSelect from "react-select"; // ✅ react-select

const PIN_URL =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="14" cy="34" rx="6.5" ry="2" fill="rgba(0,0,0,0.18)"/>
  <path d="M14 0C7.372 0 2 5.372 2 12c0 8.25 9.08 17.57 11.5 20 .27.27.71.27.98 0C16.92 29.57 26 20.25 26 12 26 5.372 20.628 0 14 0z" fill="#a47551"/>
  <circle cx="14" cy="12" r="5" fill="#fff"/>
</svg>
`);

const MapPage = () => {
    const [locations, setLocations] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError, setDataError] = useState(null);

    const {loading, error} = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_MAP_APP_KEY,
        libraries: [],
    });

    const location = useLocation();
    const navigate = useNavigate();

    // ✅ Reservation에서 넘어온 모든 데이터는 info로 관리 (start, end, price, billing, etc.)
    const info = location.state || {};

    // ✅ start/end를 info에서 가져오되, 없거나 잘못되면 4시간30분 기본값 세팅
    const {start, end} = useMemo(() => {
        const toDate = (v) => (v instanceof Date ? v : v ? new Date(v) : null);
        let s = toDate(info.start);
        let e = toDate(info.end);
        if (!s || !e || isNaN(+s) || isNaN(+e) || e <= s) {
            const now = new Date();
            now.setSeconds(0, 0);
            const fallbackEnd = new Date(now.getTime() + (4 * 60 + 30) * 60 * 1000);
            return {start: now, end: fallbackEnd};
        }
        return {start: s, end: e};
    }, [info.start, info.end]);

    const [placeId, setPlaceId] = useState(null);
    const [center, setCenter] = useState({lat: 37.5665, lng: 126.9780});
    const mapRef = useRef(null);

    // 5성급 호텔 목록 불러오기
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setDataLoading(true);
                const response = await fetch("/api/locations?stars=5");
                if (!response.ok) {
                    throw new Error("Failed to fetch locations");
                }
                const data = await response.json();
                const processedData = data.map((loc) => ({
                    ...loc,
                    id: loc.name.toLowerCase().replace(/\s+/g, "-"),
                }));
                setLocations(processedData);
            } catch (e) {
                setDataError(e);
            } finally {
                setDataLoading(false);
            }
        };
        fetchLocations();
    }, []);

    // 기본 호텔(포시즌스) 또는 첫번째 호텔로 초기 중심 잡기
    useEffect(() => {
        if (locations.length > 0) {
            const defaultHotelName = "포시즌스 호텔 서울";
            const defaultHotel = locations.find((loc) => loc.name === defaultHotelName);

            if (defaultHotel) {
                setPlaceId(defaultHotel.id);
                setCenter({lat: defaultHotel.lat, lng: defaultHotel.lng});
            } else {
                setPlaceId(locations[0].id);
                setCenter({lat: locations[0].lat, lng: locations[0].lng});
            }
        }
    }, [locations]);

    // 이용시간 라벨
    const timeLabel = useMemo(() => {
        const fmt = (d) => {
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const hh = String(d.getHours()).padStart(2, "0");
            const mi = String(d.getMinutes()).padStart(2, "0");
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const dayOnly = new Date(d);
            dayOnly.setHours(0, 0, 0, 0);
            const timePart = `${hh}:${mi}`;
            if (dayOnly.getTime() === today.getTime()) return `오늘 ${timePart}`;
            if (dayOnly.getTime() === tomorrow.getTime()) return `내일 ${timePart}`;
            return `${mm}/${dd} ${timePart}`;
        };
        return `${fmt(start)} ~ ${fmt(end)}`;
    }, [start, end]);

    // ✅ react-select 옵션/값
    const selectOptions = useMemo(
        () => locations.map((h) => ({value: h.id, label: h.name})),
        [locations]
    );
    const timeValue = useMemo(() => ({value: "time", label: timeLabel}), [timeLabel]);

    // ✅ react-select 변경 핸들러
    const handlePlaceChange = (opt) => {
        const next = locations.find((h) => h.id === opt?.value);
        if (!next) return;
        setPlaceId(next.id);
        setCenter({lat: next.lat, lng: next.lng});
    };

    // ✅ 차량선택으로 이동: 경로를 /car-select 로 통일 & info 릴레이 + locationName 추가
    const handleSelectCar = () => {
        const locationName = locations.find((h) => h.id === placeId)?.name;
        navigate("/cars", {
            state: {
                ...info, // start, end, price, billing 등 그대로 전달
                locationName,
            },
        });
    };

    const isLoading = loading || dataLoading;
    const anyError = error || dataError;

    return (
        <Page>
            <MapWrap>
                {anyError && (
                    <MapLoading>
                        지도를 불러오지 못했어요.
                        <small style={{marginTop: 8, color: "#868e96"}}>({anyError.message})</small>
                    </MapLoading>
                )}

                {!isLoading && !anyError && (
                    <Map
                        center={center}
                        level={5}
                        style={{width: "100%", height: "100%"}}
                        onCreate={(map) => (mapRef.current = map)}
                    >
                        {placeId && (
                            <>
                                <MapMarker
                                    position={center}
                                    image={{
                                        src: PIN_URL,
                                        size: {width: 28, height: 36},
                                        options: {offset: {x: 14, y: 36}},
                                    }}
                                />
                                <CustomOverlayMap position={center} yAnchor={2.23} zIndex={3}>
                                    <MarkerLabel>{locations.find((h) => h.id === placeId)?.name}</MarkerLabel>
                                </CustomOverlayMap>
                            </>
                        )}
                    </Map>
                )}

                {isLoading && !anyError && <MapLoading>지도를 불러오는 중…</MapLoading>}
            </MapWrap>

            <BottomSheet>
                <Row>
                    <Label>대여 · 반납</Label>
                    <ReactSelect
                        classNamePrefix="moca-select"
                        isDisabled={isLoading || anyError}
                        options={selectOptions}
                        value={selectOptions.find((o) => o.value === placeId) || null}
                        onChange={handlePlaceChange}
                        placeholder="호텔을 선택하세요"
                        styles={selectStyles}
                        menuPlacement="auto"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                    />
                </Row>

                <Row>
                    <Label>이용시간</Label>
                    <ReactSelect
                        classNamePrefix="moca-select"
                        value={timeValue}
                        options={[timeValue]}
                        isDisabled
                        isSearchable={false}
                        isClearable={false}
                        menuIsOpen={false} // 펼치기 금지
                        styles={{
                            ...selectStyles,
                            indicatorsContainer: () => ({display: "none"}), // 아이콘 숨김
                        }}
                    />
                </Row>

                <Actions>
                    <ActionButton onClick={handleSelectCar} disabled={!placeId}>
                        이 위치에서 차량선택
                    </ActionButton>
                </Actions>
            </BottomSheet>
        </Page>
    );
};

export default MapPage;

/* ============== styles ============== */
const Page = styled.main`
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
    display: grid;
    grid-template-rows: 50vh 1fr;
    gap: 12px;
    padding: 12px 16px 16px;
    box-sizing: border-box;
`;
const MapWrap = styled.section`
    position: relative;
    width: 100%;
    height: 50vh;
    overflow: hidden;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    background: #f1f3f5;
`;
const MapLoading = styled.div`
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 14px;
    color: #495057;
`;
const BottomSheet = styled.section`
    background: #fff;
    border-radius: 20px;
    padding: 16px;
    display: grid;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    min-height: 28vh;
`;
const Row = styled.div`
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 12px;
    align-items: center;
`;
const Label = styled.div`
    font-size: 14px;
    color: #795548;
`;
const Actions = styled.div`
    margin-top: 4px;
`;
const ActionButton = styled.button`
    width: 100%;
    height: 52px;
    border-radius: 999px;
    border: none;
    background: #a47551;
    color: #fff;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: background-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 10px 24px rgba(164, 117, 81, 0.35);

    &:active {
        transform: scale(0.99);
    }
`;

const MarkerLabel = styled.div`
    background: #fff;
    border: 1px solid #a47551;
    border-radius: 999px;
    padding: 5px 14px;
    font-size: 13px;
    font-weight: 700;
    color: #5d4037;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    white-space: nowrap;
`;

/* ✅ react-select 스타일 커스터마이즈 */
const selectStyles = {
    control: (base, state) => ({
        ...base,
        borderRadius: 999,
        borderColor: state.isFocused ? "#a47551" : "#e7e0d9",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(164,117,81,0.12)" : "0 2px 6px rgba(0,0,0,0.04)",
        minHeight: 44,
        paddingLeft: 4,
        paddingRight: 4,
        backgroundColor: "#fdfbfa",
        ":hover": {borderColor: "#a47551", backgroundColor: "#fff"},
    }),
    valueContainer: (base) => ({
        ...base,
        padding: "0 8px",
    }),
    singleValue: (base) => ({
        ...base,
        color: "#5d4037",
        fontSize: 14,
        fontWeight: 500,
    }),
    placeholder: (base) => ({
        ...base,
        color: "#8d6e63",
        fontSize: 14,
    }),
    input: (base) => ({
        ...base,
        color: "#5d4037",
        fontSize: 14,
    }),
    indicatorsContainer: (base) => ({
        ...base,
        "> div": {color: "#a47551"},
    }),
    menu: (base) => ({
        ...base,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        marginTop: 8,
    }),
    menuList: (base) => ({
        ...base,
        padding: 6,
        backgroundColor: "#fff",
    }),
    option: (base, state) => ({
        ...base,
        borderRadius: 10,
        padding: "10px 12px",
        fontSize: 14,
        color: "#5d4037",
        backgroundColor: state.isFocused ? "#f5f1ed" : state.isSelected ? "#e7e0d9" : "#fff",
        ":active": {
            backgroundColor: "#e7e0d9",
        },
        cursor: "pointer",
    }),
};
