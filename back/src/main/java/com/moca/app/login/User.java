package com.moca.app.login;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "member") // ◀️ 이 부분을 추가해서 테이블 이름을 'member'로 지정
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 우리 서비스에서 사용하는 고유 ID

    @Column(unique = true) // Add this line
    private Long kakaoId; // 카카오가 부여한 사용자 고유 ID

    private String nickname;

    private String email;

    @Builder
    public User(Long kakaoId, String nickname, String email) {
        this.kakaoId = kakaoId;
        this.nickname = nickname;
        this.email = email;
    }
}