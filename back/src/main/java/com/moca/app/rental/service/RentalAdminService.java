package com.moca.app.rental.service;

import com.moca.app.rental.repository.*;
import com.moca.app.rental.Reservation; // Reservation 엔티티 import 추가
import com.moca.app.rental.Car; // Car 엔티티 import 추가
import com.moca.app.rental.License; // License 엔티티 import 추가
import com.moca.app.login.AppUserRepository; // 기존 사용자 Repository
import com.moca.app.locations.LocationRepository; // 기존 위치 Repository
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RentalAdminService {

    private final ReservationRepository reservationRepository;
    private final CarRepository carRepository;
    private final AppUserRepository appUserRepository; // 기존 사용자 Repository 사용
    private final LicenseRepository licenseRepository;
    private final LocationRepository locationRepository; // 기존 LocationRepository 사용
    private final VehicleTypeRepository vehicleTypeRepository;

    /**
     * 대시보드 통계 데이터 조회
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // 전체 통계
        stats.put("totalReservations", reservationRepository.count());
        stats.put("totalCars", carRepository.count());
        stats.put("totalUsers", appUserRepository.count()); // 기존 AppUser 테이블 사용

        // Location 개수는 직접 쿼리하거나 LocationRepository가 있다면 사용
        stats.put("totalLocations", getTotalLocations());

        // 예약 상태별 통계
        Map<String, Long> statusStats = new HashMap<>();
        try {
            List<Object[]> reservationStats = reservationRepository.getReservationStatusStats();
            for (Object[] stat : reservationStats) {
                String status = (String) stat[0];
                Long count = (Long) stat[1];
                statusStats.put(status, count);
            }
        } catch (Exception e) {
            System.err.println("Reservation status stats error: " + e.getMessage());
        }
        stats.put("reservationStatusStats", statusStats);

        // 차량 상태별 통계
        Map<String, Long> carStatusStats = new HashMap<>();
        List<Car> availableCars = carRepository.findByStatus("AVAILABLE");
        List<Car> rentedCars = carRepository.findByStatus("RENTED");
        List<Car> maintenanceCars = carRepository.findByStatus("MAINTENANCE");

        carStatusStats.put("AVAILABLE", (long) availableCars.size());
        carStatusStats.put("RENTED", (long) rentedCars.size());
        carStatusStats.put("MAINTENANCE", (long) maintenanceCars.size());
        stats.put("carStatusStats", carStatusStats);

        // 면허증 승인 통계
        Map<String, Long> licenseStats = new HashMap<>();
        List<License> approvedLicenses = licenseRepository.findByApproved(true);
        List<License> pendingLicenses = licenseRepository.findByApproved(false);

        licenseStats.put("approved", (long) approvedLicenses.size());
        licenseStats.put("pending", (long) pendingLicenses.size());
        stats.put("licenseStats", licenseStats);

        return stats;
    }

    // Location 테이블의 총 개수를 구하는 메서드
    private long getTotalLocations() {
        try {
            return locationRepository.count(); // 실제 LocationRepository 사용
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * 월별 예약 통계 (최근 6개월)
     */
    public Map<String, Object> getMonthlyReservationStats() {
        Map<String, Object> result = new HashMap<>();
        List<String> months = new ArrayList<>();
        List<Long> counts = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();

            long count = reservationRepository.findByDateRange(startDate, endDate).size();

            months.add(yearMonth.toString());
            counts.add(count);
        }

        result.put("months", months);
        result.put("counts", counts);
        return result;
    }

    /**
     * 차량 타입별 예약 통계
     */
    public Map<String, Long> getVehicleTypeStats() {
        Map<String, Long> stats = new HashMap<>();
        List<String> vehicleTypes = Arrays.asList("COMPACT", "MIDSIZE", "FULLSIZE", "SUV", "VAN");

        for (String type : vehicleTypes) {
            List<Long> carIds = carRepository.findByVehicleTypeCode(type).stream()
                    .map(car -> car.getId()).toList();

            long count = 0;
            for (Object carId : carIds) {
                count += reservationRepository.findByCarId((Long) carId).size();
            }
            stats.put(type, count);
        }

        return stats;
    }

    /**
     * 지역별 예약 통계 (기존 Location 테이블 활용)
     */
    public Map<String, Long> getRegionStats() {
        Map<String, Long> stats = new HashMap<>();

        // Location 테이블과 조인한 결과를 활용
        List<Object[]> regionStats = reservationRepository.getReservationsByRegion();
        for (Object[] stat : regionStats) {
            String region = (String) stat[0];
            Long count = (Long) stat[1];
            stats.put(region, count);
        }

        return stats;
    }

    /**
     * 일별 예약 현황 (최근 30일)
     */
    public Map<String, Object> getDailyReservationStats() {
        Map<String, Object> result = new HashMap<>();
        List<String> dates = new ArrayList<>();
        List<Long> counts = new ArrayList<>();

        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            long count = reservationRepository.findByDate(date).size();

            dates.add(date.toString());
            counts.add(count);
        }

        result.put("dates", dates);
        result.put("counts", counts);
        return result;
    }

    /**
     * 매출 통계 (월별)
     */
    public Map<String, Object> getRevenueStats() {
        Map<String, Object> result = new HashMap<>();
        List<String> months = new ArrayList<>();
        List<Integer> revenues = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();

            List<Reservation> reservations = reservationRepository.findByDateRange(startDate, endDate);

            // 임시로 예약 건수 * 평균 금액으로 계산
            int revenue = reservations.size() * 150000;

            months.add(yearMonth.toString());
            revenues.add(revenue);
        }

        result.put("months", months);
        result.put("revenues", revenues);
        return result;
    }

    public long calculateRentalPrice(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        if (startDateTime == null || endDateTime == null || endDateTime.isBefore(startDateTime)) {
            throw new IllegalArgumentException("Invalid start or end date/time.");
        }

        Duration duration = Duration.between(startDateTime, endDateTime);
        long totalMinutes = duration.toMinutes();

        // 10분당 50,000원
        long pricePerTenMinutes = 50000;
        long price = (totalMinutes / 10) * pricePerTenMinutes;

        // If there's a partial 10-minute block, charge for the full block
        if (totalMinutes % 10 != 0) {
            price += pricePerTenMinutes;
        }
        return price;
    }
}