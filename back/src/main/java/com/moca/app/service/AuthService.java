package com.moca.app.service;

import com.moca.app.login.AppUser;
import com.moca.app.login.AppUserRepository;
import com.moca.app.login.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 사용자 로그인 처리
     * @param userId 사용자 ID
     * @param password 비밀번호
     * @return JWT 토큰 (로그인 실패시 null)
     */
    public String login(String userId, String password) {
        Optional<AppUser> userOptional = appUserRepository.findByUserIdAndUserPassword(userId, password);

        if (userOptional.isPresent()) {
            AppUser user = userOptional.get();
            return jwtTokenProvider.createToken(user);
        }

        return null; // 로그인 실패
    }

    /**
     * 사용자 회원가입 처리
     * @param userId 사용자 ID
     * @param password 비밀번호
     * @param userName 사용자 이름
     * @return JWT 토큰 (회원가입 성공 시), null (실패 시)
     */
    public String register(String userId, String password, String userName) {
        // 중복 체크
        if (existsByUserId(userId)) {
            throw new RuntimeException("이미 존재하는 사용자 ID입니다.");
        }

        // 새 사용자 생성
        AppUser newUser = AppUser.builder()
                .userId(userId)
                .userPassword(password)
                .userName(userName)
                .userRole("user") // 기본 역할을 user로 설정
                .build();

        try {
            // DB에 저장
            appUserRepository.save(newUser);

            // 회원가입 성공 시 JWT 토큰 생성하여 자동 로그인
            return jwtTokenProvider.createToken(newUser);

        } catch (Exception e) {
            throw new RuntimeException("회원가입 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 사용자 ID 중복 체크
     * @param userId 사용자 ID
     * @return 존재하면 true, 없으면 false
     */
    public boolean existsByUserId(String userId) {
        return appUserRepository.findByUserId(userId).isPresent();
    }

    /**
     * JWT 토큰 검증
     * @param token JWT 토큰
     * @return 유효하면 true, 무효하면 false
     */
    public boolean validateToken(String token) {
        return jwtTokenProvider.validateToken(token);
    }
}