package com.moca.app.rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.moca.app.rental.*;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(String userId); // String 타입으로 변경
    List<Reservation> findByCarId(Long carId);
    List<Reservation> findByLocationName(String locationName); // locationName으로 변경
    List<Reservation> findByStatus(String status);
    List<Reservation> findByDate(LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE r.date BETWEEN :startDate AND :endDate")
    List<Reservation> findByDateRange(LocalDate startDate, LocalDate endDate);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.status = :status")
    Long countByStatus(String status);

    @Query("SELECT r.status, COUNT(r) FROM Reservation r GROUP BY r.status")
    List<Object[]> getReservationStatusStats();

    // 지역별 통계를 위한 추가 쿼리 - Location 테이블과 조인
    @Query("SELECT l.locationRegion, COUNT(r) FROM Reservation r " +
            "JOIN Location l ON r.locationName = l.locationName " +
            "GROUP BY l.locationRegion")
    List<Object[]> getReservationsByRegion();
}