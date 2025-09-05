package com.moca.app.rental;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "RESERVATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "USER_ID", length = 50, nullable = false) // AppUser의 userId와 연결 (String)
    private String userId;

    @Column(name = "CAR_ID", nullable = false)
    private Long carId;

    @Column(name = "LOCATION_NAME", length = 100, nullable = false) // Location의 locationName과 연결
    private String locationName;

    @Column(name = "RENTAL_DATE", nullable = false)
    private LocalDate date;

    @Column(name = "RENTAL_TIME", nullable = false)
    private LocalTime time;

    @Column(name = "RETURN_DATE")
    private LocalDate returnDate;

    @Column(name = "RETURN_TIME")
    private LocalTime returnTime;

    @Column(name = "PASSENGER_COUNT")
    private Integer passengerCount;

    @Column(name = "MEMO", columnDefinition = "CLOB")
    private String memo;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status; // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "TOTAL_AMOUNT")
    private Integer totalAmount;

    // 연관관계 매핑 (기존 엔티티 활용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CAR_ID", insertable = false, updatable = false)
    private Car car;

    /* =========================
       계산 필드 (@Transient)
       ========================= */

    /** RENTAL_DATE + RENTAL_TIME 을 합친 값 (DB 컬럼 없음) */
    @Transient
    public LocalDateTime getRentalAt() {
        return (date != null && time != null) ? LocalDateTime.of(date, time) : null;
    }

    /** RETURN_DATE + RETURN_TIME 을 합친 값 (DB 컬럼 없음) */
    @Transient
    public LocalDateTime getReturnAt() {
        return (returnDate != null && returnTime != null) ? LocalDateTime.of(returnDate, returnTime) : null;
    }

    /** 표시용: "yyyy-MM-dd HH:mm:ss" */
    @Transient
    public String getRentalAtString() {
        LocalDateTime dt = getRentalAt();
        return dt != null ? dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : null;
    }

    /** 표시용: "yyyy-MM-dd HH:mm:ss" */
    @Transient
    public String getReturnAtString() {
        LocalDateTime dt = getReturnAt();
        return dt != null ? dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : null;
    }
}
