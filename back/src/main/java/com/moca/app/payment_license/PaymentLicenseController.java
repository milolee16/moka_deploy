package com.moca.app.payment_license;

import com.moca.app.payment_license.dto.LicenseDto;
import com.moca.app.payment_license.dto.PaymentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/my-page")
@RequiredArgsConstructor
public class PaymentLicenseController {

    private final PaymentLicenseService paymentLicenseService;

    // Licenses
    @GetMapping("/licenses")
    public ResponseEntity<List<LicenseDto>> getLicenses(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentLicenseService.getLicenses(userDetails.getUsername()));
    }

    @PostMapping("/licenses")
    public ResponseEntity<LicenseDto> addLicense(@AuthenticationPrincipal UserDetails userDetails, @RequestBody LicenseDto licenseDto) {
        return ResponseEntity.ok(paymentLicenseService.addLicense(userDetails.getUsername(), licenseDto));
    }

    @DeleteMapping("/licenses/{licenseId}")
    public ResponseEntity<Void> deleteLicense(@PathVariable Long licenseId) {
        paymentLicenseService.deleteLicense(licenseId);
        return ResponseEntity.ok().build();
    }

    // Payments
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentDto>> getPayments(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentLicenseService.getPayments(userDetails.getUsername()));
    }

    @PostMapping("/payments")
    public ResponseEntity<PaymentDto> addPayment(@AuthenticationPrincipal UserDetails userDetails, @RequestBody PaymentDto paymentDto) {
        return ResponseEntity.ok(paymentLicenseService.addPayment(userDetails.getUsername(), paymentDto));
    }

    @DeleteMapping("/payments/{paymentId}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long paymentId) {
        paymentLicenseService.deletePayment(paymentId);
        return ResponseEntity.ok().build();
    }
}
