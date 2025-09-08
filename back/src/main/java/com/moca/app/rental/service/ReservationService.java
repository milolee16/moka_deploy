package com.moca.app.rental.service;

import com.moca.app.rental.Reservation;
import com.moca.app.rental.dto.ReservationRequestDto;
import com.moca.app.rental.repository.ReservationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

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

    // 기존 메서드들
    public List<Reservation> findReservationsByUserId(String userId) {
        return reservationRepository.findByUserId(userId);
    }

    public List<Reservation> findReservationsByUserIdAndStatus(String userId, String status) {
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            return reservationRepository.findByUserIdAndStatus(userId, status);
        } else {
            return reservationRepository.findByUserId(userId);
        }
    }

    // 기존 메서드명과 맞추기 위해 getReservationsByUserIdAndStatus도 유지
    public List<Reservation> getReservationsByUserIdAndStatus(String userId, String status) {
        return findReservationsByUserIdAndStatus(userId, status);
    }

    @Transactional
    public Reservation cancelReservation(Long reservationId, String userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with ID: " + reservationId));

        // 사용자 권한 확인
        if (!reservation.getUserId().equals(userId)) {
            throw new IllegalArgumentException("해당 예약에 대한 권한이 없습니다.");
        }

        if (!"CONFIRMED".equals(reservation.getStatus()) && !"PENDING".equals(reservation.getStatus())) {
            throw new IllegalStateException("확정되거나 대기중인 예약만 취소할 수 있습니다.");
        }

        reservation.setStatus("CANCELLED");
        return reservationRepository.save(reservation);
    }

    // 기존 cancelReservation 메서드도 유지 (권한 확인 없는 버전)
    @Transactional
    public Reservation cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with ID: " + reservationId));

        if (!"CONFIRMED".equals(reservation.getStatus()) && !"UPCOMING".equals(reservation.getStatus())) {
            throw new IllegalStateException("Only CONFIRMED or UPCOMING reservations can be cancelled.");
        }

        reservation.setStatus("CANCELLED");
        return reservationRepository.save(reservation);
    }

    // ======== 관리자 전용 메서드들 ========

    /**
     * 관리자용 - 모든 예약 조회 (페이징)
     */
    public List<Reservation> findAllReservations(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return reservationRepository.findAll(pageable).getContent();
    }

    /**
     * 관리자용 - 상태별 예약 조회 (페이징)
     */
    public List<Reservation> findReservationsByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return reservationRepository.findByStatus(status);
        // 페이징을 위해서는 ReservationRepository에 Pageable을 받는 메서드가 필요하지만
        // 일단 기본 구현으로 처리하고, 필요시 나중에 추가
    }

    /**
     * 관리자용 - 예약 상태 변경
     */
    @Transactional
    public Reservation updateReservationStatus(Long reservationId, String newStatus) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 예약을 찾을 수 없습니다: " + reservationId));

        // 상태 유효성 검사
        if (!isValidStatus(newStatus)) {
            throw new IllegalArgumentException("유효하지 않은 상태입니다: " + newStatus);
        }

        // 상태 변경 로직 검증
        if (!canChangeStatus(reservation.getStatus(), newStatus)) {
            throw new IllegalStateException(String.format("상태를 %s에서 %s로 변경할 수 없습니다.",
                    reservation.getStatus(), newStatus));
        }

        reservation.setStatus(newStatus);

        // 완료 상태로 변경시 반납 시간 설정
        if ("COMPLETED".equals(newStatus)) {
            reservation.setReturnDate(LocalDate.now());
            reservation.setReturnTime(LocalTime.now());
        }

        return reservationRepository.save(reservation);
    }

    /**
     * 관리자용 - 예약 삭제
     */
    @Transactional
    public void deleteReservation(Long reservationId) {
        if (!reservationRepository.existsById(reservationId)) {
            throw new IllegalArgumentException("해당 ID의 예약을 찾을 수 없습니다: " + reservationId);
        }
        reservationRepository.deleteById(reservationId);
    }

    /**
     * 관리자용 - 예약 상세 조회
     */
    public Reservation findReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 예약을 찾을 수 없습니다: " + reservationId));
    }

    // ======== Private Helper Methods ========

    /**
     * 유효한 상태인지 확인
     */
    private boolean isValidStatus(String status) {
        return status != null && (
                "PENDING".equals(status) ||
                        "CONFIRMED".equals(status) ||
                        "IN_PROGRESS".equals(status) ||
                        "COMPLETED".equals(status) ||
                        "CANCELLED".equals(status)
        );
    }

    /**
     * 상태 변경이 가능한지 확인
     */
    private boolean canChangeStatus(String currentStatus, String newStatus) {
        if (currentStatus.equals(newStatus)) {
            return false; // 같은 상태로는 변경 불가
        }

        // 취소된 예약은 다른 상태로 변경 불가
        if ("CANCELLED".equals(currentStatus)) {
            return false;
        }

        // 완료된 예약은 취소만 가능
        if ("COMPLETED".equals(currentStatus)) {
            return "CANCELLED".equals(newStatus);
        }

        // 기타 상태 변경 로직
        switch (currentStatus) {
            case "PENDING":
                return "CONFIRMED".equals(newStatus) || "CANCELLED".equals(newStatus);
            case "CONFIRMED":
                return "IN_PROGRESS".equals(newStatus) || "CANCELLED".equals(newStatus);
            case "IN_PROGRESS":
                return "COMPLETED".equals(newStatus) || "CANCELLED".equals(newStatus);
            default:
                return true;
        }
    }
}