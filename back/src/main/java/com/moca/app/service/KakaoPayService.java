package com.moca.app.service;

import com.moca.app.config.KakaoPayProperties;
import com.moca.app.dto.KakaoPayApproveResponse;
import com.moca.app.dto.KakaoPayReadyRequest;
import com.moca.app.dto.KakaoPayReadyResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class KakaoPayService {

    private final KakaoPayProperties kakaoPayProperties;
    private final RestTemplate restTemplate;

    // ✅ 콜백 베이스(URL) 환경변수/설정으로 주입 (기본값은 로컬 백엔드)
    @Value("${app.backend-callback-base:http://localhost:8080/api/kakaopay}")
    private String callbackBase;

    // 동시성 대응 (멀티 인스턴스는 Redis/DB 권장)
    private final Map<String, PaymentInfo> paymentInfoMap = new ConcurrentHashMap<>();

    @Data
    @AllArgsConstructor
    private static class PaymentInfo {
        private String tid;
        private String partnerUserId;
    }

    public KakaoPayReadyResponse ready(KakaoPayReadyRequest requestDto) {
        String url = kakaoPayProperties.getHost() + "/v1/payment/ready";

        HttpHeaders headers = buildDefaultHeaders();
        MultiValueMap<String, String> params = buildReadyParams(requestDto);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

        try {
            KakaoPayReadyResponse response =
                    restTemplate.postForObject(url, requestEntity, KakaoPayReadyResponse.class);

            if (response != null) {
                // 승인 단계용 정보 임시 저장
                PaymentInfo info = new PaymentInfo(response.getTid(), requestDto.getPartner_user_id());
                paymentInfoMap.put(requestDto.getPartner_order_id(), info);
                log.info("KakaoPay Ready OK. orderId={}, tid={}, userId={}",
                        requestDto.getPartner_order_id(), info.getTid(), info.getPartnerUserId());
            }
            return response;
        } catch (HttpClientErrorException e) {
            log.error("KakaoPay Ready API 4xx. status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("카카오페이 결제 준비 실패(응답 오류).", e);
        } catch (RestClientException e) {
            log.error("KakaoPay Ready API error. msg={}", e.getMessage(), e);
            throw new IllegalStateException("카카오페이 결제 준비 실패(통신 오류).", e);
        }
    }

    public KakaoPayApproveResponse approve(String partnerOrderId, String pgToken) {
        PaymentInfo info = paymentInfoMap.get(partnerOrderId);
        if (info == null) {
            log.error("Approve Error: PaymentInfo not found. orderId={}", partnerOrderId);
            throw new IllegalStateException("결제 요청 정보를 찾을 수 없습니다. (주문번호: " + partnerOrderId + ")");
        }

        String url = kakaoPayProperties.getHost() + "/v1/payment/approve";

        HttpHeaders headers = buildDefaultHeaders();
        MultiValueMap<String, String> params =
                buildApproveParams(partnerOrderId, pgToken, info.getTid(), info.getPartnerUserId());

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

        try {
            KakaoPayApproveResponse response =
                    restTemplate.postForObject(url, requestEntity, KakaoPayApproveResponse.class);

            if (response != null) {
                // 성공 시 임시 데이터 정리
                paymentInfoMap.remove(partnerOrderId);
                log.info("KakaoPay Approve OK. aid={}", response.getAid());
                // TODO: 결제정보 영속화 및 주문 상태 업데이트
            }
            return response;
        } catch (HttpClientErrorException e) {
            log.error("KakaoPay Approve API 4xx. orderId={}, status={}, body={}",
                    partnerOrderId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("카카오페이 결제 승인 실패(응답 오류).", e);
        } catch (RestClientException e) {
            log.error("KakaoPay Approve API error. orderId={}, msg={}", partnerOrderId, e.getMessage(), e);
            throw new IllegalStateException("카카오페이 결제 승인 실패(통신 오류).", e);
        }
    }

    private HttpHeaders buildDefaultHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String adminKey = kakaoPayProperties.getAdminKey();

        // ✅ 운영 안전: 마스킹 로그
        String masked = (adminKey == null) ? "null"
                : adminKey.substring(0, Math.min(6, adminKey.length())) + "****";
        log.info("Using KakaoPay Admin Key (masked): {}", masked);

        if (adminKey == null || adminKey.trim().isEmpty()) {
            log.error("KakaoPay Admin Key not configured");
            throw new IllegalStateException("KakaoPay Admin Key is missing.");
        }

        headers.add("Authorization", "KakaoAK " + adminKey.trim());
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        return headers;
    }

    private MultiValueMap<String, String> buildReadyParams(KakaoPayReadyRequest requestDto) {
        String partnerOrderId = requestDto.getPartner_order_id();

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("cid", kakaoPayProperties.getCid());
        params.add("partner_order_id", partnerOrderId);
        params.add("partner_user_id", requestDto.getPartner_user_id());
        params.add("item_name", requestDto.getItem_name());
        params.add("quantity", String.valueOf(requestDto.getQuantity()));
        // ✅ 중복 제거
        params.add("total_amount", String.valueOf(requestDto.getTotal_amount()));
        params.add("tax_free_amount", String.valueOf(requestDto.getTax_free_amount()));

        // ✅ 콜백 URL(컨트롤러 prefix와 반드시 일치): /api/kakaopay/...
        params.add("approval_url", callbackBase + "/success/" + partnerOrderId);
        params.add("cancel_url",   callbackBase + "/cancel");
        params.add("fail_url",     callbackBase + "/fail");
        return params;
    }

    private MultiValueMap<String, String> buildApproveParams(String partnerOrderId, String pgToken,
                                                             String tid, String partnerUserId) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("cid", kakaoPayProperties.getCid());
        params.add("tid", tid);
        params.add("partner_order_id", partnerOrderId);
        params.add("partner_user_id", partnerUserId);
        params.add("pg_token", pgToken);
        return params;
    }
}
