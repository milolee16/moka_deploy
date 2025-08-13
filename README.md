# Moca Project

Spring Boot + React를 이용한 풀스택 웹 애플리케이션

## 기술 스택

### 백엔드
- Java 17
- Spring Boot 3.5.4
- Spring Data JPA
- H2 Database (개발용)
- Oracle Database (운영용)
- Lombok

### 프론트엔드
- React 19
- Vite
- JavaScript (ES6+)
- CSS3

## 프로젝트 구조

```
moca/
├── back/                    # Spring Boot 백엔드
│   ├── src/main/java/
│   │   └── com/moca/app/
│   │       ├── config/      # 설정 클래스
│   │       ├── controller/  # REST 컨트롤러
│   │       ├── entity/      # JPA 엔티티
│   │       ├── repository/  # 데이터 레포지토리
│   │       ├── service/     # 비즈니스 로직
│   │       └── AppApplication.java
│   └── src/main/resources/
│       └── application.properties
└── front/                   # React 프론트엔드
    ├── src/
    │   ├── components/      # React 컴포넌트
    │   ├── utils/          # 유틸리티 함수
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 개발 환경 설정

### 사전 요구사항
- Java 17 이상
- Node.js 16 이상
- npm 또는 yarn

### 1. 백엔드 실행

```bash
# 프로젝트 루트에서
cd back

# Gradle을 이용한 실행 (Windows)
.\gradlew bootRun

# Gradle을 이용한 실행 (macOS/Linux)
./gradlew bootRun
```

백엔드 서버는 `http://localhost:8080`에서 실행됩니다.

#### H2 데이터베이스 콘솔 접근
개발 중에는 H2 데이터베이스 콘솔을 통해 데이터를 확인할 수 있습니다:
- URL: `http://localhost:8080/api/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (비어있음)

### 2. 프론트엔드 실행

```bash
# 프로젝트 루트에서
cd front

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드 서버는 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### User API
- `GET /api/users` - 모든 사용자 조회
- `GET /api/users/{id}` - ID로 사용자 조회
- `GET /api/users/email/{email}` - 이메일로 사용자 조회
- `POST /api/users` - 사용자 생성
- `PUT /api/users/{id}` - 사용자 수정
- `DELETE /api/users/{id}` - 사용자 삭제
- `GET /api/users/search?name={name}` - 이름으로 사용자 검색
- `GET /api/users/health` - 헬스 체크

### 사용자 생성 예시
```json
POST /api/users
{
  "email": "test@example.com",
  "name": "홍길동",
  "phone": "010-1234-5678"
}
```

## 주요 기능

1. **사용자 관리**
    - 사용자 목록 조회
    - 새 사용자 등록
    - 사용자 정보 수정
    - 사용자 삭제
    - 사용자 검색

2. **API 연동**
    - RESTful API를 통한 프론트엔드-백엔드 통신
    - CORS 설정으로 개발 환경 지원
    - 에러 핸들링 및 로딩 상태 관리

3. **데이터베이스**
    - JPA를 이용한 ORM
    - 자동 타임스탬프 (생성일, 수정일)
    - H2 인메모리 데이터베이스 (개발용)

## 배포 설정

### Oracle 데이터베이스 연결
운영 환경에서 Oracle 데이터베이스를 사용하려면 `application.properties`에서 다음 설정을 활성화하세요:

```properties
# Oracle Database Configuration
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:xe
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
```

### 프로덕션 빌드

#### 백엔드
```bash
cd back
./gradlew build
java -jar build/libs/app-0.0.1-SNAPSHOT.jar
```

#### 프론트엔드
```bash
cd front
npm run build
```

빌드된 파일은 `front/dist` 폴더에 생성됩니다.

## 개발 팁

1. **백엔드 개발**
    - Spring Boot DevTools가 설정되어 있어 코드 변경 시 자동 재시작
    - 로깅 레벨이 DEBUG로 설정되어 개발 중 상세 로그 확인 가능

2. **프론트엔드 개발**
    - Vite의 HMR(Hot Module Replacement)로 빠른 개발 가능
    - 프록시 설정으로 백엔드 API 호출 시 CORS 문제 없음

3. **데이터베이스**
    - 개발 중에는 H2 콘솔을 활용해 데이터 상태 확인
    - 애플리케이션 재시작 시 데이터가 초기화됨 (인메모리 DB)

## 문제 해결

### 포트 충돌
- 백엔드: 8080 포트가 사용 중인 경우 `application.properties`에서 `server.port` 변경
- 프론트엔드: 3000 포트가 사용 중인 경우 `vite.config.js`에서 `server.port` 변경

### API 연결 문제
1. 백엔드 서버가 실행 중인지 확인
2. 프론트엔드에서 `http://localhost:8080/api/users/health` 접근 테스트
3. 브라우저 개발자 도구에서 네트워크 탭 확인

## 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다.