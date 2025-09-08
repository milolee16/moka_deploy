-- 1. RESERVATION 테이블 데이터 삭제 (자식 먼저 지우기)
DELETE FROM RESERVATION WHERE 1=1;
COMMIT;

-- 2. CAR 테이블 데이터 삭제 (부모 테이블)
DELETE FROM CAR WHERE 1=1;
COMMIT;

-- 3. CAR_NAME 컬럼 추가 (이미 있으면 에러 → 무시하거나 ALTER TABLE DROP & ADD 해도 됨)
ALTER TABLE CAR ADD (CAR_NAME VARCHAR2(100));

-- 4. 새로운 차량 9대 입력
-- Lamborghini Huracan
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME)
VALUES ('FULLSIZE', '98가2803', 'AVAILABLE', '/assets/cars/lamborghini-huracan.jpg', '람보르기니 우라칸');

-- Aston Martin DB12
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME)
VALUES ('FULLSIZE', '55나5521', 'AVAILABLE', '/assets/cars/aston-martin-db12.jpg', '애스턴 마틴 DB12');

-- Ford Mustang Mach-E
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME)
VALUES ('FULLSIZE', '73다9015', 'AVAILABLE', '/assets/cars/ford-mustang-mach-e.jpg', '포드 머스탱 마하-E');

-- Ferrari 12 Cilindri
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME)
VALUES ('FULLSIZE', '41라7742', 'AVAILABLE', '/assets/cars/ferrari-12-cilindri.jpg', '페라리 12 칠린드리');

-- Bentley Continental GT
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME)
VALUES ('FULLSIZE', '62마4821', 'AVAILABLE', '/assets/cars/bentley-continental-gt.jpg', '벤틀리 컨티넨탈 GT');

-- Rolls Royce Phantom
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME)
VALUES ('FULLSIZE', '17바9364', 'AVAILABLE', '/assets/cars/rolls-royce-phantom.jpg', '롤스로이스 팬텀');

-- Porsche Taycan
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME)
VALUES ('FULLSIZE', '84사2579', 'AVAILABLE', '/assets/cars/porsche-taycan.jpg', '포르쉐 타이칸');

-- McLaren Artura
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME)
VALUES ('FULLSIZE', '29아6835', 'AVAILABLE', '/assets/cars/mclaren-artura.jpg', '맥라렌 아투라');

-- Maserati MC20
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME)
VALUES ('FULLSIZE', '46자1952', 'AVAILABLE', '/assets/cars/maserati-mc20.jpg', '마세라티 MC20');

-- 5. 변경사항 확정
COMMIT;

select * from CAR;

ALTER TABLE CAR ADD (RENT_PRICE_PER_10MIN NUMBER);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '98가2803', 'AVAILABLE', '/assets/cars/lamborghini-huracan.jpg', '람보르기니 우라칸', 25000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '55나5521', 'AVAILABLE', '/assets/cars/aston-martin-db12.jpg', '애스턴 마틴 DB12', 22000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '73다9015', 'AVAILABLE', '/assets/cars/ford-mustang-mach-e.jpg', '포드 머스탱 마하-E', 15000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '41라7742', 'AVAILABLE', '/assets/cars/ferrari-12-cilindri.jpg', '페라리 12 칠린드리', 24000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '62마4821', 'AVAILABLE', '/assets/cars/bentley-continental-gt.jpg', '벤틀리 컨티넨탈 GT', 20000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '17바9364', 'AVAILABLE', '/assets/cars/rolls-royce-phantom.jpg', '롤스로이스 팬텀', 30000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '84사2579', 'AVAILABLE', '/assets/cars/porsche-taycan.jpg', '포르쉐 타이칸', 18000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '29아6835', 'AVAILABLE', '/assets/cars/mclaren-artura.jpg', '맥라렌 아투라', 21000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '46자1952', 'AVAILABLE', '/assets/cars/maserati-mc20.jpg', '마세라티 MC20', 19000);

-- 럭셔리 SUV
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('SUV', '11가1111', 'AVAILABLE', '/assets/cars/lamborghini-urus.jpg', '람보르기니 우루스', 26000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('SUV', '22나2222', 'AVAILABLE', '/assets/cars/rolls-royce-cullinan.jpg', '롤스로이스 컬리넌', 32000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('SUV', '33다3333', 'AVAILABLE', '/assets/cars/mercedes-amg-g63.jpg', '메르세데스-AMG G 63', 19000);

-- 하이퍼카 & 슈퍼카
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '44라4444', 'AVAILABLE', '/assets/cars/bugatti-chiron.jpg', '부가티 시론', 45000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '55마5555', 'AVAILABLE', '/assets/cars/ferrari-sf90-stradale.jpg', '페라리 SF90 스트라달레', 27000);

-- 럭셔리 세단
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '66바6666', 'AVAILABLE', '/assets/cars/mercedes-maybach-s-class.jpg', '메르세데스-마이바흐 S클래스', 28000);

