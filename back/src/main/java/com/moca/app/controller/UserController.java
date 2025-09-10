package com.moca.app.controller;

import com.moca.app.dto.ProfileResponseDto;
import com.moca.app.dto.ProfileUpdateDto;
import com.moca.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponseDto> getProfile() {
        ProfileResponseDto profile = userService.getProfile();
        return ResponseEntity.ok(profile);
    }

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
}
