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