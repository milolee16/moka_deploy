// back/src/main/java/com/moca/app/notification/repository/NotificationRepository.java (수정된 버전)
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

    /**
     * 사용자별 알림 목록 조회 (생성일 기준 내림차순)
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * 사용자별 읽지 않은 알림 개수
     */
    long countByUserIdAndIsReadFalse(String userId);

    /**
     * 사용자별 특정 상태의 알림 조회
     */
    List<Notification> findByUserIdAndIsRead(String userId, Boolean isRead);

    /**
     * 사용자별 알림 타입으로 조회
     */
    List<Notification> findByUserIdAndNotificationType(String userId, Notification.NotificationType notificationType);

    /**
     * 특정 예약의 알림들 조회
     */
    List<Notification> findByReservationId(Long reservationId);

    /**
     * 특정 알림을 읽음 처리 (개별 알림용) - 새로 추가
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :notificationId AND n.userId = :userId AND n.isRead = false")
    int markAsReadByIdAndUserId(@Param("notificationId") Long notificationId, @Param("userId") String userId);

    /**
     * 사용자의 모든 알림을 읽음 처리
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") String userId);

    /**
     * 발송 대기 중인 스케줄 알림 조회 (배치 처리용)
     */
    @Query("SELECT n FROM Notification n WHERE n.scheduledAt IS NOT NULL AND n.scheduledAt <= :currentTime AND n.sentAt IS NULL")
    List<Notification> findPendingScheduledNotifications(@Param("currentTime") LocalDateTime currentTime);

    /**
     * 사용자의 모든 알림 삭제
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.userId = :userId")
    void deleteByUserId(@Param("userId") String userId);

    /**
     * 사용자의 읽은 알림만 삭제
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.userId = :userId AND n.isRead = true")
    void deleteReadNotificationsByUserId(@Param("userId") String userId);

    /**
     * 생성일 기준으로 오래된 알림 삭제 (데이터 정리용)
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * 사용자별 최근 N개 알림 조회
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId ORDER BY n.createdAt DESC LIMIT :limit")
    List<Notification> findRecentNotificationsByUserId(@Param("userId") String userId, @Param("limit") int limit);
}