package com.moca.app.locations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationDto {
    private String name;
    private String address;
    private String region;
    private String mapUrl;
    private int stars;
    private double lat;
    private double lng;

    public static LocationDto from(Location location) {
        return LocationDto.builder()
                .name(location.getLocationName())
                .address(location.getLocationAddress())
                .region(location.getLocationRegion())
                .mapUrl(location.getLocationMapUrl())
                .stars(location.getStars())
                .lat(location.getLat())
                .lng(location.getLng())
                .build();
    }
}
