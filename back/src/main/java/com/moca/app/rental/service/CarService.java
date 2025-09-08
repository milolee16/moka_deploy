package com.moca.app.rental.service;

import com.moca.app.rental.Car;
import com.moca.app.rental.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;

    /**
     * 필터링이 적용된 차량 조회
     */
    public List<Car> findCarsWithFilters(String status, String type, String search) {
        if (search != null && !search.trim().isEmpty()) {
            // 검색어가 있는 경우
            List<Car> cars = carRepository.findByCarNameContainingIgnoreCase(search.trim());
            cars.addAll(carRepository.findByCarNumberContainingIgnoreCase(search.trim()));
            return cars.stream().distinct().toList();
        } else if (status != null && type != null) {
            return carRepository.findByStatusAndVehicleTypeCode(status, type);
        } else if (status != null) {
            return carRepository.findByStatus(status);
        } else if (type != null) {
            return carRepository.findByVehicleTypeCode(type);
        } else {
            return carRepository.findAll();
        }
    }

    /**
     * 특정 차량 조회
     */
    public Car findCarById(Long id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 차량을 찾을 수 없습니다: " + id));
    }

    /**
     * 차량 등록
     */
    @Transactional
    public Car createCar(String carName, String carNumber, String vehicleTypeCode,
                         String status, String imageUrl, Integer rentPrice) {

        // 중복 차량번호 검증
        if (carRepository.existsByCarNumber(carNumber)) {
            throw new IllegalArgumentException("이미 등록된 차량번호입니다: " + carNumber);
        }

        // 차량타입 유효성 검증
        if (!isValidVehicleType(vehicleTypeCode)) {
            throw new IllegalArgumentException("유효하지 않은 차량타입입니다: " + vehicleTypeCode);
        }

        // 상태 유효성 검증
        if (status != null && !isValidStatus(status)) {
            throw new IllegalArgumentException("유효하지 않은 상태입니다: " + status);
        }

        Car newCar = Car.builder()
                .carName(carName)
                .carNumber(carNumber)
                .vehicleTypeCode(vehicleTypeCode)
                .status(status != null ? status : "AVAILABLE")
                .imageUrl(imageUrl)
                .rentPricePer10min(rentPrice)
                .build();

        return carRepository.save(newCar);
    }

    /**
     * 차량 정보 수정
     */
    @Transactional
    public Car updateCar(Long id, String carName, String status, Integer rentPrice, String imageUrl) {
        Car car = findCarById(id);

        // 상태 유효성 검증
        if (status != null && !isValidStatus(status)) {
            throw new IllegalArgumentException("유효하지 않은 상태입니다: " + status);
        }

        // 기존 Car 엔티티의 업데이트 메서드를 사용하거나, 새로 빌드
        Car updatedCar = Car.builder()
                .id(car.getId())
                .vehicleTypeCode(car.getVehicleTypeCode())
                .carNumber(car.getCarNumber())
                .carName(carName != null ? carName : car.getCarName())
                .status(status != null ? status : car.getStatus())
                .imageUrl(imageUrl != null ? imageUrl : car.getImageUrl())
                .rentPricePer10min(rentPrice != null ? rentPrice : car.getRentPricePer10min())
                .build();

        return carRepository.save(updatedCar);
    }

    /**
     * 차량 삭제
     */
    @Transactional
    public void deleteCar(Long id) {
        Car car = findCarById(id);

        // 대여중인 차량은 삭제 불가
        if ("RENTED".equals(car.getStatus())) {
            throw new IllegalStateException("대여중인 차량은 삭제할 수 없습니다.");
        }

        carRepository.delete(car);
    }

    /**
     * 차량타입 유효성 검사
     */
    private boolean isValidVehicleType(String type) {
        return List.of("COMPACT", "MIDSIZE", "FULLSIZE", "SUV", "VAN", "EV").contains(type);
    }

    /**
     * 상태 유효성 검사
     */
    private boolean isValidStatus(String status) {
        return List.of("AVAILABLE", "RENTED", "MAINTENANCE").contains(status);
    }
}