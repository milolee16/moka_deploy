package com.moca.app.rental.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 클라이언트가 보내는 예약 생성 요청 DTO
 * - startDate / endDate: ISO 8601 문자열 (예: "2025-09-01T09:00:00.000Z")
 *   서비스단에서 Instant.parse(...) 후 시스템 타임존으로 변환해 사용
 */
@Data
public class ReservationRequestDto {

    @NotNull(message = "carId는 필수입니다.")
    private Long carId;

    @NotBlank(message = "locationName은 필수입니다.")
    private String locationName;

    @NotNull(message = "startDate는 필수입니다. (ISO 8601, 예: 2025-09-01T09:00:00.000Z)")
    private String startDate;

    @NotNull(message = "endDate는 필수입니다. (ISO 8601, 예: 2025-09-01T13:30:00.000Z)")
    private String endDate;

    private Integer passengerCount;

    @Size(max = 4000, message = "메모는 최대 4000자까지 가능합니다.")
    private String memo;

    @NotNull(message = "totalAmount는 필수입니다.")
    private Integer totalAmount;
}
