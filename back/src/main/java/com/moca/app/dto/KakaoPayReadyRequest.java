package com.moca.app.dto;

import lombok.Data;

/**
 * 프론트엔드에서 결제 준비를 위해 백엔드로 보내는 데이터
 */
@Data // Lombok: Getter, Setter, toString 등을 자동으로 만들어줍니다.
public class KakaoPayReadyRequest {
    private String partner_order_id;
    private String partner_user_id;
    private String item_name;
    private int quantity;
    private int total_amount;
    private int tax_free_amount;
}