package com.moca.app.rental.service;

import com.moca.app.rental.dto.CarDto;
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
import java.time.LocalDateTime;
import java.time.Duration;
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

            long count;
            try {
                // 최적화된 카운트 쿼리 사용 (있으면)
                count = reservationRepository.countByDateRange(startDate, endDate);
            } catch (Exception ex) {
                // 폴백: 목록 조회 후 사이즈
                count = reservationRepository.findByDateBetween(startDate, endDate).size();
            }

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
        List<Long> revenues = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();

            long monthlyRevenue = 0L;

            // 1) 레포지토리에서 총액 쿼리 지원 시 최우선 사용
            try {
                Integer queried = reservationRepository.getTotalRevenueByDateRange(startDate, endDate);
                if (queried != null) {
                    monthlyRevenue = queried.longValue();
                } else {
                    // 2) 폴백: 실제 예약을 순회하며 금액 계산(HEAD 로직)
                    monthlyRevenue = calcRevenueByIteratingReservations(startDate, endDate);
                }
            } catch (Exception ex) {
                // 3) 예외 시에도 안전한 폴백
                try {
                    monthlyRevenue = calcRevenueByIteratingReservations(startDate, endDate);
                } catch (Exception inner) {
                    monthlyRevenue = 0L; // 최종 폴백
                }
            }

            months.add(yearMonth.toString());
            revenues.add(monthlyRevenue);
        }

        result.put("months", months);
        result.put("revenues", revenues);
        return result;
    }

    /** HEAD 로직을 보존한 폴백 계산 */
    private long calcRevenueByIteratingReservations(LocalDate startDate, LocalDate endDate) {
        List<Reservation> reservations = reservationRepository.findByDateBetween(startDate, endDate);
        long monthlyRevenue = 0L;

        for (Reservation reservation : reservations) {
            if (reservation.getReturnDate() != null && reservation.getReturnTime() != null) {
                LocalDateTime rentalStart = LocalDateTime.of(reservation.getDate(), reservation.getTime());
                LocalDateTime rentalEnd = LocalDateTime.of(reservation.getReturnDate(), reservation.getReturnTime());

                try {
                    monthlyRevenue += calculateRentalPrice(reservation.getCarId(), rentalStart, rentalEnd);
                } catch (IllegalArgumentException e) {
                    System.err.println("Could not calculate revenue for reservation "
                            + reservation.getId() + ": " + e.getMessage());
                }
            }
        }
        return monthlyRevenue;
    }

    /**
     * @param carId         a car id
     * @param startDateTime rental start time
     * @param endDateTime   rental end time
     * @return total price
     */
    public long calculateRentalPrice(Long carId, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        if (startDateTime == null || endDateTime == null || endDateTime.isBefore(startDateTime)) {
            throw new IllegalArgumentException("Invalid start or end date/time.");
        }

        Integer pricePerTenMinutes = getPricePer10Min(carId);
        if (pricePerTenMinutes == null) {
            throw new IllegalArgumentException("Could not find price for car with id: " + carId);
        }

        Duration duration = Duration.between(startDateTime, endDateTime);
        long totalMinutes = duration.toMinutes();

        if (totalMinutes < 0) return 0;

        long price = (totalMinutes / 10) * pricePerTenMinutes;

        // If there's a partial 10-minute block, charge for the full block
        if (totalMinutes % 10 != 0) {
            price += pricePerTenMinutes;
        }
        return price;
    }

    /**
     * 자동차 ID를 이용해 10분당 렌트 비용을 조회합니다.
     * @param carId 조회할 자동차의 ID
     * @return 10분당 렌트 비용. 정보가 없으면 null을 반환합니다.
     */
    public Integer getPricePer10Min(Long carId) {
        Car car = carRepository.findById(carId).orElse(null);
        return (car != null) ? car.getRentPricePer10min() : null;
    }

    public List<CarDto> getAllCars() {
        return carRepository.findAvailableCars()
                .stream()
                .map(CarDto::new)
                .collect(java.util.stream.Collectors.toList());
    }
}
