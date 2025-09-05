package com.moca.app.payment_license.dto;

import lombok.Data;

import java.util.Date;

@Data
public class LicenseDto {
    private Long licenseId;
    private String name;
    private String licenseNumber;
    private String residentRegistrationNumber;
    private Date issueDate;
    private Date renewalStartDate;
    private Date renewalEndDate;
}