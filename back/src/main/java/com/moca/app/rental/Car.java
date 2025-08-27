package com.moca.app.rental;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "CAR")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "VEHICLE_TYPE_CODE", length = 20, nullable = false)
    private String vehicleTypeCode;

    @Column(name = "CAR_NUMBER", length = 50, nullable = false)
    private String carNumber;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status; // AVAILABLE, RENTED, MAINTENANCE

    @Column(name = "IMAGE_URL", length = 255)
    private String imageUrl;

    // 연관관계 매핑
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VEHICLE_TYPE_CODE", insertable = false, updatable = false)
    private VehicleType vehicleType;
}