package com.moca.app.hotels;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<List<HotelDto>> getHotels(@RequestParam(required = false) Integer stars) {
        if (stars != null) {
            return ResponseEntity.ok(hotelService.findByStars(stars));
        }
        return ResponseEntity.ok(hotelService.findAll());
    }
}
