package com.moca.app.hotels;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HotelService {

    private final HotelRepository hotelRepository;

    public List<HotelDto> findByStars(int stars) {
        return hotelRepository.findByStars(stars).stream()
                .map(HotelDto::from)
                .collect(Collectors.toList());
    }

    public List<HotelDto> findAll() {
        return hotelRepository.findAll().stream()
                .map(HotelDto::from)
                .collect(Collectors.toList());
    }
}
