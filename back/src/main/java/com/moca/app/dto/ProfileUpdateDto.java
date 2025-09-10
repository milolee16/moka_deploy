package com.moca.app.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateDto {
    private String username;
    private String birthDate; // YYMMDD format from client
    private String phoneNumber;
    private String currentPassword;
    private String newPassword;
}
