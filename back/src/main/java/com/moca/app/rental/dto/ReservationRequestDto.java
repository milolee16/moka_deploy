package com.moca.app.rental.dto;

import lombok.Data;

@Data
public class ReservationRequestDto {
    private Long carId;
    private String locationName;
    private String startDate; // ISO 8601 string (e.g., "2025-09-01T09:00:00.000Z")
    private String endDate;   // ISO 8601 string (e.g., "2025-09-01T13:30:00.000Z")
    private Integer passengerCount;
    private String memo;
    private Integer totalAmount;
}
