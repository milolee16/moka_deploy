package com.moca.app.login;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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

    @Builder
    public AppUser(String userId, String userPassword, String userName, String userRole) {
        this.userId = userId;
        this.userPassword = userPassword;
        this.userName = userName;
        this.userRole = userRole;
    }
}