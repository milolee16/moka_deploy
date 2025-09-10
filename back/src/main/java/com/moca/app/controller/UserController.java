package com.moca.app.controller;

import com.moca.app.dto.ProfileResponseDto;
import com.moca.app.dto.ProfileUpdateDto;
import com.moca.app.login.AppUser;
import com.moca.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ======== 일반 사용자 API ========

    /**
     * 현재 로그인된 사용자의 프로필 조회
     */
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponseDto> getProfile() {
        ProfileResponseDto profile = userService.getProfile();
        return ResponseEntity.ok(profile);
    }

    /**
     * 현재 로그인된 사용자의 프로필 수정
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateDto dto) {
        try {
            userService.updateProfile(dto);
            return ResponseEntity.ok(Map.of("message", "프로필이 성공적으로 업데이트되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "프로필 업데이트 중 오류가 발생했습니다."));
        }
    }


    // ======== 관리자 전용 API ========

    /**
     * 관리자용 - 모든 사용자 목록 조회
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllUsers() {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        try {
            List<AppUser> users = userService.findAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("사용자 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 관리자용 - 특정 사용자 조회
     */
    @GetMapping("/admin/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        try {
            AppUser user = userService.findUserById(userId);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * 관리자용 - 사용자 권한 변경
     */
    @PutMapping("/admin/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> requestBody) {

        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        String newRole = requestBody.get("role");
        if (newRole == null || newRole.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("새로운 권한이 필요합니다.");
        }

        try {
            AppUser updatedUser = userService.updateUserRole(userId, newRole.trim());
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * 관리자용 - 사용자 삭제
     */
    @DeleteMapping("/admin/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        // 현재 로그인한 관리자가 자신을 삭제하는 것을 방지
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();
        if (userId.equals(currentUserId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("자신의 계정을 삭제할 수 없습니다.");
        }

        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok().body("사용자가 성공적으로 삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ======== Private Helper Methods ========

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            return auth.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        }
        return false;
    }
}
