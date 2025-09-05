package com.moca.app.rental.repository;

import com.moca.app.rental.License;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LicenseRepository extends JpaRepository<License, Long> {
    Optional<License> findByUserId(String userId);

    @Query("SELECT l.approved, COUNT(l) FROM License l GROUP BY l.approved")
    List<Object[]> getLicenseApprovalStats();
}
