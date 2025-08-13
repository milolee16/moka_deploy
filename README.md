# Moca Project - 간단한 연결 테스트

React와 Spring Boot가 연결되는지 확인하는 최소한의 설정입니다.

## 필요한 파일들

### 백엔드 (Spring Boot)
1. `back/src/main/resources/application.properties`
2. `back/src/main/java/com/moca/app/config/WebConfig.java`
3. `back/src/main/java/com/moca/app/controller/HelloController.java`

### 프론트엔드 (React)
1. `front/vite.config.js` (기존 파일 수정)
2. `front/src/App.jsx` (기존 파일 수정)
3. `front/src/App.css` (기존 파일 수정)

## 실행 방법

### 1. 백엔드 실행
```bash
cd back
./gradlew bootRun
```

### 2. 프론트엔드 실행 (새 터미널에서)
```bash
cd front
npm install
npm run dev
```

## 테스트 방법

1. 프론트엔드 페이지 (http://localhost:3000) 접속
2. "백엔드 연결 테스트" 버튼 클릭
3. 성공 메시지가 나오면 연결 완료! 🎉

## API 엔드포인트

- `GET /api/hello` - JSON 응답 반환
- `GET /api/hello/test` - 간단한 문자열 응답

## 문제 해결

- **연결 실패 시**: 백엔드 서버가 실행 중인지 확인 (http://localhost:8080/api/hello)
- **포트 충돌 시**: application.properties에서 server.port 변경