package com.moca.app.service;

import com.moca.app.config.KakaoPayProperties;
import com.moca.app.dto.KakaoPayApproveResponse;
import com.moca.app.dto.KakaoPayReadyRequest;
import com.moca.app.dto.KakaoPayReadyResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    // 동시성 문제를 해결하기 위해 ConcurrentHashMap 사용
    // NOTE: 실제 서비스에서는 서버가 여러 대일 경우를 대비해 Redis나 DB에 저장해야 합니다.
    private final Map<String, PaymentInfo> paymentInfoMap = new ConcurrentHashMap<>();

    /**
     * 결제 승인에 필요한 정보를 임시 저장하는 내부 클래스
     */
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
            KakaoPayReadyResponse response = restTemplate.postForObject(url, requestEntity, KakaoPayReadyResponse.class);

            if (response != null) {
                // 결제 승인 단계에서 사용할 정보를 임시 저장
                PaymentInfo info = new PaymentInfo(response.getTid(), requestDto.getPartner_user_id());
                paymentInfoMap.put(requestDto.getPartner_order_id(), info);
                log.info("KakaoPay Ready Success. OrderID: {}, TID: {}, UserID: {}", requestDto.getPartner_order_id(), info.getTid(), info.getPartnerUserId());
            }
            return response;
        } catch (HttpClientErrorException e) { // 4xx 에러 (클라이언트 오류)
            log.error("KakaoPay Ready API call failed. Status: {}, Response: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("카카오페이 결제 준비에 실패했습니다. API 응답 오류.", e);
        } catch (RestClientException e) { // 그 외 통신 오류
            log.error("KakaoPay Ready API call failed. Error: {}", e.getMessage(), e);
            throw new IllegalStateException("카카오페이 결제 준비에 실패했습니다. API 통신 오류.", e);
        }
    }

    public KakaoPayApproveResponse approve(String partnerOrderId, String pgToken) {
        PaymentInfo info = paymentInfoMap.get(partnerOrderId);
        if (info == null) {
            log.error("Approval Error: No PaymentInfo found for OrderID: {}", partnerOrderId);
            throw new IllegalStateException("결제 요청 정보를 찾을 수 없습니다. (주문번호: " + partnerOrderId + ")");
        }

        String url = kakaoPayProperties.getHost() + "/v1/payment/approve";

        HttpHeaders headers = buildDefaultHeaders();
        MultiValueMap<String, String> params = buildApproveParams(partnerOrderId, pgToken, info.getTid(), info.getPartnerUserId());

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

        try {
            KakaoPayApproveResponse response = restTemplate.postForObject(url, requestEntity, KakaoPayApproveResponse.class);

            if (response != null) {
                paymentInfoMap.remove(partnerOrderId); // 성공 시 임시 데이터 삭제
                log.info("Payment Approved. AID: {}", response.getAid());
                // TODO: 여기서 응답받은 결제 정보를 DB에 저장하고, 주문 상태를 '결제완료'로 업데이트해야 합니다.
            }
            return response;
        } catch (HttpClientErrorException e) { // 4xx 에러
            log.error("KakaoPay Approve API call failed for OrderID: {}. Status: {}, Response: {}", partnerOrderId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("카카오페이 결제 승인에 실패했습니다. API 응답 오류.", e);
        } catch (RestClientException e) { // 그 외 통신 오류
            log.error("KakaoPay Approve API call failed for OrderID: {}. Error: {}", partnerOrderId, e.getMessage(), e);
            throw new IllegalStateException("카카오페이 결제 승인에 실패했습니다. API 통신 오류.", e);
        }
    }

    private HttpHeaders buildDefaultHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String adminKey = kakaoPayProperties.getAdminKey();

        // [중요] 디버깅을 위해 실제 사용되는 어드민 키를 로그로 출력합니다.
        // 이 로그를 통해 yml 파일의 키가 정확히 로드되었는지, 불필요한 공백은 없는지 확인하세요.
        log.info("Using KakaoPay Admin Key: [{}], Length: {}", adminKey, adminKey != null ? adminKey.length() : 0);

        if (adminKey == null || adminKey.trim().isEmpty()) {
            log.error("KakaoPay Admin Key is not configured in application.yml");
            throw new IllegalStateException("KakaoPay Admin Key is missing.");
        }

        headers.add("Authorization", "KakaoAK " + adminKey.trim());
        headers.add("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
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
        params.add("total_amount", String.valueOf(requestDto.getTotal_amount()));
        params.add("tax_free_amount", String.valueOf(requestDto.getTax_free_amount()));
        params.add("total_amount", String.valueOf(requestDto.getTotal_amount()));
        params.add("tax_free_amount", String.valueOf(requestDto.getTax_free_amount()));
        params.add("approval_url", "http://localhost:8080/api/kakaopay/success/" + partnerOrderId);
        params.add("cancel_url", "http://localhost:8080/api/kakaopay/cancel");
        params.add("fail_url", "http://localhost:8080/api/kakaopay/fail");
        return params;
    }

    private MultiValueMap<String, String> buildApproveParams(String partnerOrderId, String pgToken, String tid, String partnerUserId) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("cid", kakaoPayProperties.getCid());
        params.add("tid", tid);
        params.add("partner_order_id", partnerOrderId);
        params.add("partner_user_id", partnerUserId);
        params.add("pg_token", pgToken);
        return params;
    }
}