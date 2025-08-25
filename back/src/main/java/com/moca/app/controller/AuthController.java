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

    // 일반 로그인 엔드포인트
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

    // 회원가입 엔드포인트
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> requestBody) {
        String userId = requestBody.get("userId");
        String password = requestBody.get("password");
        String userName = requestBody.get("userName");

        // 입력값 검증
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("사용자 ID가 필요합니다.");
        }
        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("비밀번호가 필요합니다.");
        }
        if (userName == null || userName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("사용자 이름이 필요합니다.");
        }

        // 기본적인 유효성 검사
        if (userId.trim().length() < 4) {
            return ResponseEntity.badRequest().body("사용자 ID는 4자 이상이어야 합니다.");
        }
        if (password.length() < 4) {
            return ResponseEntity.badRequest().body("비밀번호는 4자 이상이어야 합니다.");
        }

        try {
            String jwtToken = authService.register(userId.trim(), password, userName.trim());
            return ResponseEntity.ok(Map.of("accessToken", jwtToken));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("회원가입 처리 중 서버 에러가 발생했습니다: " + e.getMessage());
        }
    }

    // ID 중복 체크 엔드포인트
    @PostMapping("/check-userid")
    public ResponseEntity<?> checkUserId(@RequestBody Map<String, String> requestBody) {
        String userId = requestBody.get("userId");

        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("사용자 ID가 필요합니다.");
        }

        try {
            boolean exists = authService.existsByUserId(userId.trim());
            return ResponseEntity.ok(Map.of(
                    "exists", exists,
                    "message", exists ? "이미 사용 중인 ID입니다." : "사용 가능한 ID입니다."
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("ID 중복 체크 중 에러가 발생했습니다: " + e.getMessage());
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