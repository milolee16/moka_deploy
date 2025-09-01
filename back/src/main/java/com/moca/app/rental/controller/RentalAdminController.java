package com.moca.app.rental.controller;

import com.moca.app.rental.dto.CarDto;
import com.moca.app.rental.service.RentalAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/rental/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RentalAdminController {

    private final RentalAdminService rentalAdminService;

    /**
     * 대시보드 통계 데이터
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = rentalAdminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 월별 예약 통계
     */
    @GetMapping("/stats/monthly-reservations")
    public ResponseEntity<Map<String, Object>> getMonthlyReservationStats() {
        Map<String, Object> stats = rentalAdminService.getMonthlyReservationStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 차량 타입별 예약 통계
     */
    @GetMapping("/stats/vehicle-types")
    public ResponseEntity<Map<String, Long>> getVehicleTypeStats() {
        Map<String, Long> stats = rentalAdminService.getVehicleTypeStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 지역별 예약 통계
     */
    @GetMapping("/stats/regions")
    public ResponseEntity<Map<String, Long>> getRegionStats() {
        Map<String, Long> stats = rentalAdminService.getRegionStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 일별 예약 현황 (최근 30일)
     */
    @GetMapping("/stats/daily-reservations")
    public ResponseEntity<Map<String, Object>> getDailyReservationStats() {
        Map<String, Object> stats = rentalAdminService.getDailyReservationStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 매출 통계
     */
    @GetMapping("/stats/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueStats() {
        Map<String, Object> stats = rentalAdminService.getRevenueStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 전체 통계 요약 (대시보드용)
     */
    @GetMapping("/stats/summary")
    public ResponseEntity<Map<String, Object>> getAllStats() {
        Map<String, Object> allStats = Map.of(
                "dashboard", rentalAdminService.getDashboardStats(),
                "monthlyReservations", rentalAdminService.getMonthlyReservationStats(),
                "vehicleTypes", rentalAdminService.getVehicleTypeStats(),
                "regions", rentalAdminService.getRegionStats(),
                "dailyReservations", rentalAdminService.getDailyReservationStats(),
                "revenue", rentalAdminService.getRevenueStats()
        );
        return ResponseEntity.ok(allStats);
    }

    @GetMapping("/cars")
    public ResponseEntity<java.util.List<CarDto>> getAllCars() {
        return ResponseEntity.ok(rentalAdminService.getAllCars());
    }
}