package com.moca.app.payment_license;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentLicenseRepository extends JpaRepository<License, Long> {
    List<License> findByUser_UserId(String userId);
}
