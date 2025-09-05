package com.moca.app.rental.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.moca.app.rental.Car;
import com.moca.app.rental.Reservation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponseDto {

    private Long id;
    private String userId;
    private String locationName;

    // 원본 분리 필드(원하면 프론트에서 쓸 수 있도록 그대로도 내려줌)
    private LocalDate rentalDate;
    private LocalTime rentalTime;
    private LocalDate returnDate;
    private LocalTime returnTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime rentalAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime returnAt;

    private Integer passengerCount;
    private String memo;
    private String status;
    private Integer totalAmount;

    // 차량 정보를 포함시키기 위한 내부 DTO
    private CarDto car;

    public static ReservationResponseDto from(Reservation r) {
        // Reservation 엔티티의 car 객체가 지연 로딩(LAZY)으로 설정되어 있으므로,
        // 실제 사용 시점에 초기화되었는지 확인하는 것이 안전합니다.
        Car carEntity = r.getCar();
        CarDto carDto = (carEntity != null)
                ? CarDto.builder().carName(carEntity.getCarName()).id(carEntity.getId()).build()
                : null;

        return ReservationResponseDto.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .locationName(r.getLocationName())
                .rentalDate(r.getDate())
                .rentalTime(r.getTime())
                .returnDate(r.getReturnDate())
                .returnTime(r.getReturnTime())
                .rentalAt(r.getRentalAt())
                .returnAt(r.getReturnAt())
                .passengerCount(r.getPassengerCount())
                .memo(r.getMemo())
                .status(r.getStatus())
                .totalAmount(r.getTotalAmount())
                .car(carDto) // 차량 정보 추가
                .build();
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CarDto {
        private Long id;
        private String carName;
    }
}
