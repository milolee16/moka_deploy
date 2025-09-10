package com.moca.app.service;

import com.moca.app.dto.ProfileResponseDto;
import com.moca.app.dto.ProfileUpdateDto;
import com.moca.app.login.AppUser;
import com.moca.app.login.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final AppUserRepository appUserRepository;

    // --- 사용자 프로필 관련 기능 ---

    /**
     * 현재 로그인된 사용자의 프로필 조회
     */
    public ProfileResponseDto getProfile() {
        AppUser user = getCurrentUser();
        return new ProfileResponseDto(user);
    }

    /**
     * 현재 로그인된 사용자의 프로필 수정
     */
    @Transactional
    public void updateProfile(ProfileUpdateDto dto) {
        AppUser user = getCurrentUser();
        user.updateProfile(dto); // 엔티티 내부 메서드를 통한 업데이트
    }

    /**
     * SecurityContext에서 현재 인증된 사용자 정보 조회
     */
    private AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        return appUserRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
    }


    // --- 관리자용 사용자 관리 기능 ---

    /**
     * 모든 사용자 조회
     */
    public List<AppUser> findAllUsers() {
        return appUserRepository.findAll();
    }

    /**
     * 특정 사용자 조회
     */
    public AppUser findUserById(String userId) {
        return appUserRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다: " + userId));
    }

    /**
     * 사용자 권한 변경
     */
    @Transactional
    public AppUser updateUserRole(String userId, String newRole) {
        // 권한 유효성 검사
        if (!isValidRole(newRole)) {
            throw new IllegalStateException("유효하지 않은 권한입니다: " + newRole);
        }

        AppUser user = findUserById(userId);

        // 새로운 사용자 객체 생성 (불변 객체 패턴)
        AppUser updatedUser = AppUser.builder()
                .userId(user.getUserId())
                .userPassword(user.getUserPassword())
                .userName(user.getUserName())
                .userRole(newRole)
                .build();

        return appUserRepository.save(updatedUser);
    }

    /**
     * 사용자 이름 변경
     */
    @Transactional
    public AppUser updateUserName(String userId, String newName) {
        AppUser user = findUserById(userId);

        AppUser updatedUser = AppUser.builder()
                .userId(user.getUserId())
                .userPassword(user.getUserPassword())
                .userName(newName)
                .userRole(user.getUserRole())
                .build();

        return appUserRepository.save(updatedUser);
    }

    /**
     * 사용자 삭제
     */
    @Transactional
    public void deleteUser(String userId) {
        AppUser user = findUserById(userId);

        // 관리자 삭제 방지 (추가 보안)
        if ("admin".equalsIgnoreCase(user.getUserRole())) {
            throw new IllegalStateException("관리자 계정은 삭제할 수 없습니다.");
        }

        appUserRepository.delete(user);
    }

    /**
     * 권한 유효성 검사
     */
    private boolean isValidRole(String role) {
        return "admin".equalsIgnoreCase(role) || "user".equalsIgnoreCase(role);
    }
}