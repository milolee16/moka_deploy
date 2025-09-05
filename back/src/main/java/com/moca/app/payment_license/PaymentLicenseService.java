package com.moca.app.payment_license;

import com.moca.app.login.AppUser;
import com.moca.app.login.AppUserRepository;
import com.moca.app.payment_license.dto.LicenseDto;
import com.moca.app.payment_license.dto.PaymentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentLicenseService {

    private final PaymentLicenseRepository licenseRepository;
    private final PaymentRepository paymentRepository;
    private final AppUserRepository appUserRepository;

    // Licenses
    public List<LicenseDto> getLicenses(String userId) {
        return licenseRepository.findByUser_UserId(userId).stream()
                .map(this::convertToLicenseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LicenseDto addLicense(String userId, LicenseDto licenseDto) {
        AppUser user = appUserRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Check if a license already exists for this user
        List<License> existingLicenses = licenseRepository.findByUser_UserId(userId);
        License license;
        if (!existingLicenses.isEmpty()) {
            // If it exists, update the first one
            license = existingLicenses.get(0);
        } else {
            // If not, create a new one
            license = new License();
            license.setUser(user);
        }

        updateLicenseFromDto(license, licenseDto);
        return convertToLicenseDto(licenseRepository.save(license));
    }

    @Transactional
    public void deleteLicense(Long licenseId) {
        licenseRepository.deleteById(licenseId);
    }

    // Payments
    public List<PaymentDto> getPayments(String userId) {
        return paymentRepository.findByUser_UserId(userId).stream()
                .map(this::convertToPaymentDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentDto addPayment(String userId, PaymentDto paymentDto) {
        AppUser user = appUserRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Payment payment = new Payment();
        payment.setUser(user);
        updatePaymentFromDto(payment, paymentDto);
        return convertToPaymentDto(paymentRepository.save(payment));
    }

    @Transactional
    public void deletePayment(Long paymentId) {
        paymentRepository.deleteById(paymentId);
    }

    // Helper methods
    private LicenseDto convertToLicenseDto(License license) {
        LicenseDto dto = new LicenseDto();
        dto.setLicenseId(license.getLicenseId());
        dto.setName(license.getName());
        dto.setLicenseNumber(license.getLicenseNumber());
        dto.setResidentRegistrationNumber(license.getResidentRegistrationNumber());
        dto.setIssueDate(license.getIssueDate());
        dto.setRenewalStartDate(license.getRenewalStartDate());
        dto.setRenewalEndDate(license.getRenewalEndDate());
        return dto;
    }

    private void updateLicenseFromDto(License license, LicenseDto dto) {
        license.setName(dto.getName());
        license.setLicenseNumber(dto.getLicenseNumber());
        license.setResidentRegistrationNumber(dto.getResidentRegistrationNumber());
        license.setIssueDate(dto.getIssueDate());
        license.setRenewalStartDate(dto.getRenewalStartDate());
        license.setRenewalEndDate(dto.getRenewalEndDate());
    }

    private PaymentDto convertToPaymentDto(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.setPaymentId(payment.getPaymentId());
        dto.setCardNumber(payment.getCardNumber()); // Mask this in a real app
        dto.setCardCompany(payment.getCardCompany());
        dto.setCardExpirationDate(payment.getCardExpirationDate());
        dto.setDefault(payment.isDefault());
        // CVC는 보통 응답에 포함하지 않지만, 여기서는 편의상 추가합니다.
        // 실제 애플리케이션에서는 보안상 이유로 제외해야 합니다.
        dto.setCvc(payment.getCvc()); 
        return dto;
    }

    private void updatePaymentFromDto(Payment payment, PaymentDto dto) {
        payment.setCardNumber(dto.getCardNumber());
        payment.setCardCompany(dto.getCardCompany());
        payment.setCardExpirationDate(dto.getCardExpirationDate());
        payment.setDefault(dto.isDefault());
        payment.setCvc(dto.getCvc());
    }
}
