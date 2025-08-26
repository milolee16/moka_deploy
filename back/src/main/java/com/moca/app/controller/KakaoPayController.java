package com.moca.app.controller;

import com.moca.app.dto.KakaoPayReadyRequest;
import com.moca.app.dto.KakaoPayReadyResponse;
import com.moca.app.service.KakaoPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller // 페이지 리다이렉트를 위해 @Controller를 사용합니다.
@RequestMapping("/kakaopay")
@RequiredArgsConstructor
@Slf4j
public class KakaoPayController {

    private final KakaoPayService kakaoPayService;

    /**
     * 결제 준비 요청을 처리하고, JSON 데이터를 응답합니다.
     */
    @PostMapping("/ready")
    @ResponseBody // 이 메서드는 페이지 이동 없이 JSON 데이터만 반환하므로 @ResponseBody를 추가합니다.
    public KakaoPayReadyResponse readyToPay(@RequestBody KakaoPayReadyRequest requestDto) {
        KakaoPayReadyResponse response = kakaoPayService.ready(requestDto);
        log.info("Payment Ready. Redirect URL: {}", response.getNextRedirectPcUrl());
        return response;
    }

    /**
     * 결제 성공 시, 카카오페이로부터 리다이렉트되는 요청을 처리합니다.
     */
    @GetMapping("/success/{partnerOrderId}")
    public String paymentSuccess(@PathVariable("partnerOrderId") String partnerOrderId,
                                 @RequestParam("pg_token") String pgToken) {
        try {
            log.info("Payment Success. OrderID: {}, pg_token: {}", partnerOrderId, pgToken);
            kakaoPayService.approve(partnerOrderId, pgToken);
            // 성공 처리 후, 프론트엔드의 결과 페이지로 다시 리다이렉트시킵니다.
            return "redirect:http://localhost:3000/payment/result/success";
        } catch (IllegalStateException | NullPointerException e) {
            log.error("Payment approval failed for OrderID: {}", partnerOrderId, e);
            // 실패 시, 프론트엔드의 실패 페이지로 리다이렉트합니다.
            return "redirect:http://localhost:3000/payment/result/fail";
        }
    }

    /**
     * 결제 취소 시, 카카오페이로부터 리다이렉트되는 요청을 처리합니다.
     */
    @GetMapping("/cancel")
    public String paymentCancel() {
        log.warn("Payment Canceled.");
        return "redirect:http://192.168.2.23:3000/payment/result/cancel";
    }

    /**
     * 결제 실패 시, 카카오페이로부터 리다이렉트되는 요청을 처리합니다.
     */
    @GetMapping("/fail")
    public String paymentFail() {
        log.error("Payment Failed.");
        return "redirect:http://localhost:3000/payment/result/fail";
    }
}