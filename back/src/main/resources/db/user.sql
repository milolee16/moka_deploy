-- ========================================
-- 1. 사용자 테이블 (USERS)
-- ========================================

-- 테이블 생성
CREATE TABLE USERS (
                       user_id VARCHAR2(50) PRIMARY KEY,
                       user_password VARCHAR2(100) NOT NULL,
                       user_name VARCHAR2(50) NOT NULL,
                       user_role varchar(20) not null
);

-- 컬럼 추가 (휴대폰번호, 생년월일)
ALTER TABLE USERS ADD BIRTH_DATE DATE;
ALTER TABLE USERS ADD PHONE_NUMBER VARCHAR(255);

-- USERS Table Dummy Data INSERT Statements

INSERT INTO USERS (user_id, user_password, user_name, user_role) VALUES ('user01', 'password123', '김철수', 'user');
INSERT INTO USERS (user_id, user_password, user_name, user_role) VALUES ('user02', 'password123', '이영희', 'user');
INSERT INTO USERS (user_id, user_password, user_name, user_role) VALUES ('user03', 'password123', '최민준', 'user');
INSERT INTO USERS (user_id, user_password, user_name, user_role) VALUES ('user04', 'password123', '정수빈', 'user');
INSERT INTO USERS (user_id, user_password, user_name, user_role) VALUES ('user05', 'password123', '윤지우', 'user');
INSERT INTO USERS (user_id, user_password, user_name, user_role) VALUES ('user06', 'password123', '박관리', 'user');
INSERT INTO USERS (user_id, user_password, user_name, user_role) VALUES ('user07', 'password123', '오하은', 'user');
INSERT INTO USERS (user_id, user_password, user_name, user_role) VALUES ('ksy', 'ksy', '곽수영', 'admin');
INSERT INTO USERS (user_id, user_password, user_name, user_role) VALUES ('kko', 'kko', '김건오', 'admin');
INSERT INTO USERS (user_id, user_password, user_name, user_role) VALUES ('kdy', 'kdy', '김도연', 'admin');

-- 기존 사용자 정보에 생년월일 및 휴대폰 번호 추가

UPDATE USERS SET BIRTH_DATE = TO_DATE('2001-05-10', 'YYYY-MM-DD'), PHONE_NUMBER = '010-1111-2222' WHERE user_id = 'test1';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1992-03-15', 'YYYY-MM-DD'), PHONE_NUMBER = '010-1234-5678' WHERE user_id = 'user01';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1995-11-08', 'YYYY-MM-DD'), PHONE_NUMBER = '010-8765-4321' WHERE user_id = 'user02';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1998-09-01', 'YYYY-MM-DD'), PHONE_NUMBER = '010-2345-6789' WHERE user_id = 'user03';
UPDATE USERS SET BIRTH_DATE = TO_DATE('2002-07-22', 'YYYY-MM-DD'), PHONE_NUMBER = '010-3456-7890' WHERE user_id = 'user04';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1994-12-30', 'YYYY-MM-DD'), PHONE_NUMBER = '010-4567-8901' WHERE user_id = 'user05';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1999-02-14', 'YYYY-MM-DD'), PHONE_NUMBER = '010-5678-9012' WHERE user_id = 'user06';
UPDATE USERS SET BIRTH_DATE = TO_DATE('2003-06-05', 'YYYY-MM-DD'), PHONE_NUMBER = '010-6789-0123' WHERE user_id = 'user07';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1990-01-25', 'YYYY-MM-DD'), PHONE_NUMBER = '010-7890-1234' WHERE user_id = 'ksy';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1988-08-17', 'YYYY-MM-DD'), PHONE_NUMBER = '010-8901-2345' WHERE user_id = 'kko';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1991-04-03', 'YYYY-MM-DD'), PHONE_NUMBER = '010-9012-3456' WHERE user_id = 'kdy';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1996-10-11', 'YYYY-MM-DD'), PHONE_NUMBER = '010-0123-4567' WHERE user_id = 'jhw1';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1993-05-20', 'YYYY-MM-DD'), PHONE_NUMBER = '010-1122-3344' WHERE user_id = 'kim_cs';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1997-08-12', 'YYYY-MM-DD'), PHONE_NUMBER = '010-2233-4455' WHERE user_id = 'lee_yh';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1994-01-09', 'YYYY-MM-DD'), PHONE_NUMBER = '010-3344-5566' WHERE user_id = 'park_ms';
UPDATE USERS SET BIRTH_DATE = TO_DATE('2000-02-29', 'YYYY-MM-DD'), PHONE_NUMBER = '010-4455-6677' WHERE user_id = 'choi_je';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1992-06-18', 'YYYY-MM-DD'), PHONE_NUMBER = '010-5566-7788' WHERE user_id = 'jung_th';
UPDATE USERS SET BIRTH_DATE = TO_DATE('1998-11-23', 'YYYY-MM-DD'), PHONE_NUMBER = '010-6677-8899' WHERE user_id = 'kang_sj';
UPDATE USERS SET BIRTH_DATE = TO_DATE('2001-09-07', 'YYYY-MM-DD'), PHONE_NUMBER = '010-7788-9900' WHERE user_id = 'yoon_mr';

-- 커밋
COMMIT;

-- 확인 쿼리
SELECT * FROM USERS;


