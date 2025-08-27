package com.moca.app.rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.moca.app.rental.*;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(String userId);
    List<Reservation> findByCarId(Long carId);
    List<Reservation> findByLocationName(String locationName);
    List<Reservation> findByStatus(String status);
    List<Reservation> findByDate(LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE r.date BETWEEN :startDate AND :endDate")
    List<Reservation> findByDateRange(LocalDate startDate, LocalDate endDate);

    // ========== 성능 최적화된 카운트 쿼리들 ==========

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.date BETWEEN :startDate AND :endDate")
    Long countByDateRange(LocalDate startDate, LocalDate endDate);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.date = :date")
    Long countByDate(LocalDate date);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.status = :status")
    Long countByStatus(String status);

    // ========== 통계용 집계 쿼리들 ==========

    @Query("SELECT r.status, COUNT(r) FROM Reservation r GROUP BY r.status")
    List<Object[]> getReservationStatusStats();

    // 차량 타입별 예약 통계 - 조인 쿼리로 한번에 집계
    @Query("SELECT c.vehicleTypeCode, COUNT(r) FROM Reservation r " +
            "JOIN Car c ON r.carId = c.id " +
            "GROUP BY c.vehicleTypeCode")
    List<Object[]> getReservationsByVehicleType();

    // 지역별 통계를 위한 Location 테이블과의 조인
    @Query("SELECT l.locationRegion, COUNT(r) FROM Reservation r " +
            "JOIN Location l ON r.locationName = l.locationName " +
            "GROUP BY l.locationRegion")
    List<Object[]> getReservationsByRegion();

    // 매출 집계 쿼리 (TOTAL_AMOUNT 필드가 있는 경우)
    @Query("SELECT COALESCE(SUM(r.totalAmount), 0) FROM Reservation r " +
            "WHERE r.date BETWEEN :startDate AND :endDate")
    Integer getTotalRevenueByDateRange(LocalDate startDate, LocalDate endDate);

    // 월별 매출 통계
    @Query("SELECT EXTRACT(YEAR FROM r.date) as year, EXTRACT(MONTH FROM r.date) as month, " +
            "COALESCE(SUM(r.totalAmount), 0) as revenue FROM Reservation r " +
            "WHERE r.date >= :startDate " +
            "GROUP BY EXTRACT(YEAR FROM r.date), EXTRACT(MONTH FROM r.date) " +
            "ORDER BY year DESC, month DESC")
    List<Object[]> getMonthlyRevenue(LocalDate startDate);
}