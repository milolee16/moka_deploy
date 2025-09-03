package com.moca.app.notification.repository;

import com.moca.app.notification.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 사용자별 알림 조회 (최신순)
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    // 읽지 않은 알림 조회
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);

    // 읽지 않은 알림 개수
    long countByUserIdAndIsReadFalse(String userId);

    // 예약별 알림 조회
    List<Notification> findByReservationId(Long reservationId);

    // 발송 대기 중인 스케줄 알림 조회
    @Query("SELECT n FROM Notification n WHERE n.scheduledAt <= :now AND n.sentAt IS NULL")
    List<Notification> findPendingScheduledNotifications(@Param("now") LocalDateTime now);

    // 사용자의 모든 알림을 읽음 처리
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") String userId);
}