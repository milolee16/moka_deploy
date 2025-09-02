package com.moca.app.rental.controller;

import com.moca.app.rental.Reservation;
import com.moca.app.rental.dto.ReservationRequestDto;
import com.moca.app.rental.service.ReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<Reservation> createReservation(@RequestBody ReservationRequestDto requestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName(); // Assuming userId is the principal name

        Reservation createdReservation = reservationService.createReservation(requestDto, userId);
        System.out.println("이런 내용이 담겨있다: " +createdReservation);
        return new ResponseEntity<>(createdReservation, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Reservation> completeReservation(@PathVariable Long id) {
        try {
            Reservation completedReservation = reservationService.completeReservation(id);
            return ResponseEntity.ok(completedReservation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // Or a more specific error response
        }
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<java.util.List<Reservation>> getMyReservations(@RequestParam(required = false) String status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        java.util.List<Reservation> reservations = reservationService.getReservationsByUserIdAndStatus(userId, status);
        return ResponseEntity.ok(reservations);
    }
}
