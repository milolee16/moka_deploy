package com.moca.app.service;

import com.moca.app.dto.ProfileResponseDto;
import com.moca.app.dto.ProfileUpdateDto;
import com.moca.app.login.AppUser;
import com.moca.app.login.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final AppUserRepository appUserRepository;

    public ProfileResponseDto getProfile() {
        AppUser user = getCurrentUser();
        return new ProfileResponseDto(user);
    }

    @Transactional
    public void updateProfile(ProfileUpdateDto dto) {
        AppUser user = getCurrentUser();
        user.updateProfile(dto); // 수정된 메서드 호출
    }

    private AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        return appUserRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
    }
}
