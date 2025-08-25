package com.moca.app.login;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, String> {
    // userId와 userPassword로 사용자를 찾는 메서드
    Optional<AppUser> findByUserIdAndUserPassword(String userId, String userPassword);

    // userId로만 사용자를 찾는 메서드 (중복 체크용)
    Optional<AppUser> findByUserId(String userId);
}