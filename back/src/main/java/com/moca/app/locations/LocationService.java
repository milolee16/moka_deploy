package com.moca.app.locations;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationService {

    private final LocationRepository locationRepository;

    public List<LocationDto> findByStars(int stars) {
        return locationRepository.findByStars(stars).stream()
                .map(LocationDto::from)
                .collect(Collectors.toList());
    }

    public List<LocationDto> findAll() {
        return locationRepository.findAll().stream()
                .map(LocationDto::from)
                .collect(Collectors.toList());
    }
}
