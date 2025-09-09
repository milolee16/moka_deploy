// front/src/services/WebSocketService.js (Native WebSocket 버전)

class WebSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = new Map();
    this.isConnected = false;
    this.userId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3초
  }

  /**
   * WebSocket 연결
   */
  connect(userId) {
    if (this.isConnected && this.userId === userId) {
      console.log('이미 연결되어 있습니다.');
      return;
    }

    this.userId = userId;
    this.disconnect(); // 기존 연결 정리

    try {
      // Native WebSocket 사용 (sockjs 대신)
      this.socket = new WebSocket(
        `ws://localhost:8080/ws/notifications/${userId}`
      );

      this.socket.onopen = () => {
        console.log('WebSocket 연결 성공:', userId);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyCallbacks('connection', { type: 'CONNECTED' });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket 메시지 수신:', data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket 연결 종료:', event.code, event.reason);
        this.isConnected = false;
        this.notifyCallbacks('connection', { type: 'DISCONNECTED' });

        // 자동 재연결 시도
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        this.notifyCallbacks('error', { error });
      };
    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * 메시지 처리
   */
  handleMessage(data) {
    switch (data.type) {
      case 'CONNECTION_SUCCESS':
        this.notifyCallbacks('connection', data);
        break;
      case 'NOTIFICATION_UPDATE':
        this.notifyCallbacks('notification', data.data);
        break;
      case 'UNREAD_COUNT_UPDATE':
        this.notifyCallbacks('unreadCount', data.unreadCount);
        break;
      default:
        console.log('알 수 없는 메시지 타입:', data.type);
    }
  }

  /**
   * 이벤트 콜백 등록
   */
  subscribe(eventType, callback) {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, new Set());
    }
    this.callbacks.get(eventType).add(callback);

    // unsubscribe 함수 반환
    return () => {
      const callbacks = this.callbacks.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * 등록된 콜백들에게 알림
   */
  notifyCallbacks(eventType, data) {
    const callbacks = this.callbacks.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('콜백 실행 오류:', error);
        }
      });
    }
  }

  /**
   * 재연결 스케줄링
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('최대 재연결 시도 횟수 초과');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(
      `${delay}ms 후 재연결 시도... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      if (!this.isConnected && this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }

  /**
   * 연결 상태 확인
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * 수동 재연결
   */
  reconnect() {
    if (this.userId) {
      this.reconnectAttempts = 0;
      this.connect(this.userId);
    }
  }
}

// 싱글톤 인스턴스 생성
export const websocketService = new WebSocketService();
