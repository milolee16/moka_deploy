package com.moca.app.rental.repository;

import com.moca.app.rental.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // ====== 단건/목록 조회 파생 메서드 ======
    List<Reservation> findByUserId(String userId);
    List<Reservation> findByUserIdAndStatus(String userId, String status);
    List<Reservation> findByCarId(Long carId);
    List<Reservation> findByLocationName(String locationName);
    List<Reservation> findByStatus(String status);
    List<Reservation> findByDate(LocalDate date);
    List<Reservation> findByDateAndStatusIn(LocalDate date, List<String> statuses);

    // 범위 조회 - 파생 메서드(포함 범위)
    List<Reservation> findByDateBetween(LocalDate startDate, LocalDate endDate);

    // 범위 조회 - JPQL (서비스 폴백/호환용)
    @Query("SELECT r FROM Reservation r WHERE r.date BETWEEN :startDate AND :endDate")
    List<Reservation> findByDateRange(@Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate);

    // ====== 성능 최적화된 카운트 쿼리 ======
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.date BETWEEN :startDate AND :endDate")
    Long countByDateRange(@Param("startDate") LocalDate startDate,
                          @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.date = :date")
    Long countByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.status = :status")
    Long countByStatus(@Param("status") String status);

    // ====== 통계/집계 쿼리 ======

    // 예약 상태별 집계
    @Query("SELECT r.status, COUNT(r) FROM Reservation r GROUP BY r.status")
    List<Object[]> getReservationStatusStats();

    // 차량 타입별 예약 집계 (Reservation.carId -> Car.id 조인)
    @Query("""
           SELECT c.vehicleTypeCode, COUNT(r)
           FROM Reservation r
           JOIN Car c ON c.id = r.carId
           GROUP BY c.vehicleTypeCode
           """)
    List<Object[]> getReservationsByVehicleType();

    // 지역별 예약 집계
    // Location 엔티티에 locationName(고유) & locationRegion(지역) 필드가 있다고 가정
    @Query("""
           SELECT l.locationRegion, COUNT(r)
           FROM Reservation r
           JOIN Location l ON l.locationName = r.locationName
           GROUP BY l.locationRegion
           """)
    List<Object[]> getReservationsByRegion();

    // 매출 합계 (Reservation.totalAmount 존재 가정)
    @Query("""
           SELECT COALESCE(SUM(r.totalAmount), 0)
           FROM Reservation r
           WHERE r.date BETWEEN :startDate AND :endDate
           """)
    Integer getTotalRevenueByDateRange(@Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    // (선택) 월별 매출 통계 — 필요 시에만 사용.
    // Oracle이라면 JPQL보다 네이티브가 안전합니다. 주석 풀고 쓰세요.
    /*
    @Query(
        value = """
            SELECT
              TO_CHAR(r.date, 'YYYY') AS year,
              TO_CHAR(r.date, 'MM')   AS month,
              COALESCE(SUM(r.total_amount), 0) AS revenue
            FROM reservation r
            WHERE r.date >= :startDate
            GROUP BY TO_CHAR(r.date, 'YYYY'), TO_CHAR(r.date, 'MM')
            ORDER BY year DESC, month DESC
        """,
        nativeQuery = true
    )
    List<Object[]> getMonthlyRevenue(@Param("startDate") LocalDate startDate);
    */
}
