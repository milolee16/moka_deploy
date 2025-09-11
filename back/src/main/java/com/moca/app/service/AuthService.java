package com.moca.app.service;

import com.moca.app.login.AppUser;
import com.moca.app.login.AppUserRepository;
import com.moca.app.login.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public String login(String userId, String password) {
        Optional<AppUser> userOptional = appUserRepository.findByUserId(userId);

        if (userOptional.isPresent()) {
            AppUser user = userOptional.get();
            // 평문 비교
            if (password.equals(user.getUserPassword())) {
                return jwtTokenProvider.createToken(user);
            }
        }
        return null; // 로그인 실패
    }

    public String register(String userId, String password, String userName,
                           String birthDateStr, String phoneNumber) {
        if (existsByUserId(userId)) {
            throw new RuntimeException("이미 존재하는 사용자 ID입니다.");
        }

        LocalDate birthDate = LocalDate.parse(birthDateStr, DateTimeFormatter.ISO_LOCAL_DATE);

        AppUser newUser = AppUser.builder()
                .userId(userId)
                .userPassword(password) // 그대로 저장
                .userName(userName)
                .userRole("user")
                .birthDate(birthDate)
                .phoneNumber(phoneNumber)
                .build();

        appUserRepository.save(newUser);
        return jwtTokenProvider.createToken(newUser);
    }

    public boolean existsByUserId(String userId) {
        return appUserRepository.findByUserId(userId).isPresent();
    }

    public boolean validateToken(String token) {
        return jwtTokenProvider.validateToken(token);
    }
}
