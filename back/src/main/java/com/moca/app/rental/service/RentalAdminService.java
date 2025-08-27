package com.moca.app.rental.service;

import com.moca.app.rental.repository.*;
import com.moca.app.rental.Reservation;
import com.moca.app.rental.Car;
import com.moca.app.rental.License;
import com.moca.app.login.AppUserRepository;
import com.moca.app.locations.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RentalAdminService {

    private final ReservationRepository reservationRepository;
    private final CarRepository carRepository;
    private final AppUserRepository appUserRepository;
    private final LicenseRepository licenseRepository;
    private final LocationRepository locationRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    /**
     * 대시보드 기본 통계 (가장 자주 사용되므로 캐싱)
     */
    @Cacheable(value = "dashboardStats", unless = "#result == null")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // 기본 카운트 (가장 빠른 쿼리들)
        stats.put("totalReservations", reservationRepository.count());
        stats.put("totalCars", carRepository.count());
        stats.put("totalUsers", appUserRepository.count());
        stats.put("totalLocations", locationRepository.count());

        // 상태별 통계 (최적화된 쿼리 사용)
        stats.put("reservationStatusStats", getReservationStatusStatsOptimized());
        stats.put("carStatusStats", getCarStatusStatsOptimized());
        stats.put("licenseStats", getLicenseStatsOptimized());

        return stats;
    }

    /**
     * 최적화된 예약 상태별 통계
     */
    private Map<String, Long> getReservationStatusStatsOptimized() {
        try {
            List<Object[]> results = reservationRepository.getReservationStatusStats();
            Map<String, Long> stats = new HashMap<>();
            for (Object[] result : results) {
                stats.put((String) result[0], (Long) result[1]);
            }
            return stats;
        } catch (Exception e) {
            // 쿼리 실패시 빈 맵 반환
            return new HashMap<>();
        }
    }

    /**
     * 최적화된 차량 상태별 통계
     */
    private Map<String, Long> getCarStatusStatsOptimized() {
        Map<String, Long> stats = new HashMap<>();
        try {
            // 한번의 쿼리로 모든 차량 상태 집계
            List<Object[]> results = carRepository.getCarStatusStats();
            for (Object[] result : results) {
                stats.put((String) result[0], (Long) result[1]);
            }

            // 기본값 설정 (데이터가 없는 상태)
            stats.putIfAbsent("AVAILABLE", 0L);
            stats.putIfAbsent("RENTED", 0L);
            stats.putIfAbsent("MAINTENANCE", 0L);

        } catch (Exception e) {
            stats.put("AVAILABLE", 0L);
            stats.put("RENTED", 0L);
            stats.put("MAINTENANCE", 0L);
        }
        return stats;
    }

    /**
     * 최적화된 면허증 통계
     */
    private Map<String, Long> getLicenseStatsOptimized() {
        Map<String, Long> stats = new HashMap<>();
        try {
            List<Object[]> results = licenseRepository.getLicenseApprovalStats();
            for (Object[] result : results) {
                Boolean approved = (Boolean) result[0];
                Long count = (Long) result[1];
                stats.put(approved ? "approved" : "pending", count);
            }

            stats.putIfAbsent("approved", 0L);
            stats.putIfAbsent("pending", 0L);

        } catch (Exception e) {
            stats.put("approved", 0L);
            stats.put("pending", 0L);
        }
        return stats;
    }

    /**
     * 월별 예약 통계 (캐싱 적용)
     */
    @Cacheable(value = "monthlyStats", unless = "#result == null")
    public Map<String, Object> getMonthlyReservationStats() {
        Map<String, Object> result = new HashMap<>();
        List<String> months = new ArrayList<>();
        List<Long> counts = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();

            // 최적화된 카운트 쿼리 사용
            long count = reservationRepository.countByDateRange(startDate, endDate);

            months.add(yearMonth.toString());
            counts.add(count);
        }

        result.put("months", months);
        result.put("counts", counts);
        return result;
    }

    /**
     * 차량 타입별 예약 통계 (캐싱 적용)
     */
    @Cacheable(value = "vehicleTypeStats", unless = "#result == null")
    public Map<String, Long> getVehicleTypeStats() {
        Map<String, Long> stats = new HashMap<>();

        try {
            // 한번의 조인 쿼리로 차량 타입별 예약 수 집계
            List<Object[]> results = reservationRepository.getReservationsByVehicleType();
            for (Object[] result : results) {
                String vehicleType = (String) result[0];
                Long count = (Long) result[1];
                stats.put(vehicleType, count);
            }

            // 기본 차량 타입들이 없다면 0으로 설정
            List<String> defaultTypes = Arrays.asList("COMPACT", "MIDSIZE", "FULLSIZE", "SUV", "VAN");
            for (String type : defaultTypes) {
                stats.putIfAbsent(type, 0L);
            }

        } catch (Exception e) {
            // 실패시 기본값
            Arrays.asList("COMPACT", "MIDSIZE", "FULLSIZE", "SUV", "VAN")
                    .forEach(type -> stats.put(type, 0L));
        }

        return stats;
    }

    /**
     * 지역별 예약 통계 (캐싱 적용)
     */
    @Cacheable(value = "regionStats", unless = "#result == null")
    public Map<String, Long> getRegionStats() {
        Map<String, Long> stats = new HashMap<>();

        try {
            // 최적화된 조인 쿼리
            List<Object[]> regionStats = reservationRepository.getReservationsByRegion();
            for (Object[] stat : regionStats) {
                String region = (String) stat[0];
                Long count = (Long) stat[1];
                stats.put(region, count);
            }
        } catch (Exception e) {
            // 조인 실패시 빈 통계 반환
            System.err.println("Region stats error: " + e.getMessage());
        }

        return stats;
    }

    /**
     * 일별 예약 현황 (최근 7일만, 캐싱)
     */
    @Cacheable(value = "dailyStats", unless = "#result == null")
    public Map<String, Object> getDailyReservationStats() {
        Map<String, Object> result = new HashMap<>();
        List<String> dates = new ArrayList<>();
        List<Long> counts = new ArrayList<>();

        // 30일 -> 7일로 단축하여 성능 개선
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);

            // 최적화된 카운트 쿼리
            long count = reservationRepository.countByDate(date);

            dates.add(date.toString());
            counts.add(count);
        }

        result.put("dates", dates);
        result.put("counts", counts);
        return result;
    }

    /**
     * 매출 통계 (캐싱 적용)
     */
    @Cacheable(value = "revenueStats", unless = "#result == null")
    public Map<String, Object> getRevenueStats() {
        Map<String, Object> result = new HashMap<>();
        List<String> months = new ArrayList<>();
        List<Integer> revenues = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();

            // 실제 매출 합계를 위한 최적화된 쿼리 (만약 TOTAL_AMOUNT 필드가 있다면)
            Integer revenue;
            try {
                revenue = reservationRepository.getTotalRevenueByDateRange(startDate, endDate);
                if (revenue == null) {
                    // TOTAL_AMOUNT가 없다면 예약 건수 * 평균 금액으로 계산
                    long count = reservationRepository.countByDateRange(startDate, endDate);
                    revenue = (int) (count * 150000);
                }
            } catch (Exception e) {
                revenue = 0;
            }

            months.add(yearMonth.toString());
            revenues.add(revenue);
        }

        result.put("months", months);
        result.put("revenues", revenues);
        return result;
    }
}