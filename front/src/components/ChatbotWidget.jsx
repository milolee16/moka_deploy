import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// --- Complete CSS Styles ---
const cssStyles = `
/* Main Widget Container */
.chatbot-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: 'Arial', sans-serif;
}

/* Chatbot Toggle Button */
.chatbot-button {
  background-color: #a47551;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.chatbot-button:hover {
  background-color: #8b5a2b;
  transform: scale(1.1);
}

/* Chat Popup Window */
.chatbot-popup {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.chatbot-header {
  background-color: #a47551;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  gap: 8px;
}

.chatbot-header span {
  margin-right: auto;
}

.chatbot-header button.header-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.chatbot-header button.header-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.chatbot-header button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ML Stats Banner (Dev Mode) */
.ml-stats-banner {
  background-color: #f0f0f0;
  padding: 5px 10px;
  font-size: 11px;
  color: #555;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

/* Messages Area */
.chatbot-messages {
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chatbot-messages::-webkit-scrollbar {
  width: 8px;
}
.chatbot-messages::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
}
.chatbot-messages::-webkit-scrollbar-thumb {
  background: #cbbba9;
  border-radius: 8px;
}

/* General Chat Bubble Style */
.chat-bubble {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
  line-height: 1.4;
  font-size: 14px;
}

.chat-bubble .message-content {
    white-space: pre-wrap;
}

/* Bot Message Bubble */
.chat-bubble.bot {
  background-color: #e9e9eb;
  color: #333;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

/* User Message Bubble */
.chat-bubble.user {
  background-color: #a47551;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

/* System & Error Bubbles */
.chat-bubble.system {
  font-size: 12px;
  color: #666;
  text-align: center;
  background-color: transparent;
  width: 100%;
  max-width: 100%;
  align-self: center;
}

.chat-bubble.error {
  background-color: #fbe2e2;
  color: #b52a2a;
  border: 1px solid #e1b0b0;
  align-self: flex-start;
}

/* Loading Animation */
.chat-bubble.loading {
  padding: 15px;
}

.typing-animation {
  display: flex;
  gap: 2px;
}

.typing-animation span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  animation: typing 1s infinite ease-in-out;
}
.typing-animation span:nth-child(2) { animation-delay: 0.2s; }
.typing-animation span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* ML Prediction Info (Dev Mode) */
.ml-prediction-info {
  font-size: 10px;
  color: #6c757d;
  margin-top: 8px;
  border-top: 1px solid #ccc;
  padding-top: 5px;
  opacity: 0.8;
}
.user .ml-prediction-info {
  color: rgba(255, 255, 255, 0.7);
  border-top-color: rgba(255, 255, 255, 0.5);
}

/* Feedback Buttons */
.feedback-buttons {
  margin-top: 8px;
  display: flex;
  gap: 5px;
  justify-content: flex-end;
}

.feedback-btn {
  background: rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.feedback-btn:hover {
  background: rgba(0,0,0,0.1);
}

/* Input Area */
.chatbot-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;
  background-color: #fff;
  align-items: center;
}

.chatbot-input input {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 10px 15px;
  font-size: 14px;
  outline: none;
}

.chatbot-input input:focus {
  border-color: #a47551;
}

.chatbot-input input:disabled {
  background: #f8f8f8;
  color: #999;
  cursor: not-allowed;
}

.chatbot-input button {
  background-color: #a47551;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-left: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chatbot-input button:hover:not(:disabled) {
  background-color: #8b5a2b;
  transform: scale(1.1);
}

.chatbot-input button:disabled {
  background-color: #c09b82;
  cursor: not-allowed;
  transform: scale(1);
}

.chatbot-input button.rephrase-btn {
    background-color: #6c757d;
    width: 36px;
    height: 36px;
    font-size: 18px;
}

.chatbot-input button.rephrase-btn:hover:not(:disabled) {
    background-color: #545b62;
}

.chatbot-input button.rephrase-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #c09b82 !important;
}

/* Feedback Modal */
.feedback-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.feedback-modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.feedback-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.feedback-header button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-section {
  margin-bottom: 15px;
}

.feedback-section label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.feedback-section p {
  background: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  margin: 0;
  font-style: italic;
  font-size: 14px;
  color: #666;
  border: 1px solid #e0e0e0;
}

.feedback-section select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  background-color: white;
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #a47551;
  color: white;
}

.btn-primary:hover {
  background-color: #8b5a2b;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

/* Responsive Design */
@media (max-width: 420px) {
  .chatbot-popup {
    width: 320px;
    height: 440px;
    bottom: 70px;
    right: 10px;
  }

  .chatbot-widget {
    bottom: 16px;
    right: 16px;
  }

  .chat-bubble {
    max-width: 85%;
    font-size: 13px;
  }
}
`;

