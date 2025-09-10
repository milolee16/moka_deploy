package com.moca.app.rental.controller;

import com.moca.app.rental.Reservation;
import com.moca.app.rental.dto.ReservationRequestDto;
import com.moca.app.rental.dto.ReservationResponseDto;
import com.moca.app.rental.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reservations") // 최종 엔드포인트는 /api 컨텍스트가 붙어 /api/reservations 가 됩니다.
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /** 예약 생성 */
    @PostMapping
    public ResponseEntity<?> createReservation(@Valid @RequestBody ReservationRequestDto requestDto) {
        String userId = extractUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        Reservation created = reservationService.createReservation(requestDto, userId);
        System.out.println("이런 내용이 담겨있다: " + created);

        // 엔티티 -> 응답 DTO 변환
        ReservationResponseDto body = ReservationResponseDto.from(created);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /** 예약된 차량 ID 목록 조회 */
    @GetMapping("/reserved-cars")
    public ResponseEntity<List<Long>> getReservedCarIds(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Long> reservedCarIds = reservationService.getReservedCarIds(date);
        return ResponseEntity.ok(reservedCarIds);
    }

    /** 반납 완료 처리 */
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeReservation(@PathVariable Long id) {
        try {
            Reservation completed = reservationService.completeReservation(id);
            return ResponseEntity.ok(ReservationResponseDto.from(completed));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 ID의 예약을 찾을 수 없습니다: " + id);
        }
    }

    /** 내 예약 목록 조회 (?status=CONFIRMED|COMPLETED|... 또는 ALL/null) */
    @GetMapping("/my-reservations")
    public ResponseEntity<?> getMyReservations(@RequestParam(required = false) String status) {
        String userId = extractUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        List<Reservation> reservations;
        if (status == null || status.isEmpty() || "ALL".equalsIgnoreCase(status)) {
            reservations = reservationService.findReservationsByUserId(userId);
        } else {
            reservations = reservationService.findReservationsByUserIdAndStatus(userId, status);
        }

        List<ReservationResponseDto> responseList = reservations.stream()
                .map(ReservationResponseDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    /** 예약 취소 (사용자용) */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        String userId = extractUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            Reservation cancelled = reservationService.cancelReservation(id, userId);
            return ResponseEntity.ok(ReservationResponseDto.from(cancelled));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // ======== 관리자 전용 API ========

    /** 관리자용 - 모든 예약 목록 조회 */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllReservations(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {

        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        try {
            List<Reservation> reservations;
            if (status == null || status.isEmpty() || "ALL".equalsIgnoreCase(status)) {
                reservations = reservationService.findAllReservations(page, size);
            } else {
                reservations = reservationService.findReservationsByStatus(status, page, size);
            }

            List<ReservationResponseDto> responseList = reservations.stream()
                    .map(ReservationResponseDto::from)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("예약 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /** 관리자용 - 예약 상태 변경 */
    @PutMapping("/admin/{id}/status")
    public ResponseEntity<?> updateReservationStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        try {
            Reservation updated = reservationService.updateReservationStatus(id, status);
            return ResponseEntity.ok(ReservationResponseDto.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /** 관리자용 - 예약 삭제 */
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteReservation(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        try {
            reservationService.deleteReservation(id);
            return ResponseEntity.ok().body("예약이 성공적으로 삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /** 관리자용 - 예약 상세 조회 */
    @GetMapping("/admin/{id}")
    public ResponseEntity<?> getReservationById(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 필요합니다.");
        }

        try {
            Reservation reservation = reservationService.findReservationById(id);
            return ResponseEntity.ok(ReservationResponseDto.from(reservation));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ======== Private Helper Methods ========

    private String extractUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            return auth.getName();
        }
        return null;
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            return auth.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        }
        return false;
    }
}