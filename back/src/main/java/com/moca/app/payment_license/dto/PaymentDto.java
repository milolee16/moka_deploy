package com.moca.app.payment_license.dto;

import lombok.Data;

@Data
public class PaymentDto {
    private Long paymentId;
    private String cardNumber;
    private String cardCompany;
    private String cardExpirationDate;
    private boolean isDefault;
    private String cvc;
}