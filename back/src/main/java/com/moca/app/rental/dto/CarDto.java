package com.moca.app.rental.dto;

import com.moca.app.rental.Car;
import lombok.Data;

@Data
public class CarDto {

    // Car 엔티티와 1:1 매칭되는 필드
    private Long id;
    private String vehicleTypeCode;
    private String carNumber;
    private String status;              // AVAILABLE, RENTED, MAINTENANCE
    private String imageUrl;
    private String carName;
    private Integer rentPricePer10min;

    public CarDto(Car car) {
        this.id = car.getId();
        this.vehicleTypeCode = car.getVehicleTypeCode();
        this.carNumber = car.getCarNumber();
        this.status = car.getStatus();
        this.imageUrl = car.getImageUrl();
        this.carName = car.getCarName();
        this.rentPricePer10min = car.getRentPricePer10min();
    }
}