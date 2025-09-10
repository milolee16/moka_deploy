package com.moca.app.notification.controller;

import com.moca.app.notification.Notification;
import com.moca.app.notification.dto.NotificationResponseDto;
import com.moca.app.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notifications") // 최종 엔드포인트: /api/notifications
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 사용자의 알림 목록 조회
     */
    @GetMapping
    public ResponseEntity<?> getUserNotifications() {
        String userId = extractUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            List<NotificationResponseDto> responseList = notifications.stream()
                    .map(NotificationResponseDto::from)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            log.error("알림 목록 조회 실패: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("알림 목록 조회 중 오류가 발생했습니다.");
        }
    }

    /**
     * 읽지 않은 알림 개수 조회
     */
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadNotificationCount() {
        String userId = extractUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            long unreadCount = notificationService.getUnreadNotificationCount(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("unreadCount", unreadCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("읽지 않은 알림 개수 조회 실패: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("읽지 않은 알림 개수 조회 중 오류가 발생했습니다.");
        }
    }

    /**
     * 특정 알림을 읽음 처리
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long notificationId) {
        String userId = extractUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            notificationService.markAsRead(notificationId, userId);
            return ResponseEntity.ok().body("알림이 읽음 처리되었습니다.");
        } catch (Exception e) {
            log.error("알림 읽음 처리 실패: notificationId={}, userId={}, error={}",
                    notificationId, userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("알림 읽음 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 모든 알림을 읽음 처리
     */
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllNotificationsAsRead() {
        String userId = extractUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok().body("모든 알림이 읽음 처리되었습니다.");
        } catch (Exception e) {
            log.error("모든 알림 읽음 처리 실패: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("모든 알림 읽음 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 사용자의 모든 알림 삭제
     */
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllNotifications() {
        String userId = extractUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            notificationService.deleteAllNotifications(userId);
            return ResponseEntity.ok("모든 알림이 삭제되었습니다.");
        } catch (Exception e) {
            log.error("모든 알림 삭제 실패: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("알림 삭제 중 오류가 발생했습니다.");
        }
    }

    /**
     * 사용자의 읽은 알림만 삭제
     */
    @DeleteMapping("/read")
    public ResponseEntity<?> deleteReadNotifications() {
        String userId = extractUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            notificationService.deleteReadNotifications(userId);
            return ResponseEntity.ok("읽은 알림이 삭제되었습니다.");
        } catch (Exception e) {
            log.error("읽은 알림 삭제 실패: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("읽은 알림 삭제 중 오류가 발생했습니다.");
        }
    }

    /**
     * 특정 알림 삭제
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId) {
        String userId = extractUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            // 먼저 해당 알림이 사용자의 것인지 확인
            List<Notification> userNotifications = notificationService.getUserNotifications(userId);
            boolean isOwner = userNotifications.stream()
                    .anyMatch(notification -> notification.getId().equals(notificationId));

            if (!isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 알림에 대한 권한이 없습니다.");
            }

            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok("알림이 삭제되었습니다.");
        } catch (Exception e) {
            log.error("알림 삭제 실패: notificationId={}, userId={}, error={}",
                    notificationId, userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("알림 삭제 중 오류가 발생했습니다.");
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
}