import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './ChatbotWidget.css';

/**
 * CORS 문제가 해결된 AutoML 피드백 기능이 통합된 챗봇 위젯
 */
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // AutoML 관련 상태
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [mlStats, setMlStats] = useState(null);

  // 세션 관리
  const [sessionId, setSessionId] = useState(null);
  const welcomedRef = useRef(false);

  // UI 관련 refs
  const messagesRef = useRef(null);
  const endRef = useRef(null);
  const firstScrollDoneRef = useRef(false);
  const inputRef = useRef(null);
  const composingRef = useRef(false);

  // API URL 통일 (localhost 사용)
  const BASE_URL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000' // 127.0.0.1 대신 localhost 사용
      : 'https://YOUR-PROD-DOMAIN';

  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30초로 증가
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: false, // CORS 문제 해결
  });

  // 세션 ID 생성
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 세션 초기화
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      console.log('🆔 새 세션 생성:', newSessionId);
    }
  }, [sessionId]);

  // ML 통계 로드
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      loadMlStats();
    }
  }, []);

  const loadMlStats = async () => {
    try {
      const response = await api.get('/ml_stats');
      setMlStats(response.data);
      console.log('📊 ML 통계 로드 완료:', response.data);
    } catch (error) {
      console.error('ML 통계 로드 실패:', error);
    }
  };

  const handleToggleOpen = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    // 처음 열 때만 환영 메시지 표시
    if (willOpen && !welcomedRef.current && chat.length === 0) {
      setChat([
        {
          role: 'assistant',
          text:
            '안녕하세요! MOCA 고객지원 챗봇입니다.\n' +
            '차량 예약, 요금 문의, 이용 방법 등 무엇이든 물어보세요.\n' +
            '대화 내용을 기억하고 있으니 편하게 대화하세요! 😊',
          timestamp: new Date().toISOString(),
        },
      ]);
      welcomedRef.current = true;
    }
  };

  const safeAppend = (entry) => setChat((prev) => [...prev, entry]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage = {
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // UI 업데이트
    setChat((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('📤 메시지 전송:', {
        message: userMessage.text,
        session_id: sessionId,
        url: `${BASE_URL}/get_response`,
      });

      const res = await api.post('/get_response', {
        message: userMessage.text,
        session_id: sessionId,
      });

      console.log('📥 응답 받음:', res.data);

      const botMessage = {
        role: 'assistant',
        text: res.data.response,
        timestamp: new Date().toISOString(),
        ml_prediction: res.data.ml_prediction,
        messageId: Date.now(),
      };

      setChat((prev) => [...prev, botMessage]);

      // 세션 ID 업데이트
      if (res.data.session_id && res.data.session_id !== sessionId) {
        setSessionId(res.data.session_id);
        console.log('🆔 세션 ID 업데이트:', res.data.session_id);
      }

      // ML 통계 업데이트 (개발 모드)
      if (process.env.NODE_ENV === 'development') {
        loadMlStats();
      }
    } catch (err) {
      console.error('❌ 서버 오류:', err);

      let errorMessage = '서버와 연결할 수 없어요.';

      if (err.code === 'ERR_NETWORK') {
        errorMessage =
          '네트워크 연결을 확인해주세요. 서버가 실행 중인지 확인해보세요.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = '응답 시간이 초과되었어요. 다시 시도해 주세요.';
      } else if (err.response?.status === 500) {
        errorMessage =
          '서버에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.';
      } else if (err.response?.status === 400) {
        errorMessage = '메시지를 이해할 수 없어요. 다시 입력해 주세요.';
      } else if (err.response?.status === 403) {
        errorMessage = '서버 접근이 거부되었어요. 관리자에게 문의해주세요.';
      }

      setChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ ${errorMessage}`,
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 피드백 제출
  const submitFeedback = async (messageId, feedbackData) => {
    try {
      const message = chat.find((msg) => msg.messageId === messageId);
      if (!message || !message.ml_prediction) return;

      const feedbackPayload = {
        text: chat[chat.indexOf(message) - 1]?.text,
        predicted_intent: message.ml_prediction.final_intent,
        actual_intent: feedbackData.correctIntent,
        user_satisfied: feedbackData.satisfied,
      };

      await api.post('/feedback', feedbackPayload);
      console.log('✅ 피드백 전송 완료:', feedbackPayload);

      setShowFeedback(false);
      setCurrentFeedback(null);

      safeAppend({
        role: 'system',
        text: '📝 피드백 감사합니다! 더 나은 서비스를 위해 활용하겠습니다.',
        timestamp: new Date().toISOString(),
        isSystem: true,
      });
    } catch (error) {
      console.error('❌ 피드백 전송 실패:', error);
    }
  };

  // 피드백 UI 열기
  const openFeedback = (messageId) => {
    const message = chat.find((msg) => msg.messageId === messageId);
    if (message && message.ml_prediction) {
      setCurrentFeedback({
        messageId,
        userMessage: chat[chat.indexOf(message) - 1]?.text,
        botResponse: message.text,
        prediction: message.ml_prediction,
      });
      setShowFeedback(true);
    }
  };

  // 자동 스크롤
  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      if (endRef.current) {
        endRef.current.scrollIntoView({
          behavior: firstScrollDoneRef.current ? 'smooth' : 'auto',
          block: 'end',
        });
      } else if (messagesRef.current) {
        const el = messagesRef.current;
        el.scrollTop = el.scrollHeight;
      }
      firstScrollDoneRef.current = true;
    });
  }, [chat, isOpen, loading]);

  const onKeyDown = (e) => {
    if (composingRef.current) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 세션 정보 디버깅
  const showSessionInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 현재 세션 정보:', {
        sessionId,
        messageCount: chat.length,
        isOpen,
        isLoading,
        mlStats,
        baseUrl: BASE_URL,
      });
    }
  };

  return (
    <div className="chatbot-widget">
      <button
        className="chatbot-button"
        onClick={handleToggleOpen}
        onDoubleClick={showSessionInfo}
        title="MOCA 챗봇"
      >
        {isLoading ? '⏳' : '💬'}
      </button>

      {isOpen && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <span>
              MOCA 챗봇
              {process.env.NODE_ENV === 'development' && sessionId && (
                <span style={{ fontSize: '10px', opacity: 0.7 }}>
                  {` (${sessionId.slice(-8)})`}
                </span>
              )}
            </span>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          {/* ML 통계 (개발 모드) */}
          {process.env.NODE_ENV === 'development' && mlStats && (
            <div className="ml-stats-banner">
              📊 ML: {mlStats.training_data_count}개 학습데이터, 정확도:{' '}
              {(mlStats.recent_accuracy * 100).toFixed(1)}%
              {mlStats.model_loaded ? ' ✅' : ' ❌'}
            </div>
          )}

          <div className="chatbot-messages" ref={messagesRef}>
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${
                  msg.role === 'user'
                    ? 'user'
                    : msg.isError
                    ? 'error'
                    : msg.isSystem
                    ? 'system'
                    : 'bot'
                }`}
                title={
                  msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''
                }
              >
                <div className="message-content">{msg.text}</div>

                {/* ML 예측 정보 (개발 모드) */}
                {process.env.NODE_ENV === 'development' &&
                  msg.ml_prediction && (
                    <div className="ml-prediction-info">
                      🤖 {msg.ml_prediction.prediction_source}:{' '}
                      {msg.ml_prediction.final_intent}
                      {msg.ml_prediction.ml_confidence &&
                        ` (${(msg.ml_prediction.ml_confidence * 100).toFixed(
                          0
                        )}%)`}
                    </div>
                  )}

                {/* 피드백 버튼 */}
                {msg.role === 'assistant' &&
                  !msg.isError &&
                  !msg.isSystem &&
                  msg.messageId && (
                    <div className="feedback-buttons">
                      <button
                        className="feedback-btn thumbs-up"
                        onClick={() =>
                          submitFeedback(msg.messageId, { satisfied: true })
                        }
                        title="도움이 되었어요"
                      >
                        👍
                      </button>
                      <button
                        className="feedback-btn thumbs-down"
                        onClick={() => openFeedback(msg.messageId)}
                        title="개선이 필요해요"
                      >
                        👎
                      </button>
                    </div>
                  )}
              </div>
            ))}

            {isLoading && (
              <div className="chat-bubble bot loading">
                <div className="typing-animation">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="chatbot-input">
            <input
              ref={inputRef}
              type="text"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => (composingRef.current = true)}
              onCompositionEnd={() => (composingRef.current = false)}
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      )}

      {/* 피드백 모달 */}
      {showFeedback && currentFeedback && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <div className="feedback-header">
              <h3>피드백을 주세요</h3>
              <button onClick={() => setShowFeedback(false)}>✖</button>
            </div>

            <div className="feedback-content">
              <div className="feedback-section">
                <label>사용자 질문:</label>
                <p>"{currentFeedback.userMessage}"</p>
              </div>

              <div className="feedback-section">
                <label>챗봇 응답:</label>
                <p>"{currentFeedback.botResponse}"</p>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="feedback-section">
                  <label>AI 예측:</label>
                  <p>
                    {currentFeedback.prediction.final_intent}(
                    {currentFeedback.prediction.prediction_source})
                  </p>
                </div>
              )}

              <div className="feedback-section">
                <label>올바른 의도를 선택해주세요:</label>
                <select
                  id="correct-intent"
                  defaultValue={currentFeedback.prediction.final_intent}
                >
                  <option value="예약_문의">예약 문의</option>
                  <option value="요금_문의">요금 문의</option>
                  <option value="이용_방법">이용 방법</option>
                  <option value="문제_해결">문제 해결</option>
                  <option value="계정_관리">계정 관리</option>
                  <option value="인사">인사</option>
                  <option value="감사">감사</option>
                  <option value="기타_문의">기타 문의</option>
                </select>
              </div>
            </div>

            <div className="feedback-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowFeedback(false)}
              >
                취소
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  const correctIntent =
                    document.getElementById('correct-intent').value;
                  submitFeedback(currentFeedback.messageId, {
                    satisfied: false,
                    correctIntent,
                  });
                }}
              >
                피드백 전송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
