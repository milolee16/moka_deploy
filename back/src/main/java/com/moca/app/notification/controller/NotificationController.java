package com.moca.app.notification.controller;

import com.moca.app.notification.Notification;
import com.moca.app.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 사용자 알림 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(Authentication auth) {
        String userId = auth.getName();
        List<Notification> notifications = notificationService.getUserNotifications(userId);

        List<NotificationDTO> dtoList = notifications.stream()
                .map(NotificationDTO::from)
                .toList();

        return ResponseEntity.ok(dtoList);
    }

    /**
     * 읽지 않은 알림 개수 조회
     */
    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(Authentication auth) {
        String userId = auth.getName();
        long count = notificationService.getUnreadNotificationCount(userId);

        return ResponseEntity.ok(new UnreadCountResponse(count));
    }

    /**
     * 특정 알림을 읽음 처리
     */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId,
                                           Authentication auth) {
        String userId = auth.getName();
        notificationService.markAsRead(notificationId, userId);

        return ResponseEntity.ok().build();
    }

    /**
     * 모든 알림을 읽음 처리
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        String userId = auth.getName();
        notificationService.markAllAsRead(userId);

        return ResponseEntity.ok().build();
    }

    // DTO 클래스들
    public record NotificationDTO(
            Long id,
            String type,
            String title,
            String message,
            Long reservationId,
            boolean isRead,
            String createdAt,
            String timeAgo
    ) {
        public static NotificationDTO from(Notification notification) {
            return new NotificationDTO(
                    notification.getId(),
                    notification.getNotificationType().name(),
                    notification.getTitle(),
                    notification.getMessage(),
                    notification.getReservationId(),
                    notification.getIsRead(),
                    notification.getCreatedAt().toString(),
                    calculateTimeAgo(notification.getCreatedAt())
            );
        }

        private static String calculateTimeAgo(java.time.LocalDateTime createdAt) {
            java.time.Duration duration = java.time.Duration.between(createdAt, java.time.LocalDateTime.now());

            long minutes = duration.toMinutes();
            long hours = duration.toHours();
            long days = duration.toDays();

            if (minutes < 60) {
                return minutes + "분 전";
            } else if (hours < 24) {
                return hours + "시간 전";
            } else {
                return days + "일 전";
            }
        }
    }

    public record UnreadCountResponse(long count) {}
}