package com.moca.app.login;

import com.moca.app.dto.ProfileUpdateDto;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "USERS") // Oracle USERS 테이블과 매핑
public class AppUser {

    @Id
    @Column(name = "USER_ID")
    private String userId; // 사용자 ID (Primary Key)

    @Column(name = "USER_PASSWORD")
    private String userPassword; // 사용자 비밀번호

    @Column(name = "USER_NAME")
    private String userName; // 사용자 이름

    @Column(name = "USER_ROLE")
    private String userRole; // 사용자 역할 (admin, user 등)

    @Column(name = "BIRTH_DATE")
    private LocalDate birthDate; // 생년월일

    @Column(name = "PHONE_NUMBER")
    private String phoneNumber; // 휴대폰 번호

    @Builder
    public AppUser(String userId, String userPassword, String userName, String userRole, LocalDate birthDate, String phoneNumber) {
        this.userId = userId;
        this.userPassword = userPassword;
        this.userName = userName;
        this.userRole = userRole;
        this.birthDate = birthDate;
        this.phoneNumber = phoneNumber;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    public void updateProfile(ProfileUpdateDto dto) {
        if (dto.getUsername() != null && !dto.getUsername().isEmpty()) {
            this.userName = dto.getUsername();
        }
        if (dto.getBirthDate() != null && !dto.getBirthDate().isEmpty()) {
            int year = Integer.parseInt(dto.getBirthDate().substring(0, 2));
            String month = dto.getBirthDate().substring(2, 4);
            String day = dto.getBirthDate().substring(4, 6);
            year = year >= 30 ? 1900 + year : 2000 + year;
            this.birthDate = LocalDate.parse(year + "-" + month + "-" + day, DateTimeFormatter.ISO_LOCAL_DATE);
        }
        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().isEmpty()) {
            this.phoneNumber = dto.getPhoneNumber();
        }

        // 평문 비밀번호 변경
        if (dto.getNewPassword() != null && !dto.getNewPassword().isEmpty()) {
            if (dto.getCurrentPassword() == null || !dto.getCurrentPassword().equals(this.userPassword)) {
                throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
            }
            this.userPassword = dto.getNewPassword();
        }
    }

}