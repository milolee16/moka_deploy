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

        List<Reservation> reservations = reservationService.getReservationsByUserIdAndStatus(userId, status);
        List<ReservationResponseDto> body = reservations.stream()
                .map(ReservationResponseDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(body);
    }

    /** SecurityContext에서 내부 userId 안전 추출 */
    private String extractUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return null;

        String name = authentication.getName();
        if (name == null || "anonymousUser".equalsIgnoreCase(name)) {
            return null;
        }

        // 필요하다면 커스텀 Principal에서 내부 userId를 뽑아 쓰세요.
        // Object principal = authentication.getPrincipal();
        // if (principal instanceof AppUserPrincipal p) {
        //     return p.getUserId();
        // }
        return name; // 현재는 getName()을 userId로 사용
    }
}
