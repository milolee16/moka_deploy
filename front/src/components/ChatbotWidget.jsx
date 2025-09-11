import { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";

// --- CSS Styles ---
// All styles are now embedded within the component file to avoid import errors.
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
  background-color: #007bff;
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
  background-color: #0056b3;
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
  background-color: #007bff;
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
  margin-right: auto; /* Push buttons to the right */
}

.chatbot-header button.header-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.chatbot-header button.summarize-btn {
    font-size: 18px;
    opacity: 0.9;
    transition: opacity 0.2s;
}

.chatbot-header button.summarize-btn:hover {
    opacity: 1;
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
  background-color: #007bff;
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

.typing-animation span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  margin: 0 2px;
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
  border-color: #007bff;
}

.chatbot-input button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-left: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.chatbot-input button:hover {
  background-color: #0056b3;
}

.chatbot-input button:disabled {
  background-color: #a0c7ef;
  cursor: not-allowed;
}

.chatbot-input button.rephrase-btn {
    background: none;
    border: 1px solid #ccc;
    color: #007bff;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    margin-left: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
}

.chatbot-input button.rephrase-btn:hover {
    background-color: #f0f0f0;
    border-color: #007bff;
}

.chatbot-input button.rephrase-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: transparent !important;
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
  z-index: 1001;
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
}
.feedback-header button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.feedback-section {
  margin-bottom: 15px;
}

.feedback-section label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.feedback-section p {
  background: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  margin: 0;
  font-style: italic;
  font-size: 14px;
}

