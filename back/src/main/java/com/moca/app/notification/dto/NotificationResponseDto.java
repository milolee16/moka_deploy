package com.moca.app.notification.dto;

import com.moca.app.notification.Notification;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponseDto {

    private Long id;
    private String userId;
    private String notificationType;
    private String notificationTypeDescription;
    private String title;
    private String message;
    private Long reservationId;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime scheduledAt;
    private LocalDateTime sentAt;

    public static NotificationResponseDto from(Notification notification) {
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .notificationType(notification.getNotificationType().name())
                .notificationTypeDescription(notification.getNotificationType().getDescription())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .reservationId(notification.getReservationId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .scheduledAt(notification.getScheduledAt())
                .sentAt(notification.getSentAt())
                .build();
    }
}