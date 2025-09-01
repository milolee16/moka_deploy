package com.moca.app.login;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User; // Spring Security User
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    private long tokenValidTime = 30 * 60 * 1000L; // 토큰 유효시간 30분

    // 기존 카카오 로그인용 KakaoUser 객체를 받는 메서드
    public String createToken(KakaoUser kakaoUser) {
        Claims claims = Jwts.claims().setSubject(kakaoUser.getId().toString());
        claims.put("username", kakaoUser.getNickname());
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

    // JWT 토큰에서 인증 정보 조회
    public Authentication getAuthentication(String token) {
        Claims claims = getClaims(token); // Use existing getClaims method

        // Extract roles/authorities from claims (assuming "role" claim exists)
        // If role is a single string:
        String role = claims.get("role", String.class);
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

        // Use the subject (userId) as the principal name
        String userId = claims.getSubject(); // Get subject (userId) from claims

        // Create Spring Security UserDetails object
        User principal = new User(userId, "", authorities); // Use userId as principal name

        return new UsernamePasswordAuthenticationToken(principal, "", authorities);
    }
}