// --- Feedback Modal Component ---
const FeedbackModal = ({
  isOpen,
  feedbackData,
  onClose,
  onSubmit,
  isDevMode,
}) => {
  const [actualIntent, setActualIntent] = useState('');

  if (!isOpen || !feedbackData) return null;

  const handleSubmit = () => {
    onSubmit(
      feedbackData.text,
      feedbackData.predicted_intent,
      actualIntent,
      false
    );
    setActualIntent('');
    onClose();
  };

  const INTENT_OPTIONS = [
    { value: '', label: '의도를 선택하세요' },
    { value: '예약_문의', label: '예약 문의' },
    { value: '요금_문의', label: '요금 문의' },
    { value: '이용_방법', label: '이용 방법' },
    { value: '문제_해결', label: '문제 해결' },
    { value: '계정_관리', label: '계정 관리' },
    { value: '인사', label: '인사' },
    { value: '감사', label: '감사' },
    { value: '기타_문의', label: '기타 문의' },
  ];

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <div className="feedback-header">
          <h3>🤖 피드백 제출</h3>
          <button onClick={onClose} title="닫기">
            ✖
          </button>
        </div>

        <div className="feedback-section">
          <label>메시지:</label>
          <p>"{feedbackData.text}"</p>
        </div>

        {isDevMode && (
          <div className="feedback-section">
            <label>예측된 의도:</label>
            <p>{feedbackData.predicted_intent}</p>
          </div>
        )}

        <div className="feedback-section">
          <label>실제 의도:</label>
          <select
            value={actualIntent}
            onChange={(e) => setActualIntent(e.target.value)}
          >
            {INTENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="feedback-actions">
          <button onClick={onClose} className="btn-secondary">
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={!actualIntent}
          >
            제출
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Message Bubble Component ---
const MessageBubble = ({
  msg,
  isDevMode,
  onOpenFeedback,
  onSubmitFeedback,
}) => {
  const handleQuickFeedback = (satisfied) => {
    if (msg.ml_prediction) {
      onSubmitFeedback(
        msg.text || '',
        msg.ml_prediction.ml_intent,
        null,
        satisfied
      );
    }
  };

  const openDetailedFeedback = () => {
    if (msg.ml_prediction) {
      onOpenFeedback({
        text: msg.text || '',
        predicted_intent: msg.ml_prediction.ml_intent,
        messageId: msg.messageId,
      });
    }
  };

  const bubbleClass = `chat-bubble ${
    msg.role === 'user'
      ? 'user'
      : msg.role === 'error'
      ? 'error'
      : msg.role === 'system'
      ? 'system'
      : 'bot'
  }`;

  return (
    <div className={bubbleClass}>
      <div className="message-content">{msg.text}</div>

      {isDevMode && msg.ml_prediction && (
        <div className="ml-prediction-info">
          🤖 의도: {msg.ml_prediction.ml_intent} | 신뢰도:{' '}
          {(msg.ml_prediction.ml_confidence * 100).toFixed(1)}% | 최종:{' '}
          {msg.ml_prediction.final_intent} (
          {msg.ml_prediction.prediction_source})
        </div>
      )}

      {isDevMode &&
        msg.role === 'assistant' &&
        msg.ml_prediction &&
        msg.messageId && (
          <div className="feedback-buttons">
            <button
              onClick={() => handleQuickFeedback(true)}
              className="feedback-btn"
              title="좋음"
            >
              👍
            </button>
            <button
              onClick={() => handleQuickFeedback(false)}
              className="feedback-btn"
              title="나쁨"
            >
              👎
            </button>
            <button
              onClick={openDetailedFeedback}
              className="feedback-btn"
              title="상세 피드백"
            >
              🔧
            </button>
          </div>
        )}
    </div>
  );
};

// --- Main ChatbotWidget Component ---
const ChatbotWidget = ({ isDevMode = false }) => {
  // States
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [mlStats, setMlStats] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  // Refs
  const messagesRef = useRef(null);
  const endRef = useRef(null);
  const welcomedRef = useRef(false);
  const composingRef = useRef(false);

  // Inject CSS
  useEffect(() => {
    const styleId = 'chatbot-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = cssStyles;
      document.head.appendChild(style);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // ✅ 수정된 부분: 안정화된 API 객체 생성
  const api = useMemo(() => {
    return axios.create({
      baseURL:
        process.env.NODE_ENV === 'production'
          ? 'https://your-prod-domain'
          : 'http://localhost:5000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, []);

  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      console.log('🆔 New session created:', newSessionId);
    }
  }, [sessionId, generateSessionId]);

  // ✅ 수정된 부분: ML Stats 로딩 최적화 (무한 호출 방지)
  useEffect(() => {
    const loadMlStats = async () => {
      try {
        const response = await api.get('/ml_stats');
        setMlStats(response.data);
        console.log('📊 ML stats loaded:', response.data);
      } catch (error) {
        console.error('Failed to load ML stats:', error);
      }
    };

    // 개발 모드이고 아직 ML 통계를 로드하지 않았을 때만 실행
    if (isDevMode && !mlStats) {
      loadMlStats();
    }
  }, [isDevMode]); // api를 의존성 배열에서 제거

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      const willOpen = !prev;
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
      return willOpen;
    });
  };

  const appendToChat = useCallback((entry) => {
    setChat((prev) => [...prev, entry]);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage = {
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    appendToChat(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/get_response', {
        message: userMessage.text,
        session_id: sessionId,
      });

      const botMessage = {
        role: 'assistant',
        text: res.data.response,
        timestamp: new Date().toISOString(),
        ml_prediction: res.data.ml_prediction,
        messageId: Date.now(),
      };

      appendToChat(botMessage);

      if (res.data.session_id && res.data.session_id !== sessionId) {
        setSessionId(res.data.session_id);
      }
    } catch (err) {
      console.error('❌ Server error:', err);
      let errorMessage = '서버와 연결할 수 없어요. 잠시 후 다시 시도해주세요.';

      if (err.response?.status === 429) {
        errorMessage = '요청이 너무 많아요. 잠시 후 다시 시도해주세요.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = '응답 시간이 초과되었어요. 다시 시도해주세요.';
      }

      appendToChat({
        role: 'error',
        text: errorMessage,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, appendToChat, api]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !composingRef.current) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleRephrase = async () => {
    if (!input.trim() || isRephrasing) return;

    setIsRephrasing(true);
    try {
      const response = await api.post('/get_response', {
        message: `다음 문장을 더 정중하고 명확하게 다시 써주세요: "${input}"`,
        session_id: sessionId,
      });

      setInput(response.data.response.replace(/["'"]/g, ''));
    } catch (error) {
      console.error('문장 다듬기 실패:', error);
    } finally {
      setIsRephrasing(false);
    }
  };

  const openFeedback = (feedbackData) => {
    setCurrentFeedback(feedbackData);
    setShowFeedback(true);
  };

  const submitFeedback = async (
    text,
    predicted_intent,
    actual_intent,
    user_satisfied = true
  ) => {
    try {
      await api.post('/feedback', {
        text,
        predicted_intent,
        actual_intent,
        user_satisfied,
      });

      console.log('✅ 피드백 제출 완료');

      // 피드백 후 ML 통계 새로고침 (개발 모드에서만)
      if (isDevMode) {
        try {
          const response = await api.get('/ml_stats');
          setMlStats(response.data);
        } catch (error) {
          console.error('ML 통계 새로고침 실패:', error);
        }
      }
    } catch (error) {
      console.error('❌ 피드백 제출 실패:', error);
    }
  };

  return (
    <>
      <div className="chatbot-widget">
        <button
          onClick={handleToggleOpen}
          className="chatbot-button"
          aria-label="챗봇 열기/닫기"
        >
          {isOpen ? '✖' : '💬'}
        </button>

        {isOpen && (
          <div className="chatbot-popup">
            <div className="chatbot-header">
              <span>🚗 MOCA 고객지원</span>
              <button
                onClick={handleToggleOpen}
                aria-label="챗봇 닫기"
                className="header-btn"
              >
                ✖
              </button>
            </div>

            {isDevMode && mlStats && (
              <div className="ml-stats-banner">
                📊 ML: {mlStats.training_data_count}개 학습, 정확도:{' '}
                {(mlStats.recent_accuracy * 100).toFixed(1)}%
                {mlStats.model_loaded ? ' ✅' : ' ❌'}
              </div>
            )}

            <div className="chatbot-messages" ref={messagesRef}>
              {chat.map((msg, i) => (
                <MessageBubble
                  key={i}
                  msg={msg}
                  isDevMode={isDevMode}
                  onOpenFeedback={openFeedback}
                  onSubmitFeedback={submitFeedback}
                />
              ))}
              {isLoading && (
                <div className="chat-bubble bot loading">
                  <div className="typing-animation">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="chatbot-input">
              <input
                type="text"
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => (composingRef.current = true)}
                onCompositionEnd={() => (composingRef.current = false)}
                disabled={isLoading || isRephrasing}
                aria-label="메시지 입력"
              />
              <button
                onClick={handleRephrase}
                disabled={isRephrasing || isLoading || !input.trim()}
                className="rephrase-btn"
                title="문장 다듬기"
              >
                ✨
              </button>
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                aria-label="메시지 전송"
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
          </div>
        )}

        <FeedbackModal
          isOpen={showFeedback}
          feedbackData={currentFeedback}
          onClose={() => setShowFeedback(false)}
          onSubmit={submitFeedback}
          isDevMode={isDevMode}
        />
      </div>
    </>
  );
};

export default ChatbotWidget;
