package com.moca.app.rental.repository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.moca.app.rental.*;

// VehicleType Repository
@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicleType, String> {
}
