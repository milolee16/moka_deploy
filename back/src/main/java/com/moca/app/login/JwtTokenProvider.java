package com.moca.app.login;

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

    // 기존 카카오 로그인용 User 객체를 받는 메서드
    public String createToken(User user) {
        Claims claims = Jwts.claims().setSubject(user.getId().toString());
        claims.put("username", user.getNickname());
        claims.put("role", "user");

        Date now = new Date();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + tokenValidTime))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    // 새로운 일반 로그인용 AppUser 객체를 받는 메서드
    public String createToken(AppUser appUser) {
        Claims claims = Jwts.claims().setSubject(appUser.getUserId());
        claims.put("username", appUser.getUserName());
        claims.put("role", appUser.getUserRole());

        Date now = new Date();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + tokenValidTime))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    // JWT 토큰에서 사용자 정보를 추출하는 메서드
    public Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }

    // JWT 토큰의 유효성 검증 메서드
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}