.feedback-section select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
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
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
`;

// Component to inject the CSS styles into the document head
const ChatbotStyles = () => <style>{cssStyles}</style>;

// Constants for intent options to make the feedback form more maintainable
const INTENT_OPTIONS = [
  { value: "예약_문의", label: "예약 문의" },
  { value: "요금_문의", label: "요금 문의" },
  { value: "이용_방법", label: "이용 방법" },
  { value: "문제_해결", label: "문제 해결" },
  { value: "계정_관리", label: "계정 관리" },
  { value: "인사", label: "인사" },
  { value: "감사", label: "감사" },
  { value: "기타_문의", label: "기타 문의" },
];

/**
 * A single message bubble component.
 * @param {object} props - The component props.
 * @param {object} props.msg - The message object.
 * @param {boolean} props.isDevMode - Flag for development mode.
 * @param {function} props.onOpenFeedback - Function to open the feedback modal.
 * @param {function} props.onSubmitFeedback - Function to submit quick "thumbs up" feedback.
 */
const MessageBubble = ({
  msg,
  isDevMode,
  onOpenFeedback,
  onSubmitFeedback,
}) => {
  const bubbleClasses = `chat-bubble ${
    msg.role === "user"
      ? "user"
      : msg.isError
      ? "error"
      : msg.isSystem
      ? "system"
      : "bot"
  }`;

  return (
    <div
      className={bubbleClasses}
      title={msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}
    >
      <div className="message-content">{msg.text}</div>

      {/* Renders ML prediction info in development mode */}
      {isDevMode && msg.ml_prediction && (
        <div className="ml-prediction-info">
          🤖 {msg.ml_prediction.prediction_source}:{" "}
          {msg.ml_prediction.final_intent}
          {msg.ml_prediction.ml_confidence &&
            ` (${(msg.ml_prediction.ml_confidence * 100).toFixed(0)}%)`}
        </div>
      )}

      {/* Renders feedback buttons for assistant messages */}
      {msg.role === "assistant" &&
        !msg.isError &&
        !msg.isSystem &&
        msg.messageId && (
          <div className="feedback-buttons">
            <button
              className="feedback-btn thumbs-up"
              onClick={() =>
                onSubmitFeedback(msg.messageId, { satisfied: true })
              }
              title="도움이 되었어요"
              aria-label="도움이 되었어요"
            >
              👍
            </button>
            <button
              className="feedback-btn thumbs-down"
              onClick={() => onOpenFeedback(msg.messageId)}
              title="개선이 필요해요"
              aria-label="개선이 필요해요"
            >
              👎
            </button>
          </div>
        )}
    </div>
  );
};

/**
 * Feedback Modal Component.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {object} props.feedbackData - The data for the feedback.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSubmit - Function to submit the feedback.
 * @param {boolean} props.isDevMode - Flag for development mode.
 */
const FeedbackModal = ({
  isOpen,
  feedbackData,
  onClose,
  onSubmit,
  isDevMode,
}) => {
  if (!isOpen || !feedbackData) return null;

  const handleSubmit = () => {
    const correctIntent = document.getElementById("correct-intent")?.value;
    if (correctIntent) {
      onSubmit(feedbackData.messageId, {
        satisfied: false,
        correctIntent,
      });
    }
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <div className="feedback-header">
          <h3>피드백을 주세요</h3>
          <button onClick={onClose} aria-label="닫기">
            ✖
          </button>
        </div>
        <div className="feedback-content">
          <div className="feedback-section">
            <label>사용자 질문:</label>
            <p>"{feedbackData.userMessage}"</p>
          </div>
          <div className="feedback-section">
            <label>챗봇 응답:</label>
            <p>"{feedbackData.botResponse}"</p>
          </div>
          {isDevMode && (
            <div className="feedback-section">
              <label>AI 예측:</label>
              <p>
                {feedbackData.prediction.final_intent} (
                {feedbackData.prediction.prediction_source})
              </p>
            </div>
          )}
          <div className="feedback-section">
            <label htmlFor="correct-intent">올바른 의도를 선택해주세요:</label>
            <select
              id="correct-intent"
              defaultValue={feedbackData.prediction.final_intent}
            >
              {INTENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="feedback-actions">
          <button className="btn-secondary" onClick={onClose}>
            취소
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            피드백 전송
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Chatbot widget with AutoML feedback functionality and Gemini API features.
 */
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [mlStats, setMlStats] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);

  const welcomedRef = useRef(false);
  const messagesRef = useRef(null);
  const endRef = useRef(null);
  const firstScrollDoneRef = useRef(false);
  const composingRef = useRef(false);

  const isDevMode = process.env.NODE_ENV === "development";

  const BASE_URL = isDevMode
    ? "http://localhost:5000"
    : "https://YOUR-PROD-DOMAIN";

  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: false,
  });

  const callGeminiApi = async (prompt) => {
    const apiKey = ""; // Per instructions, leave empty.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(`API request failed with status ${response.status}`);
      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate && candidate.content?.parts?.[0]?.text) {
        return candidate.content.parts[0].text;
      } else {
        throw new Error("Invalid response structure from Gemini API");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return null;
    }
  };

  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      console.log("🆔 New session created:", newSessionId);
    }
  }, [sessionId, generateSessionId]);

  useEffect(() => {
    const loadMlStats = async () => {
      try {
        const response = await api.get("/ml_stats");
        setMlStats(response.data);
        console.log("📊 ML stats loaded:", response.data);
      } catch (error) {
        console.error("Failed to load ML stats:", error);
      }
    };
    if (isDevMode) loadMlStats();
  }, [isDevMode, api]);

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      const willOpen = !prev;
      if (willOpen && !welcomedRef.current && chat.length === 0) {
        setChat([
          {
            role: "assistant",
            text:
              "안녕하세요! MOCA 고객지원 챗봇입니다.\n" +
              "차량 예약, 요금 문의, 이용 방법 등 무엇이든 물어보세요.\n" +
              "대화 내용을 기억하고 있으니 편하게 대화하세요! 😊",
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
      role: "user",
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };
    appendToChat(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/get_response", {
        message: userMessage.text,
        session_id: sessionId,
      });
      const botMessage = {
        role: "assistant",
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
      console.error("❌ Server error:", err);
      let errorMessage = "서버와 연결할 수 없어요.";
      // Error handling logic...
      appendToChat({
        role: "assistant",
        text: `⚠️ ${errorMessage}`,
        timestamp: new Date().toISOString(),
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, appendToChat, api, BASE_URL]);

  const handleSummarize = useCallback(async () => {
    if (isSummarizing || chat.length < 2) return;
    setIsSummarizing(true);
    appendToChat({
      role: "system",
      text: "✨ 대화 내용을 요약하는 중입니다...",
      timestamp: new Date().toISOString(),
      isSystem: true,
    });

    const conversationHistory = chat
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => `${msg.role === "user" ? "사용자" : "챗봇"}: ${msg.text}`)
      .join("\n");
    const prompt = `다음 고객 지원 대화 내용을 한국어로 간결하게 한 문단으로 요약해 주세요:\n\n---\n${conversationHistory}\n---`;
    const summary = await callGeminiApi(prompt);

    if (summary) {
      appendToChat({
        role: "system",
        text: `✨ 대화 요약:\n${summary}`,
        timestamp: new Date().toISOString(),
        isSystem: true,
      });
    } else {
      appendToChat({
        role: "system",
        text: "⚠️ 요약 생성에 실패했습니다.",
        timestamp: new Date().toISOString(),
        isSystem: true,
      });
    }
    setIsSummarizing(false);
  }, [chat, isSummarizing, appendToChat]);

  const handleRephrase = useCallback(async () => {
    if (!input.trim() || isRephrasing) return;
    setIsRephrasing(true);
    const originalInput = input;
    setInput("✨ 문장을 다듬는 중...");
    const prompt = `다음 고객 지원 문의 내용을 더 명확하고 정중한 한국어 문장으로 바꿔주세요. 결과는 바뀐 문장만 간결하게 보여주세요:\n\n"${originalInput}"`;
    const rephrasedText = await callGeminiApi(prompt);
    if (rephrasedText) {
      setInput(rephrasedText.trim());
    } else {
      setInput(originalInput);
    }
    setIsRephrasing(false);
  }, [input, isRephrasing]);

  const submitFeedback = useCallback(
    async (messageId, feedbackData) => {
      try {
        const messageIndex = chat.findIndex(
          (msg) => msg.messageId === messageId
        );
        const message = chat[messageIndex];
        const userMessage = chat[messageIndex - 1];
        if (!message || !userMessage || !message.ml_prediction) return;
        const feedbackPayload = {
          text: userMessage.text,
          predicted_intent: message.ml_prediction.final_intent,
          actual_intent: feedbackData.correctIntent,
          user_satisfied: feedbackData.satisfied,
        };
        await api.post("/feedback", feedbackPayload);
        setShowFeedback(false);
        setCurrentFeedback(null);
        appendToChat({
          role: "system",
          text: "📝 피드백 감사합니다!",
          timestamp: new Date().toISOString(),
          isSystem: true,
        });
      } catch (error) {
        console.error("❌ Failed to submit feedback:", error);
      }
    },
    [chat, appendToChat, api]
  );

  const openFeedback = useCallback(
    (messageId) => {
      const messageIndex = chat.findIndex((msg) => msg.messageId === messageId);
      const message = chat[messageIndex];
      const userMessage = chat[messageIndex - 1];
      if (message && userMessage && message.ml_prediction) {
        setCurrentFeedback({
          messageId,
          userMessage: userMessage.text,
          botResponse: message.text,
          prediction: message.ml_prediction,
        });
        setShowFeedback(true);
      }
    },
    [chat]
  );

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => {
      if (endRef.current) {
        endRef.current.scrollIntoView({
          behavior: firstScrollDoneRef.current ? "smooth" : "auto",
          block: "end",
        });
      }
      firstScrollDoneRef.current = true;
    });
  }, [chat, isOpen]);

  const handleKeyDown = (e) => {
    if (composingRef.current) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <ChatbotStyles />
      <div className="chatbot-widget">
        <button
          className="chatbot-button"
          onClick={handleToggleOpen}
          title="MOCA 챗봇"
          aria-label="챗봇 열기/닫기"
        >
          {isOpen ? "✖️" : "💬"}
        </button>

        {isOpen && (
          <div className="chatbot-popup">
            <div className="chatbot-header">
              <span>
                MOCA 챗봇
                {isDevMode && sessionId && (
                  <span
                    style={{ fontSize: "10px", opacity: 0.7 }}
                  >{` (${sessionId.slice(-8)})`}</span>
                )}
              </span>
              <button
                onClick={handleSummarize}
                disabled={isSummarizing || chat.length < 2}
                className="header-btn summarize-btn"
                title="대화 요약"
              >
                {isSummarizing ? "⏳" : "✨"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="챗봇 닫기"
                className="header-btn"
              >
                ✖
              </button>
            </div>

            {isDevMode && mlStats && (
              <div className="ml-stats-banner">
                📊 ML: {mlStats.training_data_count}개 학습, 정확도:{" "}
                {(mlStats.recent_accuracy * 100).toFixed(1)}%
                {mlStats.model_loaded ? " ✅" : " ❌"}
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
                    <span></span>
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
                {isLoading ? "⏳" : "📤"}
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
