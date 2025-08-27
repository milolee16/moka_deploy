package com.moca.app.hotels;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelDto {
    private Long id;
    private String name;
    private int stars;
    private String location;

    private double lat;

    private double lng;

    public static HotelDto from(Hotel hotel) {
        return HotelDto.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .stars(hotel.getStars())
                .location(hotel.getLocation())
                .lat(hotel.getLat())
                .lng(hotel.getLng())
                .build();
    }
}
