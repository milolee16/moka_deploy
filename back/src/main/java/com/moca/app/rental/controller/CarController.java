package com.moca.app.rental.controller;

import com.moca.app.rental.Car;
import com.moca.app.rental.dto.CarDto;
import com.moca.app.rental.service.CarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    // ======== 공통 API (일반 사용자도 접근 가능) ========

    /** 모든 차량 목록 조회 */
    @GetMapping
    public ResponseEntity<?> getAllCars(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search) {
        try {
            List<Car> cars = carService.findCarsWithFilters(status, type, search);
            List<CarDto> carDtos = cars.stream()
                    .map(CarDto::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(carDtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("차량 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /** 특정 차량 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCarById(@PathVariable Long id) {
        try {
            Car car = carService.findCarById(id);
            return ResponseEntity.ok(new CarDto(car));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ======== 관리자 전용 API ========

    /** 관리자용 - 차량 등록 */
    @PostMapping("/admin")
    public ResponseEntity<?> createCar(@RequestBody Map<String, Object> requestBody) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        try {
            String carName = (String) requestBody.get("carName");
            String carNumber = (String) requestBody.get("carNumber");
            String vehicleTypeCode = (String) requestBody.get("vehicleTypeCode");
            String status = (String) requestBody.get("status");
            String imageUrl = (String) requestBody.get("imageUrl");
            Object priceObj = requestBody.get("rentPricePer10Min");

            // 유효성 검사
            if (carName == null || carName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("차량명이 필요합니다.");
            }
            if (carNumber == null || carNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("차량번호가 필요합니다.");
            }

            Integer rentPrice = parsePrice(priceObj);
            if (rentPrice == null) {
                return ResponseEntity.badRequest().body("유효한 가격을 입력해주세요.");
            }

            Car newCar = carService.createCar(carName.trim(), carNumber.trim(),
                    vehicleTypeCode, status, imageUrl, rentPrice);
            return ResponseEntity.status(HttpStatus.CREATED).body(new CarDto(newCar));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("차량 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /** 관리자용 - 차량 정보 수정 */
    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateCar(@PathVariable Long id, @RequestBody Map<String, Object> requestBody) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        try {
            String carName = (String) requestBody.get("carName");
            String status = (String) requestBody.get("status");
            String imageUrl = (String) requestBody.get("imageUrl");
            Object priceObj = requestBody.get("rentPricePer10Min");

            Integer rentPrice = parsePrice(priceObj);

            Car updatedCar = carService.updateCar(id, carName, status, rentPrice, imageUrl);
            return ResponseEntity.ok(new CarDto(updatedCar));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("차량 정보 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /** 관리자용 - 차량 삭제 */
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        try {
            carService.deleteCar(id);
            return ResponseEntity.ok().body("차량이 성공적으로 삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // ======== Helper Methods ========

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            return auth.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        }
        return false;
    }

    private Integer parsePrice(Object priceObj) {
        if (priceObj == null) return null;

        if (priceObj instanceof Integer) {
            return (Integer) priceObj;
        } else if (priceObj instanceof String) {
            try {
                return Integer.parseInt((String) priceObj);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}