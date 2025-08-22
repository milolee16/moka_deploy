package com.moca.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.Date;

/**
 * 카카오페이 API가 결제 준비 후 응답하는 데이터
 */
@Data
public class KakaoPayReadyResponse {

    private String tid; // 결제 고유 번호

    @JsonProperty("next_redirect_pc_url")
    private String nextRedirectPcUrl; // PC 웹일 경우 리다이렉트될 URL

    @JsonProperty("next_redirect_mobile_url")
    private String nextRedirectMobileUrl; // 모바일 웹일 경우 리다이렉트될 URL

    @JsonProperty("android_app_scheme")
    private String androidAppScheme; // 안드로이드 앱 스키마

    @JsonProperty("ios_app_scheme")
    private String iosAppScheme; // iOS 앱 스키마

    @JsonProperty("created_at")
    private Date createdAt; // 결제 준비 요청 시간
}