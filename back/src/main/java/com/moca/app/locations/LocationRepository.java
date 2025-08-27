package com.moca.app.locations;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LocationRepository extends JpaRepository<Location, String> {
    List<Location> findByStars(int stars);
}
