package com.moca.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Date;

/**
 * 카카오페이 API가 최종 승인 후 응답하는 데이터
 */
@Data
public class KakaoPayApproveResponse {

    private String aid; // 요청 고유 번호
    private String tid; // 결제 고유 번호
    private String cid; // 가맹점 코드
    private String sid; // 정기결제용 ID

    @JsonProperty("partner_order_id")
    private String partnerOrderId;

    @JsonProperty("partner_user_id")
    private String partnerUserId;

    @JsonProperty("payment_method_type")
    private String paymentMethodType; // 결제 수단 (CARD, MONEY)

    @JsonProperty("item_name")
    private String itemName;

    private Integer quantity;

    @JsonProperty("approved_at")
    private Date approvedAt;

    private Amount amount; // 중첩된 JSON 객체를 위한 클래스

    @Data
    public static class Amount {
        private Integer total; // 전체 결제 금액
        @JsonProperty("tax_free")
        private Integer taxFree; // 비과세 금액
        private Integer vat; // 부가세 금액
        private Integer point; // 사용한 포인트 금액
        private Integer discount; // 할인 금액
    }
}
