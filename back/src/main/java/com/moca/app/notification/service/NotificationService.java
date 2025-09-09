// back/src/main/java/com/moca/app/notification/service/NotificationService.java
package com.moca.app.notification.service;

import com.moca.app.notification.Notification;
import com.moca.app.notification.repository.NotificationRepository;
import com.moca.app.rental.Reservation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * 즉시 알림 생성 및 발송 (기존 호환)
     */
    public void createAndSendImmediateNotification(String userId,
                                                   Notification.NotificationType type,
                                                   String title,
                                                   String message,
                                                   Long reservationId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .notificationType(type)
                .title(title)
                .message(message)
                .reservationId(reservationId)
                .isRead(false)
                .build();

        notification.markAsSent();
        notificationRepository.save(notification);

        log.info("즉시 알림 발송 완료: userId={}, type={}", userId, type);
    }

    /**
     * 스케줄 알림 생성 (기존 호환)
     */
    public void createScheduledNotification(String userId,
                                            Notification.NotificationType type,
                                            String title,
                                            String message,
                                            Long reservationId,
                                            LocalDateTime scheduledAt) {
        Notification notification = Notification.builder()
                .userId(userId)
                .notificationType(type)
                .title(title)
                .message(message)
                .reservationId(reservationId)
                .scheduledAt(scheduledAt)
                .isRead(false)
                .build();

        notificationRepository.save(notification);

        log.info("스케줄 알림 생성: userId={}, type={}, scheduledAt={}", userId, type, scheduledAt);
    }

    /**
     * 예약 관련 알림들을 한번에 생성 (Reservation 객체를 받는 기존 호환 버전)
     */
    public void createReservationNotifications(Reservation reservation) {
        String userId = reservation.getUserId();
        Long reservationId = reservation.getId();

        log.info("예약 알림 생성 시작: reservationId={}, userId={}", reservationId, userId);

        try {
            // 1. 예약 확정 알림 (즉시)
            createAndSendImmediateNotification(
                    userId,
                    Notification.NotificationType.RESERVATION_CONFIRMED,
                    "예약이 확정되었습니다!",
                    String.format("차량 대여 예약이 성공적으로 완료되었습니다. 예약일: %s %s",
                            reservation.getDate().toString(),
                            reservation.getTime().toString()),
                    reservationId
            );

            // 2. 24시간 전 알림 (스케줄)
            LocalDateTime reservationDateTime = LocalDateTime.of(reservation.getDate(), reservation.getTime());
            LocalDateTime reminderTime24h = reservationDateTime.minusHours(24);

            if (reminderTime24h.isAfter(LocalDateTime.now())) {
                createScheduledNotification(
                        userId,
                        Notification.NotificationType.REMINDER_24H,
                        "내일 차량 대여 예정입니다",
                        String.format("예약하신 차량 대여가 내일(%s)입니다. 준비해주세요!",
                                reservation.getDate().toString()),
                        reservationId,
                        reminderTime24h
                );
            }

            // 3. 1시간 전 알림 (스케줄)
            LocalDateTime reminderTime1h = reservationDateTime.minusHours(1);
            if (reminderTime1h.isAfter(LocalDateTime.now())) {
                createScheduledNotification(
                        userId,
                        Notification.NotificationType.REMINDER_1H,
                        "곧 차량 대여 시간입니다",
                        "1시간 후 차량 대여 예정입니다. 대여 지점으로 이동해주세요.",
                        reservationId,
                        reminderTime1h
                );
            }

            // 4. 반납 알림 (반납 1시간 전)
            if (reservation.getReturnDate() != null && reservation.getReturnTime() != null) {
                LocalDateTime returnDateTime = LocalDateTime.of(reservation.getReturnDate(), reservation.getReturnTime());
                LocalDateTime returnReminderTime = returnDateTime.minusHours(1);

                if (returnReminderTime.isAfter(LocalDateTime.now())) {
                    createScheduledNotification(
                            userId,
                            Notification.NotificationType.RETURN_REMINDER,
                            "차량 반납 시간이 다가옵니다",
                            "1시간 후 차량 반납 예정입니다. 반납 준비를 해주세요.",
                            reservationId,
                            returnReminderTime
                    );
                }
            }

            log.info("예약 알림 생성 완료: reservationId={}, userId={}", reservationId, userId);

        } catch (Exception e) {
            log.error("예약 알림 생성 중 오류: reservationId={}, error={}", reservationId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 개별 매개변수를 받는 예약 알림 생성 메서드 (추가 호환성)
     */
    public void createReservationNotifications(Long reservationId, String userId,
                                               LocalDateTime pickupTime, LocalDateTime returnTime) {
        log.info("예약 알림 생성 시작: reservationId={}, userId={}", reservationId, userId);

        try {
            // 1. 예약 확정 알림 (즉시)
            createAndSendImmediateNotification(
                    userId,
                    Notification.NotificationType.RESERVATION_CONFIRMED,
                    "예약이 확정되었습니다!",
                    String.format("차량 대여 예약이 성공적으로 완료되었습니다. 예약일: %s",
                            pickupTime.toLocalDate().toString()),
                    reservationId
            );

            // 2. 픽업 1시간 전 알림 (스케줄)
            LocalDateTime pickupReminderTime = pickupTime.minusHours(1);
            if (pickupReminderTime.isAfter(LocalDateTime.now())) {
                createScheduledNotification(
                        userId,
                        Notification.NotificationType.REMINDER_1H,
                        "곧 차량 대여 시간입니다",
                        "1시간 후 차량 대여 예정입니다. 대여 지점으로 이동해주세요.",
                        reservationId,
                        pickupReminderTime
                );
            }

            // 3. 반납 1시간 전 알림 (스케줄) - 반납 시간이 있는 경우
            if (returnTime != null) {
                LocalDateTime returnReminderTime = returnTime.minusHours(1);
                if (returnReminderTime.isAfter(LocalDateTime.now())) {
                    createScheduledNotification(
                            userId,
                            Notification.NotificationType.RETURN_REMINDER,
                            "차량 반납 시간이 다가옵니다",
                            "1시간 후 차량 반납 예정입니다. 반납 준비를 해주세요.",
                            reservationId,
                            returnReminderTime
                    );
                }
            }

            log.info("예약 알림 생성 완료: reservationId={}, userId={}", reservationId, userId);

        } catch (Exception e) {
            log.error("예약 알림 생성 중 오류: reservationId={}, error={}", reservationId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 사용자의 알림 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * 읽지 않은 알림 개수 조회
     */
    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * 알림을 읽음 처리
     */
    public void markAsRead(Long notificationId, String userId) {
        notificationRepository.findById(notificationId)
                .filter(notification -> notification.getUserId().equals(userId))
                .ifPresent(Notification::markAsRead);
    }

    /**
     * 모든 알림을 읽음 처리
     */
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    /**
     * 스케줄 알림 배치 처리 (매분 실행)
     */
    @Scheduled(fixedRate = 60000) // 1분마다 실행
    @Async
    public void processPendingNotifications() {
        List<Notification> pendingNotifications =
                notificationRepository.findPendingScheduledNotifications(LocalDateTime.now());

        for (Notification notification : pendingNotifications) {
            notification.markAsSent();
            notificationRepository.save(notification);

            log.info("스케줄 알림 발송: userId={}, type={}",
                    notification.getUserId(), notification.getNotificationType());
        }

        if (!pendingNotifications.isEmpty()) {
            log.info("스케줄 알림 배치 처리 완료: {}개", pendingNotifications.size());
        }
    }
}