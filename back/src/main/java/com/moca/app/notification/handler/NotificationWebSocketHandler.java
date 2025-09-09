// back/src/main/java/com/moca/app/notification/handler/NotificationWebSocketHandler.java
package com.moca.app.notification.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketHandler implements WebSocketHandler {

    private final ObjectMapper objectMapper;

    // userId별로 WebSocket 세션을 관리
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = extractUserIdFromPath(session.getUri());

        if (userId != null) {
            userSessions.put(userId, session);
            log.info("WebSocket 연결 성공: userId={}, sessionId={}", userId, session.getId());

            // 연결 성공 메시지 전송
            sendMessage(session, Map.of(
                    "type", "CONNECTION_SUCCESS",
                    "message", "알림 서비스에 연결되었습니다."
            ));
        } else {
            log.warn("잘못된 WebSocket 연결 시도: {}", session.getUri());
            session.close();
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        // 클라이언트로부터 메시지를 받았을 때 처리 (필요시 구현)
        log.debug("WebSocket 메시지 수신: sessionId={}, message={}", session.getId(), message.getPayload());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket 전송 에러: sessionId={}", session.getId(), exception);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String userId = extractUserIdFromPath(session.getUri());

        if (userId != null) {
            userSessions.remove(userId);
            log.info("WebSocket 연결 종료: userId={}, sessionId={}", userId, session.getId());
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    /**
     * 특정 사용자에게 알림 전송
     */
    public void sendNotificationToUser(String userId, Map<String, Object> notification) {
        WebSocketSession session = userSessions.get(userId);

        if (session != null && session.isOpen()) {
            try {
                Map<String, Object> message = Map.of(
                        "type", "NOTIFICATION_UPDATE",
                        "data", notification
                );
                sendMessage(session, message);
                log.info("알림 전송 완료: userId={}", userId);
            } catch (Exception e) {
                log.error("알림 전송 실패: userId={}", userId, e);
            }
        } else {
            log.debug("WebSocket 세션이 없거나 닫힘: userId={}", userId);
        }
    }

    /**
     * 읽지 않은 알림 개수 업데이트 전송
     */
    public void sendUnreadCountUpdate(String userId, long unreadCount) {
        WebSocketSession session = userSessions.get(userId);

        if (session != null && session.isOpen()) {
            try {
                Map<String, Object> message = Map.of(
                        "type", "UNREAD_COUNT_UPDATE",
                        "unreadCount", unreadCount
                );
                sendMessage(session, message);
                log.info("읽지 않은 알림 개수 업데이트 전송: userId={}, count={}", userId, unreadCount);
            } catch (Exception e) {
                log.error("읽지 않은 알림 개수 업데이트 전송 실패: userId={}", userId, e);
            }
        }
    }

    /**
     * WebSocket 세션에 메시지 전송
     */
    private void sendMessage(WebSocketSession session, Map<String, Object> message) throws IOException {
        String jsonMessage = objectMapper.writeValueAsString(message);
        session.sendMessage(new TextMessage(jsonMessage));
    }

    /**
     * URI에서 userId 추출
     */
    private String extractUserIdFromPath(URI uri) {
        if (uri == null) return null;

        String path = uri.getPath();
        String[] segments = path.split("/");

        // /ws/notifications/{userId} 형태에서 userId 추출
        if (segments.length >= 4 && "notifications".equals(segments[2])) {
            return segments[3];
        }

        return null;
    }

    /**
     * 연결된 사용자 수 조회 (모니터링용)
     */
    public int getConnectedUserCount() {
        return userSessions.size();
    }

    /**
     * 특정 사용자의 연결 상태 확인
     */
    public boolean isUserConnected(String userId) {
        WebSocketSession session = userSessions.get(userId);
        return session != null && session.isOpen();
    }
}