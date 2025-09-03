package com.moca.app.notification;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "NOTIFICATIONS")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "USER_ID", nullable = false)
    private String userId;

    @Column(name = "NOTIFICATION_TYPE", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

    @Column(name = "TITLE", nullable = false)
    private String title;

    @Column(name = "MESSAGE", nullable = false)
    private String message;

    @Column(name = "RESERVATION_ID")
    private Long reservationId;

    @Column(name = "IS_READ", nullable = false)
    private Boolean isRead = false;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "SCHEDULED_AT")
    private LocalDateTime scheduledAt;

    @Column(name = "SENT_AT")
    private LocalDateTime sentAt;

    @Builder
    public Notification(String userId, NotificationType notificationType, String title,
                        String message, Long reservationId, Boolean isRead,
                        LocalDateTime scheduledAt) {
        this.userId = userId;
        this.notificationType = notificationType;
        this.title = title;
        this.message = message;
        this.reservationId = reservationId;
        this.isRead = isRead != null ? isRead : false;
        this.createdAt = LocalDateTime.now();
        this.scheduledAt = scheduledAt;
    }

    public void markAsRead() {
        this.isRead = true;
    }

    public void markAsSent() {
        this.sentAt = LocalDateTime.now();
    }

    // 알림 타입 enum
    public enum NotificationType {
        RESERVATION_CONFIRMED("예약 확정"),
        RESERVATION_CANCELLED("예약 취소"),
        REMINDER_24H("24시간 전 알림"),
        REMINDER_1H("1시간 전 알림"),
        RETURN_REMINDER("반납 알림"),
        PAYMENT_COMPLETED("결제 완료"),
        LICENSE_APPROVED("면허증 승인"),
        LICENSE_REJECTED("면허증 반려");

        private final String description;

        NotificationType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}