package com.moca.app.rental.service;

import com.moca.app.rental.dto.CarDto;
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

            long count = reservationRepository.findByDateBetween(startDate, endDate).size();

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
        List<Long> revenues = new ArrayList<>(); // Use Long for potentially large revenues

        for (int i = 5; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();

            List<Reservation> reservations = reservationRepository.findByDateBetween(startDate, endDate);

            long monthlyRevenue = 0;
            for (Reservation reservation : reservations) {
                // A completed reservation should have a return date and time
                if (reservation.getReturnDate() != null && reservation.getReturnTime() != null) {
                    LocalDateTime rentalStart = LocalDateTime.of(reservation.getDate(), reservation.getTime());
                    LocalDateTime rentalEnd = LocalDateTime.of(reservation.getReturnDate(), reservation.getReturnTime());

                    // Calculate revenue for each reservation and add to monthly total
                    try {
                        monthlyRevenue += calculateRentalPrice(reservation.getCarId(), rentalStart, rentalEnd);
                    } catch (IllegalArgumentException e) {
                        // Log the error or handle cases where price cannot be calculated
                        System.err.println("Could not calculate revenue for reservation " + reservation.getId() + ": " + e.getMessage());
                    }
                }
            }

            months.add(yearMonth.toString());
            revenues.add(monthlyRevenue);
        }

        result.put("months", months);
        result.put("revenues", revenues);
        return result;
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
        // ID로 자동차 정보를 찾습니다.
        Car car = carRepository.findById(carId).orElse(null);

        if (car != null) {
            // Car 객체에서 10분당 가격 정보를 반환합니다.
            return car.getRentPricePer10min();
        } else {
            // 해당 ID의 자동차가 없을 경우
            return null;
        }
    }

    public java.util.List<CarDto> getAllCars() {
        return carRepository.findAvailableCars().stream().map(CarDto::new).collect(java.util.stream.Collectors.toList());
    }
}
