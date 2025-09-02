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
    
    // 차량 상태별 통계를 한번에 가져오는 최적화된 쿼리
    @Query("SELECT c.status, COUNT(c) FROM Car c GROUP BY c.status")
    List<Object[]> getCarStatusStats();
}
