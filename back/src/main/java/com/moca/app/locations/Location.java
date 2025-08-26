package com.moca.app.locations;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "LOCATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    @Id
    @Column(name = "location_name")
    private String locationName;

    @Column(name = "location_address")
    private String locationAddress;

    @Column(name = "location_region")
    private String locationRegion;

    @Column(name = "location_map_url")
    private String locationMapUrl;

    @Column(name = "stars")
    private int stars;

    @Column(name = "lat")
    private double lat;

    @Column(name = "lng")
    private double lng;
}
