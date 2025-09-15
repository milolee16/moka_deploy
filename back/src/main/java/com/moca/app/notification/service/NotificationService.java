// back/src/main/java/com/moca/app/notification/service/NotificationService.java (완전 수정된 버전)
package com.moca.app.notification.service;

import com.moca.app.notification.Notification;
import com.moca.app.notification.repository.NotificationRepository;
import com.moca.app.notification.handler.NotificationWebSocketHandler;
import com.moca.app.rental.Reservation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationWebSocketHandler webSocketHandler; // WebSocket 핸들러 추가

    /**
     * 즉시 알림 생성 및 발송
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

        // WebSocket으로 실시간 알림 전송
        try {
            webSocketHandler.sendNotificationToUser(userId, Map.of(
                    "id", notification.getId(),
                    "title", notification.getTitle(),
                    "message", notification.getMessage(),
                    "notificationType", notification.getNotificationType(),
                    "isRead", notification.getIsRead(),
                    "createdAt", notification.getCreatedAt()
            ));

            // unreadCount 업데이트
            long newUnreadCount = getUnreadNotificationCount(userId);
            webSocketHandler.sendUnreadCountUpdate(userId, newUnreadCount);
        } catch (Exception e) {
            log.error("WebSocket 알림 전송 실패: userId={}, error={}", userId, e.getMessage());
        }

        log.info("즉시 알림 발송 완료: userId={}, type={}", userId, type);
    }

    /**
     * 스케줄 알림 생성
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
     * 개별 매개변수를 받는 예약 알림 생성 메서드 (ReservationService에서 호출)
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
     * 예약 관련 알림들을 한번에 생성 (Reservation 객체를 받는 기존 호환 버전)
     */
    public void createReservationNotifications(Reservation reservation) {
        String userId = reservation.getUserId();
        Long reservationId = reservation.getId();

        // 예약 날짜/시간을 LocalDateTime으로 변환
        LocalDateTime pickupDateTime = LocalDateTime.of(reservation.getDate(), reservation.getTime());
        LocalDateTime returnDateTime = null;

        // 반납 날짜/시간이 있는 경우 변환
        if (reservation.getReturnDate() != null && reservation.getReturnTime() != null) {
            returnDateTime = LocalDateTime.of(reservation.getReturnDate(), reservation.getReturnTime());
        }

        // 개별 매개변수 버전 호출
        createReservationNotifications(reservationId, userId, pickupDateTime, returnDateTime);
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
     * 특정 알림을 읽음 처리
     */
    @Transactional
    public void markAsRead(Long notificationId, String userId) {
        try {
            int updated = notificationRepository.markAsReadByIdAndUserId(notificationId, userId);

            if (updated > 0) {
                // 읽음 처리 후 실시간으로 unreadCount 업데이트
                long newUnreadCount = getUnreadNotificationCount(userId);
                webSocketHandler.sendUnreadCountUpdate(userId, newUnreadCount);

                log.info("알림 읽음 처리 완료: notificationId={}, userId={}, newUnreadCount={}",
                        notificationId, userId, newUnreadCount);
            }
        } catch (Exception e) {
            log.error("알림 읽음 처리 중 오류: notificationId={}, userId={}, error={}",
                    notificationId, userId, e.getMessage(), e);
            throw new RuntimeException("알림 읽음 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 모든 알림을 읽음 처리
     */
    @Transactional
    public void markAllAsRead(String userId) {
        try {
            notificationRepository.markAllAsReadByUserId(userId);

            // 모든 알림 읽음 처리 후 unreadCount를 0으로 업데이트
            webSocketHandler.sendUnreadCountUpdate(userId, 0L);

            log.info("모든 알림 읽음 처리 완료: userId={}", userId);
        } catch (Exception e) {
            log.error("모든 알림 읽음 처리 중 오류: userId={}, error={}", userId, e.getMessage(), e);
            throw new RuntimeException("모든 알림 읽음 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 사용자의 모든 알림 삭제
     */
    @Transactional
    public void deleteAllNotifications(String userId) {
        try {
            notificationRepository.deleteByUserId(userId);

            // 모든 알림 삭제 후 unreadCount를 0으로 업데이트
            webSocketHandler.sendUnreadCountUpdate(userId, 0L);

            log.info("모든 알림 삭제 완료: userId={}", userId);
        } catch (Exception e) {
            log.error("모든 알림 삭제 중 오류: userId={}, error={}", userId, e.getMessage(), e);
            throw new RuntimeException("모든 알림 삭제 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 사용자의 읽은 알림만 삭제
     */
    @Transactional
    public void deleteReadNotifications(String userId) {
        try {
            notificationRepository.deleteReadNotificationsByUserId(userId);

            // 읽은 알림 삭제 후 현재 unreadCount 업데이트 (읽지 않은 알림만 남음)
            long newUnreadCount = getUnreadNotificationCount(userId);
            webSocketHandler.sendUnreadCountUpdate(userId, newUnreadCount);

            log.info("읽은 알림 삭제 완료: userId={}, newUnreadCount={}", userId, newUnreadCount);
        } catch (Exception e) {
            log.error("읽은 알림 삭제 중 오류: userId={}, error={}", userId, e.getMessage(), e);
            throw new RuntimeException("읽은 알림 삭제 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 특정 알림 삭제
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        try {
            // 삭제하기 전에 해당 알림의 사용자 정보와 읽음 상태 확인
            Notification notification = notificationRepository.findById(notificationId)
                    .orElse(null);

            if (notification != null) {
                String userId = notification.getUserId();
                boolean wasUnread = !notification.getIsRead();

                notificationRepository.deleteById(notificationId);

                // 읽지 않은 알림이었다면 unreadCount 업데이트
                if (wasUnread) {
                    long newUnreadCount = getUnreadNotificationCount(userId);
                    webSocketHandler.sendUnreadCountUpdate(userId, newUnreadCount);
                }

                log.info("알림 삭제 완료: notificationId={}, userId={}, wasUnread={}",
                        notificationId, userId, wasUnread);
            }
        } catch (Exception e) {
            log.error("알림 삭제 중 오류: notificationId={}, error={}", notificationId, e.getMessage(), e);
            throw new RuntimeException("알림 삭제 중 오류가 발생했습니다.", e);
        }
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
            try {
                notification.markAsSent();
                notificationRepository.save(notification);

                // WebSocket으로 스케줄 알림 전송
                webSocketHandler.sendNotificationToUser(notification.getUserId(), Map.of(
                        "id", notification.getId(),
                        "title", notification.getTitle(),
                        "message", notification.getMessage(),
                        "notificationType", notification.getNotificationType(),
                        "isRead", notification.getIsRead(),
                        "createdAt", notification.getCreatedAt()
                ));

                // unreadCount 업데이트
                long newUnreadCount = getUnreadNotificationCount(notification.getUserId());
                webSocketHandler.sendUnreadCountUpdate(notification.getUserId(), newUnreadCount);

                log.info("스케줄 알림 발송: userId={}, type={}",
                        notification.getUserId(), notification.getNotificationType());
            } catch (Exception e) {
                log.error("스케줄 알림 발송 실패: notificationId={}, error={}",
                        notification.getId(), e.getMessage());
            }
        }

        if (!pendingNotifications.isEmpty()) {
            log.info("스케줄 알림 배치 처리 완료: {}개", pendingNotifications.size());
        }
    }
}