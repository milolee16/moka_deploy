package com.moca.app.controller;

import com.moca.app.service.AuthService;
import com.moca.app.service.KakaoUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final KakaoUserService kakaoUserService;
    private final AuthService authService;

    // 기존 카카오 로그인 엔드포인트
    @PostMapping("/kakao/login")
    public ResponseEntity<?> kakaoLogin(@RequestBody Map<String, String> requestBody) {
        String code = requestBody.get("code");
        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body("인가 코드가 필요합니다.");
        }

        try {
            String jwtToken = kakaoUserService.loginOrRegister(code);
            return ResponseEntity.ok(Map.of("accessToken", jwtToken));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("로그인 처리 중 서버 에러가 발생했습니다: " + e.getMessage());
        }
    }

    // 새로운 일반 로그인 엔드포인트
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> requestBody) {
        String userId = requestBody.get("userId");
        String password = requestBody.get("password");

        // 입력값 검증
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("사용자 ID가 필요합니다.");
        }
        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("비밀번호가 필요합니다.");
        }

        try {
            String jwtToken = authService.login(userId.trim(), password);

            if (jwtToken != null) {
                return ResponseEntity.ok(Map.of("accessToken", jwtToken));
            } else {
                return ResponseEntity.badRequest().body("아이디 또는 비밀번호가 일치하지 않습니다.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("로그인 처리 중 서버 에러가 발생했습니다: " + e.getMessage());
        }
    }

    // 토큰 검증 엔드포인트 (선택적)
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> requestBody) {
        String token = requestBody.get("token");

        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("토큰이 필요합니다.");
        }

        try {
            boolean isValid = authService.validateToken(token);
            return ResponseEntity.ok(Map.of("valid", isValid));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("토큰 검증 중 에러가 발생했습니다: " + e.getMessage());
        }
    }
}