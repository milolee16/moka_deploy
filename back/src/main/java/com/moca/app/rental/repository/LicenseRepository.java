package com.moca.app.rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.moca.app.rental.*;
import java.util.List;

@Repository
public interface LicenseRepository extends JpaRepository<License, Long> {
    List<License> findByUserId(String userId);
    List<License> findByApproved(Boolean approved);

    // 면허증 승인 통계를 한번에 가져오는 최적화된 쿼리
    @Query("SELECT l.approved, COUNT(l) FROM License l GROUP BY l.approved")
    List<Object[]> getLicenseApprovalStats();
}

