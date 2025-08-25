CREATE TABLE LOCATION (
    location_name VARCHAR2(100) PRIMARY KEY,
    location_address VARCHAR2(300) NOT NULL,
    location_region VARCHAR2(50) NOT NULL,
    location_map_url VARCHAR2(300) NOT NULL
);

-- 서울 5성급 호텔 위치 정보 더미 데이터 (20개)

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('포시즌스 호텔 서울', '서울특별시 종로구 새문안로 97', '서울', 'https://map.kakao.com/link/search/포시즌스호텔서울');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('시그니엘 서울', '서울특별시 송파구 올림픽로 300 롯데월드타워 76-101층', '서울', 'https://map.kakao.com/link/search/시그니엘서울');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('신라호텔', '서울특별시 중구 동호로 249', '서울', 'https://map.kakao.com/link/search/신라호텔');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('조선 팰리스, 럭셔리 컬렉션 호텔, 서울 강남', '서울특별시 강남구 테헤란로 231', '서울', 'https://map.kakao.com/link/search/조선팰리스강남');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('파크 하얏트 서울', '서울특별시 강남구 테헤란로 606', '서울', 'https://map.kakao.com/link/search/파크하얏트서울');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('그랜드 인터컨티넨탈 서울 파르나스', '서울특별시 강남구 테헤란로 521', '서울', 'https://map.kakao.com/link/search/그랜드인터컨티넨탈서울파르나스');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('롯데호텔 서울', '서울특별시 중구 을지로 30', '서울', 'https://map.kakao.com/link/search/롯데호텔서울');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('안다즈 서울 강남', '서울특별시 강남구 논현로 854', '서울', 'https://map.kakao.com/link/search/안다즈서울강남');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('그랜드 하얏트 서울', '서울특별시 용산구 소월로 322', '서울', 'https://map.kakao.com/link/search/그랜드하얏트서울');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('JW 메리어트 호텔 서울', '서울특별시 서초구 신반포로 176', '서울', 'https://map.kakao.com/link/search/JW메리어트호텔서울');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('워커힐 호텔앤리조트', '서울특별시 광진구 워커힐로 177', '서울', 'https://map.kakao.com/link/search/워커힐호텔앤리조트');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('콘래드 서울', '서울특별시 영등포구 국제금융로 10', '서울', 'https://map.kakao.com/link/search/콘래드서울');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('반얀트리 클럽 앤 스파 서울', '서울특별시 중구 장충단로 60', '서울', 'https://map.kakao.com/link/search/반얀트리클럽앤스파서울');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('웨스틴 조선 서울', '서울특별시 중구 소공로 106', '서울', 'https://map.kakao.com/link/search/웨스틴조선서울');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('소피텔 앰배서더 서울', '서울특별시 송파구 잠실로 209', '서울', 'https://map.kakao.com/link/search/소피텔앰배서더서울');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('몬드리안 서울 이태원', '서울특별시 용산구 장문로 23', '서울', 'https://map.kakao.com/link/search/몬드리안서울이태원');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('인터컨티넨탈 서울 코엑스', '서울특별시 강남구 봉은사로 524', '서울', 'https://map.kakao.com/link/search/인터컨티넨탈서울코엑스');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('JW 메리어트 동대문 스퀘어 서울', '서울특별시 종로구 청계천로 279', '서울', 'https://map.kakao.com/link/search/JW메리어트동대문스퀘어서울');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('그랜드 머큐어 앰배서더 호텔 앤 레지던스 서울 용산', '서울특별시 용산구 청파로20길 95', '서울', 'https://map.kakao.com/link/search/그랜드머큐어앰배서더용산');

INSERT INTO LOCATION (location_name, location_address, location_region, location_map_url) VALUES
    ('비스타 워커힐 서울', '서울특별시 광진구 워커힐로 177', '서울', 'https://map.kakao.com/link/search/비스타워커힐서울');

SELECT * FROM LOCATION;