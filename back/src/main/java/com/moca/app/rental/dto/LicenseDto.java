package com.moca.app.rental.dto;

import com.moca.app.rental.License;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LicenseDto {
    private Long id;
    private String userId;
    private String licenseNumber;
    private LocalDate licenseExpiry;
    private Boolean approved;

    public static LicenseDto fromEntity(License entity) {
        return LicenseDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .licenseNumber(entity.getLicenseNumber())
                .licenseExpiry(entity.getLicenseExpiry())
                .approved(entity.getApproved())
                .build();
    }
}
