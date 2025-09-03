package com.moca.app.rental.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.moca.app.rental.Reservation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 클라이언트로 내려주는 예약 응답 DTO
 * - 분리 저장된 date/time를 합쳐 rentalAt / returnAt 으로 제공
 * - 프론트는 rentalAt, returnAt만 써도 완전한 "yyyy-MM-dd HH:mm:ss"를 받음
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponseDto {

    private Long id;
    private String userId;
    private Long carId;
    private String locationName;

    // 원본 분리 필드(원하면 프론트에서 쓸 수 있도록 그대로도 내려줌)
    private LocalDate rentalDate;
    private LocalTime rentalTime;
    private LocalDate returnDate;
    private LocalTime returnTime;

    // 합쳐진 필드 (표시/정렬 편의용)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime rentalAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime returnAt;

    private Integer passengerCount;
    private String memo;
    private String status;
    private Integer totalAmount;

    public static ReservationResponseDto from(Reservation r) {
        return ReservationResponseDto.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .carId(r.getCarId())
                .locationName(r.getLocationName())
                .rentalDate(r.getDate())
                .rentalTime(r.getTime())
                .returnDate(r.getReturnDate())
                .returnTime(r.getReturnTime())
                .rentalAt(r.getRentalAt())     // @Transient 계산 필드 활용
                .returnAt(r.getReturnAt())     // @Transient 계산 필드 활용
                .passengerCount(r.getPassengerCount())
                .memo(r.getMemo())
                .status(r.getStatus())
                .totalAmount(r.getTotalAmount())
                .build();
    }
}
