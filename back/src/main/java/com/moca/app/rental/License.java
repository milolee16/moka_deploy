package com.moca.app.rental;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "LICENSE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class License {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "USER_ID", length = 50, nullable = false) // AppUser의 userId와 연결 (String)
    private String userId;

    @Column(name = "LICENSE_NUMBER", length = 50, nullable = false)
    private String licenseNumber;

    @Column(name = "LICENSE_EXPIRY", nullable = false)
    private LocalDate licenseExpiry;

    @Column(name = "LICENSE_IMAGE_URL", length = 255)
    private String licenseImageUrl;

    @Column(name = "APPROVED", nullable = false)
    private Boolean approved = false;
}