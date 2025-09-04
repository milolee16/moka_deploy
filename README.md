# Moca Project

Moca는 차량 렌탈 서비스를 위한 웹 애플리케이션입니다. 사용자들이 편리하게 차량을 예약하고 관리할 수 있는 통합 플랫폼을 제공합니다.

## 주요 기능

### 사용자 기능
- 카카오 소셜 로그인
- 차량 예약 및 관리
- 면허증 인증 (OCR 기반)
- 공지사항 및 FAQ 조회
- 예약 현황 확인

### 관리자 기능
- 관리자 대시보드
- 차량 관리 (등록, 수정, 삭제)
- 예약 현황 모니터링
- 면허증 승인 관리
- 공지사항 및 FAQ 관리

### OCR 기능
- 신분증 인식
- 운전면허증 인식
- 여권 인식
- 외국인등록증 인식
- 신용카드 인식
- QR/바코드 인식

## 기술 스택

### Backend
- **Framework**: Spring Boot
- **Language**: Java 17
- **Database**: Oracle
- **Authentication**: JWT, Kakao OAuth 2.0
- **OCR**: EasyCodef API

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Styled Components
- **Icons**: React Icons

## 프로젝트 구조

```
moca/
├── back/                           # Spring Boot 백엔드
│   ├── src/main/java/com/moca/app/
│   │   ├── config/                 # 설정 클래스
│   │   ├── controller/             # REST API 컨트롤러
│   │   ├── service/                # 비즈니스 로직
│   │   ├── login/                  # 인증 관련
│   │   └── ocr/                    # OCR 관련
│   ├── src/main/resources/
│   │   ├── db/                     # 데이터베이스 스크립트
│   │   └── js/                     # JavaScript 유틸리티
│   └── src/test/                   # 테스트 코드
├── front/                          # React 프론트엔드
│   ├── src/
│   │   ├── components/             # React 컴포넌트
│   │   ├── pages/                  # 페이지 컴포넌트
│   │   └── utils/                  # 유틸리티 함수
│   └── public/                     # 정적 파일
└── README.md
```

## 설치 및 실행

### 사전 요구사항
- Java 17 이상
- Node.js 16 이상
- Oracle Database
- Git

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd moca
```

### 2. 데이터베이스 설정
Oracle 데이터베이스에 다음 스크립트를 실행하여 테이블을 생성합니다:
```bash
# 렌탈 시스템 테이블 생성
@back/src/main/resources/db/rental.sql
```

### 3. 백엔드 설정
```bash
cd back

# application.properties 파일 설정
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

`application.properties` 파일에서 다음 설정을 수정하세요:
```properties
# 데이터베이스 설정
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:xe
spring.datasource.username=your_username
spring.datasource.password=your_password

# 카카오 OAuth 설정
kakao.client.id=your_kakao_client_id
kakao.client.secret=your_kakao_client_secret

# JWT 설정
jwt.secret=your_jwt_secret_key
```

### 4. EasyCodef OCR API 설정
`back/src/main/java/com/moca/app/ocr/api/EasyCodefClientInfo.java` 파일에서 API 정보를 설정하세요:
```java
public static final String CLIENT_ID = "your_codef_client_id";
public static final String CLIENT_SECRET = "your_codef_client_secret";
public static final String PUBLIC_KEY = "your_codef_public_key";
```

### 5. 백엔드 실행
```bash
# Gradle을 사용한 실행
./gradlew bootRun

# 또는 IDE에서 MocaApplication.java 실행
```

### 6. 프론트엔드 실행
새 터미널에서:
```bash
cd front

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## API 엔드포인트

### 인증
- `POST /api/auth/kakao` - 카카오 로그인
- `POST /api/auth/refresh` - 토큰 갱신

### 사용자 관리
- `GET /api/users/profile` - 사용자 프로필 조회
- `PUT /api/users/profile` - 사용자 프로필 수정

### 차량 관리
- `GET /api/cars` - 차량 목록 조회
- `GET /api/cars/{id}` - 특정 차량 조회
- `POST /api/cars` - 차량 등록 (관리자)
- `PUT /api/cars/{id}` - 차량 수정 (관리자)
- `DELETE /api/cars/{id}` - 차량 삭제 (관리자)

### 예약 관리
- `GET /api/reservations` - 예약 목록 조회
- `POST /api/reservations` - 예약 생성
- `PUT /api/reservations/{id}` - 예약 수정
- `DELETE /api/reservations/{id}` - 예약 취소

### 면허증 관리
- `POST /api/licenses` - 면허증 등록
- `GET /api/licenses/{id}` - 면허증 조회
- `PUT /api/licenses/{id}/approve` - 면허증 승인 (관리자)

### OCR
- `POST /api/ocr/process` - OCR 처리

### 공지사항
- `GET /api/notices` - 공지사항 목록 조회
- `GET /api/notices/{id}` - 특정 공지사항 조회
- `POST /api/notices` - 공지사항 생성 (관리자)
- `PUT /api/notices/{id}` - 공지사항 수정 (관리자)
- `DELETE /api/notices/{id}` - 공지사항 삭제 (관리자)

### FAQ
- `GET /api/faqs` - FAQ 목록 조회
- `GET /api/faqs/{id}` - 특정 FAQ 조회

## 테스트

### 백엔드 테스트
```bash
cd back
./gradlew test
```

### 프론트엔드 테스트
```bash
cd front
npm test
```

## 배포

### 백엔드 빌드
```bash
cd back
./gradlew build

# JAR 파일이 build/libs/ 디렉토리에 생성됩니다
java -jar build/libs/app-0.0.1-SNAPSHOT.jar
```

### 프론트엔드 빌드
```bash
cd front
npm run build

# 빌드된 파일이 dist/ 디렉토리에 생성됩니다
```

## 환경 변수

### 백엔드
- `DB_URL` - 데이터베이스 URL
- `DB_USERNAME` - 데이터베이스 사용자명
- `DB_PASSWORD` - 데이터베이스 비밀번호
- `KAKAO_CLIENT_ID` - 카카오 클라이언트 ID
- `KAKAO_CLIENT_SECRET` - 카카오 클라이언트 시크릿
- `JWT_SECRET` - JWT 비밀키
- `CODEF_CLIENT_ID` - EasyCodef 클라이언트 ID
- `CODEF_CLIENT_SECRET` - EasyCodef 클라이언트 시크릿

### 프론트엔드
- `VITE_API_BASE_URL` - API 서버 기본 URL
- `VITE_KAKAO_APP_KEY` - 카카오 앱 키

## 문제 해결

### 자주 발생하는 문제들

**백엔드 연결 실패**
- 백엔드 서버가 실행 중인지 확인: `http://localhost:8080/api/hello`
- 데이터베이스 연결 설정 확인
- 방화벽 설정 확인

**포트 충돌**
- `application.properties`에서 `server.port` 변경
- 프론트엔드 포트 변경: `vite.config.js`에서 포트 설정

**OCR 기능 오류**
- EasyCodef API 키 설정 확인
- 이미지 형식 및 크기 확인
- API 호출 한도 확인

## 기여 방법

1. 프로젝트를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다
- 카카오 로그인 연동
- OCR 기능 구현
- 관리자 대시보드 구현
