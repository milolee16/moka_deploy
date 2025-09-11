package com.moca.app.dto;

import com.moca.app.login.AppUser;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
public class ProfileResponseDto {
    private String userId;
    private String username;
    private String birthDate;
    private String phoneNumber;

    public ProfileResponseDto(AppUser user) {
        this.userId = user.getUserId();
        this.username = user.getUserName();
        // Format LocalDate to YYMMDD string for the client
        if (user.getBirthDate() != null) {
            this.birthDate = user.getBirthDate().format(DateTimeFormatter.ofPattern("yyMMdd"));
        }
        this.phoneNumber = user.getPhoneNumber();
    }
}
