package com.moca.app.config;

import com.moca.app.login.JwtTokenProvider;
import com.moca.app.login.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider; // Inject JwtTokenProvider

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정을 Spring Security에 통합
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 보호 비활성화 (JWT를 사용하는 stateless API에서는 보통 비활성화)
                .csrf(AbstractHttpConfigurer::disable)

                // 3. 세션 관리 정책을 STATELESS로 설정 (JWT 사용)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. HTTP Basic 인증 및 폼 로그인 비활성화
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)

                // 5. 요청 경로별 접근 권한 설정
                .authorizeHttpRequests(authorize -> authorize
                        // 인증 관련 API 경로는 누구나 접근 가능하도록 허용
                        .requestMatchers("/api/auth/**").permitAll()
                        // 예약 관련 API는 인증 필요
                        .requestMatchers("/api/reservations/**").authenticated() // Protect reservation endpoints
                        // 다른 모든 요청은 일단 허용 (나중에 필요에 따라 인증 요구하도록 수정)
                        .anyRequest().permitAll()
                )
                // 6. JWT 필터 추가
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class); // Add JWT filter

        return http.build();
    }

    // CORS 설정을 위한 Bean 정의
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 Origin(출처) 설정
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));

        // 허용할 HTTP 메서드 설정
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // 허용할 헤더 설정
        configuration.setAllowedHeaders(List.of("*"));

        // 자격 증명(쿠키 등) 허용 여부
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로에 대해 위 CORS 설정을 적용
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}