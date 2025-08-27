package com.moca.app.rental;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "VEHICLE_TYPE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleType {

    @Id
    @Column(name = "CODE", length = 20)
    private String code;

    @Column(name = "NAME", length = 50, nullable = false)
    private String name;
}