package com.moca.app.controller;

import com.moca.app.service.KakaoUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth/kakao")
@RequiredArgsConstructor
public class AuthController {

    private final KakaoUserService kakaoUserService;

    @PostMapping("/login")
    public ResponseEntity<?> kakaoLogin(@RequestBody Map<String, String> requestBody) {
        String code = requestBody.get("code");
        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body("인가 코드가 필요합니다.");
        }

        try {
            String jwtToken = kakaoUserService.loginOrRegister(code);

            // 👇 이 부분이 가장 중요합니다!
            // 생성된 JWT 토큰을 JSON 객체 {"accessToken": "..."} 형태로 포장하여
            // 성공 신호(200 OK)와 함께 프론트엔드에 응답합니다.
            return ResponseEntity.ok(Map.of("accessToken", jwtToken));

        } catch (Exception e) {
            // 서버 내부 로직 처리 중 에러 발생 시
            // 콘솔에 에러 로그를 출력하여 원인을 파악할 수 있게 합니다.
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("로그인 처리 중 서버 에러가 발생했습니다: " + e.getMessage());
        }
    }
}