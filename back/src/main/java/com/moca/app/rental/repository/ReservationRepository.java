package com.moca.app.rental.repository;

import com.moca.app.rental.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    @Query("SELECT r.status, COUNT(r) FROM Reservation r GROUP BY r.status")
    List<Object[]> getReservationStatusStats();
    List<Reservation> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<Reservation> findByCarId(Long carId);
    @Query("SELECT r.locationName, COUNT(r) FROM Reservation r GROUP BY r.locationName")
    List<Object[]> getReservationsByRegion();
    List<Reservation> findByDate(LocalDate date);

    List<Reservation> findByUserIdAndStatus(String userId, String status);
    List<Reservation> findByUserId(String userId);
}
