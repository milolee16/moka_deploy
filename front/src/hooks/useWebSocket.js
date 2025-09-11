// front/src/hooks/useWebSocket.js
import { useEffect, useCallback, useRef } from 'react';
import { websocketService } from '../services/WebSocketService';
import { useAuth } from '../contexts/AuthContext';

export const useWebSocket = () => {
  const { user } = useAuth();
  const callbacksRef = useRef(new Map());

  /**
   * WebSocket 연결
   */
  const connect = useCallback(() => {
    if (user?.id) {
      websocketService.connect(user.id);
    }
  }, [user?.id]);

  /**
   * WebSocket 연결 해제
   */
  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  /**
   * 이벤트 구독
   */
  const subscribe = useCallback((eventType, callback) => {
    const unsubscribe = websocketService.subscribe(eventType, callback);

    // 정리를 위해 unsubscribe 함수 저장
    if (!callbacksRef.current.has(eventType)) {
      callbacksRef.current.set(eventType, new Set());
    }
    callbacksRef.current.get(eventType).add(unsubscribe);

    return unsubscribe;
  }, []);

  /**
   * 연결 상태 확인
   */
  const getConnectionStatus = useCallback(() => {
    return websocketService.getConnectionStatus();
  }, []);

  /**
   * 수동 재연결
   */
  const reconnect = useCallback(() => {
    websocketService.reconnect();
  }, []);

  // 사용자 로그인 시 자동 연결
  useEffect(() => {
    if (user?.id) {
      connect();
    } else {
      disconnect();
    }

    // 컴포넌트 언마운트 시 모든 구독 해제
    return () => {
      callbacksRef.current.forEach((unsubscribes) => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      });
      callbacksRef.current.clear();
    };
  }, [user?.id, connect, disconnect]);

  // 페이지 이동 시 연결 상태 관리
  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnect();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        // 페이지가 다시 보일 때 연결 상태 확인 후 재연결
        const status = getConnectionStatus();
        if (!status.isConnected) {
          setTimeout(() => connect(), 1000);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, connect, disconnect, getConnectionStatus]);

  return {
    connect,
    disconnect,
    subscribe,
    getConnectionStatus,
    reconnect,
  };
};
