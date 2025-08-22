package com.moca.app.login;

import com.moca.app.login.User; // User 클래스 import
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    private long tokenValidTime = 30 * 60 * 1000L; // 토큰 유효시간 30분

    // JWT 토큰 생성 메서드를 User 객체를 받도록 수정
    public String createToken(User user) {
        Claims claims = Jwts.claims().setSubject(user.getId().toString()); // JWT payload 에 저장되는 정보단위, 보통 user를 식별하는 값을 넣음

        // 👇 토큰에 담고 싶은 추가 정보(이름, 역할 등)를 claim으로 추가
        claims.put("username", user.getNickname());
        claims.put("role", "user"); // 역할(role)은 필요에 따라 동적으로 부여 (예: user.getRole())

        Date now = new Date();
        return Jwts.builder()
                .setClaims(claims) // 정보 저장
                .setIssuedAt(now) // 토큰 발행 시간 정보
                .setExpiration(new Date(now.getTime() + tokenValidTime)) // set Expire Time
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }
}

