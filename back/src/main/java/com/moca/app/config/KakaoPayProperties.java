package com.moca.app.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component; // @Component 추가를 권장합니다.

/**
 * application.yml의 카카오페이 설정 정보를 담는 클래스
 */
@Component // Spring이 이 클래스를 관리하도록 @Component를 붙여주세요.
@Getter
@Setter
@ConfigurationProperties(prefix = "kakao.pay")
public class KakaoPayProperties {
    private String adminKey;
    private String cid;
    private String host;
}