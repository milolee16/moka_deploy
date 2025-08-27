package com.moca.app.rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.moca.app.rental.*;
import java.util.List;

@Repository
public interface LicenseRepository extends JpaRepository<License, Long> {
    List<License> findByUserId(String userId); // String 타입으로 변경
    List<License> findByApproved(Boolean approved);
}
