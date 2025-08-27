package com.moca.app.controller;

import com.moca.app.dto.KakaoPayReadyRequest;
import com.moca.app.dto.KakaoPayReadyResponse;
import com.moca.app.service.KakaoPayService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Controller
@RequestMapping("/kakaopay") // ✅ Service의 URL들과 맞춰 통일!
@RequiredArgsConstructor
@Slf4j
public class KakaoPayController {

    private final KakaoPayService kakaoPayService;

    // ✅ 프론트 주소를 하드코딩 말고 환경변수/설정으로
    @Value("${app.frontend-origin:http://localhost:3000}")
    private String frontendOrigin;

    // ✅ 프론트 결과 경로를 한 군데서 바꿀 수 있게 상수로
    private static final String RESULT_BASE = "/payment-result"; // 프론트 라우터가 /payment-result/:status 기준

    @PostMapping("/ready")
    @ResponseBody
    public KakaoPayReadyResponse readyToPay(@RequestBody KakaoPayReadyRequest requestDto) {
        KakaoPayReadyResponse response = kakaoPayService.ready(requestDto);
        log.info("Payment Ready. Redirect URL: {}", response.getNextRedirectPcUrl());
        return response;
    }

    @GetMapping("/success/{partnerOrderId}")
    public void paymentSuccess(@PathVariable String partnerOrderId,
                               @RequestParam("pg_token") String pgToken,
                               HttpServletResponse res) throws IOException {
        try {
            log.info("Payment Success. OrderID: {}, pg_token: {}", partnerOrderId, pgToken);
            kakaoPayService.approve(partnerOrderId, pgToken);
            topRedirect(res, frontendOrigin + RESULT_BASE + "/success"); // ✅ iframe 탈출
        } catch (Exception e) {
            log.error("Payment approval failed for OrderID: {}", partnerOrderId, e);
            topRedirect(res, frontendOrigin + RESULT_BASE + "/fail");
        }
    }

    @GetMapping("/cancel")
    public void paymentCancel(HttpServletResponse res) throws IOException {
        log.warn("Payment Canceled.");
        topRedirect(res, frontendOrigin + RESULT_BASE + "/cancel"); // ✅ IP/도메인 하드코딩 제거
    }

    @GetMapping("/fail")
    public void paymentFail(HttpServletResponse res) throws IOException {
        log.error("Payment Failed.");
        topRedirect(res, frontendOrigin + RESULT_BASE + "/fail");
    }

    /** iframe으로 들어와도 부모(top)로 이동시키는 안전한 리디렉트 */
    private void topRedirect(HttpServletResponse res, String target) throws IOException {
        res.setContentType("text/html; charset=UTF-8");
        String html = "<!doctype html><html><head><meta charset='utf-8'></head><body>" +
                "<script>if(window.top!==window.self){window.top.location.replace('" + target +
                "');}else{window.location.replace('" + target + "');}</script></body></html>";
        res.getWriter().write(html);
    }
}