-- 고성능 전기차
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '77사7777', 'AVAILABLE', '/assets/cars/bmw-i7.jpg', 'BMW i7', 17000);

-- 고성능 스포츠카
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '88아8888', 'AVAILABLE', '/assets/cars/porsche-911-turbo-s.jpg', '포르쉐 911 터보 S', 23000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '99자9999', 'AVAILABLE', '/assets/cars/audi-r8-spyder.jpg', '아우디 R8 V10 퍼포먼스 스파이더', 20000);

-- 컨버터블 & GT
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '12차1212', 'AVAILABLE', '/assets/cars/ferrari-roma-spider.jpg', '페라리 로마 스파이더', 25000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '34카3434', 'AVAILABLE', '/assets/cars/lexus-lc500-convertible.jpg', '렉서스 LC 500 컨버터블', 16000);

-- 고성능 전기 GT
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '56타5656', 'AVAILABLE', '/assets/cars/audi-rs-etron-gt.jpg', '아우디 RS e-트론 GT', 18000);

-- 트랙 & 퍼포먼스
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '13하1313', 'AVAILABLE', '/assets/cars/mclaren-750s.jpg', '맥라렌 750S', 28000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '25호2525', 'AVAILABLE', '/assets/cars/porsche-911-gt3rs.jpg', '포르쉐 911 GT3 RS', 26000);

-- 아메리칸 머슬
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '48거4848', 'AVAILABLE', '/assets/cars/chevrolet-corvette-z06.jpg', '쉐보레 콜벳 Z06', 21000);

-- 초고성능 세단
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '72너7272', 'AVAILABLE', '/assets/cars/bmw-m8-gran-coupe.jpg', 'BMW M8 컴페티션 그란 쿠페', 20000);

-- 울트라 럭셔리 EV
INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('FULLSIZE', '83더8383', 'AVAILABLE', '/assets/cars/cadillac-celestiq.jpg', '캐딜락 셀레스틱', 35000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('SUV', '15서1515', 'AVAILABLE', '/assets/cars/ferrari-purosangue.jpg', '페라리 푸로산게', 38000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('SUV', '28모2828', 'AVAILABLE', '/assets/cars/bentley-bentayga-ewb.jpg', '벤틀리 벤테이가 EWB', 29000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('SUV', '39카3939', 'AVAILABLE', '/assets/cars/porsche-cayenne-turbo-gt.jpg', '포르쉐 카이엔 터보 GT', 25000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('SUV', '41프4141', 'AVAILABLE', '/assets/cars/range-rover-sv.jpg', '랜드로버 레인지로버 SV', 28000);

INSERT INTO CAR (VEHICLE_TYPE_CODE, CAR_NUMBER, STATUS, IMAGE_URL, CAR_NAME, RENT_PRICE_PER_10MIN)
VALUES ('SUV', '52젝5252', 'AVAILABLE', '/assets/cars/cadillac-escalade-v.jpg', '캐딜락 에스컬레이드-V', 22000);

COMMIT;

DELETE FROM CAR
WHERE ID BETWEEN 30 AND 38;
COMMIT;

select * from RESERVATION;

ALTER TABLE reservation
    MODIFY (rental_time DATE);

ALTER TABLE reservation
    MODIFY (return_time DATE);

INSERT INTO reservation (rental_time, return_time)
VALUES (TO_DATE('17:40:00', 'HH24:MI:SS'), TO_DATE('22:10:00', 'HH24:MI:SS'));

ALTER TABLE reservation
DROP COLUMN rental_date;

ALTER TABLE reservation
DROP COLUMN RETURN_DATE;

ALTER TABLE RESERVATION
    ADD (RENTAL_DATE DATE);

ALTER TABLE RESERVATION
    ADD (RETURN_DATE DATE);

select * from RESERVATION;

DELETE FROM RESERVATION
WHERE ID = 26;

UPDATE RESERVATION
SET STATUS = 'UPCOMING'
WHERE ID = 42;

COMMIT;

SELECT a.constraint_name,
       a.table_name   AS child_table,
       a.column_name  AS child_column,
       c.table_name   AS parent_table,
       c.column_name  AS parent_column
FROM   all_cons_columns a
           JOIN   all_constraints cons
                  ON   a.owner = cons.owner
                      AND   a.constraint_name = cons.constraint_name
           JOIN   all_cons_columns c
                  ON   cons.r_constraint_name = c.constraint_name
                      AND   cons.owner = c.owner
WHERE  cons.constraint_type = 'R'
  AND    c.table_name = 'RESERVATION'
  AND    c.column_name = 'ID';

-- 1. 자식 테이블 먼저 삭제
DELETE FROM MOCA.NOTIFICATIONS
WHERE RESERVATION_ID = 26;

-- 2. 부모 테이블 삭제
DELETE FROM MOCA.RESERVATION
WHERE ID = 26;

COMMIT;
