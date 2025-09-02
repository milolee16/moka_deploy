package com.moca.app.locations;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public ResponseEntity<List<LocationDto>> getLocations(@RequestParam(required = false) Integer stars) {
        if (stars != null) {
            return ResponseEntity.ok(locationService.findByStars(stars));
        }
        return ResponseEntity.ok(locationService.findAll());
    }
}
