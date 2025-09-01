package com.moca.app.login;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KakaoUserRepository extends JpaRepository<KakaoUser, Long> {
    // kakaoId를 통해 이미 가입된 사용자인지 확인하기 위한 메서드
    Optional<KakaoUser> findByKakaoId(Long kakaoId);
}
