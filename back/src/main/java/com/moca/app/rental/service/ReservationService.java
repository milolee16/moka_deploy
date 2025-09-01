package com.moca.app.rental.service;

import com.moca.app.rental.Reservation;
import com.moca.app.rental.dto.ReservationRequestDto;
import com.moca.app.rental.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Instant;
import java.time.ZoneId;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @Transactional
    public Reservation createReservation(ReservationRequestDto requestDto, String userId) {
        // Parse startDate and endDate strings
        // 'Z' indicates UTC. LocalDateTime.parse() does not handle 'Z' by default.
        // Parse as Instant and then convert to LocalDateTime in system default timezone
        LocalDateTime startDateTime = Instant.parse(requestDto.getStartDate()).atZone(ZoneId.systemDefault()).toLocalDateTime();
        LocalDateTime endDateTime = Instant.parse(requestDto.getEndDate()).atZone(ZoneId.systemDefault()).toLocalDateTime();

        Reservation reservation = Reservation.builder()
                .userId(userId)
                .carId(requestDto.getCarId())
                .locationName(requestDto.getLocationName())
                .date(startDateTime.toLocalDate()) // RENTAL_DATE
                .time(startDateTime.toLocalTime()) // RENTAL_TIME
                .returnDate(endDateTime.toLocalDate()) // RETURN_DATE
                .returnTime(endDateTime.toLocalTime()) // RETURN_TIME
                .passengerCount(requestDto.getPassengerCount())
                .memo(requestDto.getMemo())
                .status("CONFIRMED") // Or PENDING, depending on business logic
                .totalAmount(requestDto.getTotalAmount())
                .build();

        System.out.println("reservation 리포지터리 : " + reservation);

        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation completeReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with ID: " + reservationId));

        // Set return date and time to now
        reservation.setReturnDate(LocalDate.now());
        reservation.setReturnTime(LocalTime.now());
        reservation.setStatus("COMPLETED");

        return reservationRepository.save(reservation);
    }

    public java.util.List<Reservation> getReservationsByUserIdAndStatus(String userId, String status) {
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            return reservationRepository.findByUserIdAndStatus(userId, status);
        } else {
            return reservationRepository.findByUserId(userId);
        }
    }
}
