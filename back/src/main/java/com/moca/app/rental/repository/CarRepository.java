package com.moca.app.rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.moca.app.rental.*;
import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {
    List<Car> findByStatus(String status);
    List<Car> findByVehicleTypeCode(String vehicleTypeCode);

    @Query("SELECT c FROM Car c WHERE c.status = 'AVAILABLE'")
    List<Car> findAvailableCars();

    @Query("SELECT c FROM Car c JOIN FETCH c.vehicleType")
    List<Car> findAllWithVehicleType();

    List<Car> findByStatusAndVehicleTypeCode(String status, String vehicleTypeCode);
    boolean existsByCarNumber(String carNumber);
    List<Car> findByCarNameContainingIgnoreCase(String carName);
    List<Car> findByCarNumberContainingIgnoreCase(String carNumber);

    // 관리자용 통계 쿼리들
    @Query("SELECT c.status, COUNT(c) FROM Car c GROUP BY c.status")
    List<Object[]> getCarStatusStats();

    @Query("SELECT c.vehicleTypeCode, COUNT(c) FROM Car c GROUP BY c.vehicleTypeCode")
    List<Object[]> getCarTypeStats();
}
