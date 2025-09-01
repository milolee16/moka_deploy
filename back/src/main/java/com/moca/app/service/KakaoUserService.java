package com.moca.app.service;

import com.moca.app.login.KakaoUserInfo;
import com.moca.app.login.KakaoUser;
import com.moca.app.login.JwtTokenProvider;
import com.moca.app.login.KakaoUserRepository;
import org.springframework.transaction.annotation.Transactional; // ⬅️ 이 부분을 확인하세요!
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class KakaoUserService {

    // DB와 상호작용하는 코드를 모두 활성화합니다.
    private final KakaoUserRepository kakaoUserRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;

    @Value("${kakao.client-id}")
    private String clientId;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    @Value("${kakao.client-secret}")
    private String clientSecret;

    @Transactional
    public String loginOrRegister(String code) {
        String accessToken = getAccessToken(code);
        KakaoUserInfo userInfo = getUserInfo(accessToken);

        // DB에서 사용자를 찾거나, 없으면 새로 만들어서 저장합니다.
        KakaoUser user = kakaoUserRepository.findByKakaoId(userInfo.getId())
                .orElseGet(() -> {
                    KakaoUser newUser = KakaoUser.builder()
                            .kakaoId(userInfo.getId())
                            .nickname(userInfo.getNickname())
                            .email(userInfo.getKakaoAccount() != null ? userInfo.getKakaoAccount().getEmail() : null)
                            .build();
                    return kakaoUserRepository.save(newUser); // DB에 저장하고 ID를 할당받습니다.
                });

        // ID가 할당된 user 객체로 토큰을 생성합니다.
        return jwtTokenProvider.createToken(user);
    }

    // 1단계: 액세스 토큰 요청
    private String getAccessToken(String code) {
        String tokenUrl = "https://kauth.kakao.com/oauth/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);
        params.add("client_secret", clientSecret);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        Map<String, Object> responseBody = restTemplate.postForObject(tokenUrl, request, Map.class);
        return (String) responseBody.get("access_token");
    }

    // 2단계: 사용자 정보 요청
    private KakaoUserInfo getUserInfo(String accessToken) {
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> request = new HttpEntity<>(headers);

        return restTemplate.postForObject(userInfoUrl, request, KakaoUserInfo.class);
    }
}