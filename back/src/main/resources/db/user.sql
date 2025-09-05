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

-- 커밋
COMMIT;

-- 확인 쿼리
SELECT * FROM USERS;


