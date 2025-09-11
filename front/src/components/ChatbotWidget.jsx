import { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./ChatbotWidget.css";

/**
 * 우하단 플로팅 챗봇 위젯 (강화판)
 * - 한글 IME 입력 중 Enter 방지
 * - POST 실패/400시 GET 폴백 (?message=)
 * - 자동 스크롤/첫 오픈 환영/인풋 포커스
 * - API 응답 source(FAQ/LLM/intent/score) 뱃지 표시
 */
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 세션 관리
  const [sessionId, setSessionId] = useState(null);
  const welcomedRef = useRef(false);

  // UI 관련 refs
  const messagesRef = useRef(null);
  const endRef = useRef(null);
  const firstScrollDoneRef = useRef(false);
  const inputRef = useRef(null);

  // API Base URL (env → dev/prod)
  const RAW_BASE =
    (import.meta?.env?.VITE_CHATBOT_API || "").trim() ||
    (import.meta?.env?.MODE === "development"
      ? "http://127.0.0.1:5000"
      : "https://YOUR-PROD-DOMAIN");
  const BASE_URL = RAW_BASE.endsWith("/") ? RAW_BASE.slice(0, -1) : RAW_BASE;

  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
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
      console.log("🆔 새 세션 생성:", newSessionId);
    }
  }, [sessionId]);

  const handleToggleOpen = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    // 처음 열 때만 환영 메시지 표시
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
  };

  const safeAppend = (entry) => setChat((prev) => [...prev, entry]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage = {
      role: "user",
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // UI 업데이트
    setChat((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("📤 메시지 전송:", {
        message: userMessage.text,
        session_id: sessionId,
      });

      const res = await axios.post(
        "http://127.0.0.1:5000/get_response",
        {
          message: userMessage.text,
          session_id: sessionId,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000, // 30초 타임아웃
        }
      );

      console.log("📥 응답 받음:", res.data);

      const botMessage = {
        role: "assistant",
        text: res.data.response,
        timestamp: new Date().toISOString(),
      };

      setChat((prev) => [...prev, botMessage]);

      // 세션 ID가 응답에 포함되어 있으면 업데이트
      if (res.data.session_id && res.data.session_id !== sessionId) {
        setSessionId(res.data.session_id);
        console.log("🆔 세션 ID 업데이트:", res.data.session_id);
      }
    } catch (err) {
      console.error("❌ 서버 오류:", err);

      let errorMessage = "서버와 연결할 수 없어요.";

      if (err.code === "ECONNABORTED") {
        errorMessage = "응답 시간이 초과되었어요. 다시 시도해 주세요.";
      } else if (err.response?.status === 500) {
        errorMessage =
          "서버에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.";
      } else if (err.response?.status === 400) {
        errorMessage = "메시지를 이해할 수 없어요. 다시 입력해 주세요.";
      }

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ ${errorMessage}`,
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 대화가 업데이트될 때마다 자동 스크롤
  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      if (endRef.current) {
        endRef.current.scrollIntoView({
          behavior: firstScrollDoneRef.current ? "smooth" : "auto",
          block: "end",
        });
      } else if (messagesRef.current) {
        const el = messagesRef.current;
        el.scrollTop = el.scrollHeight;
      }
      firstScrollDoneRef.current = true;
    });
  }, [chat, isOpen, loading]);

  const onKeyDown = (e) => {
    // 한글 IME 조합 중에는 Enter로 전송하지 않음
    if (composingRef.current) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 엔터키 핸들링
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 세션 정보 디버깅 (개발 모드에서만)
  const showSessionInfo = () => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 현재 세션 정보:", {
        sessionId,
        messageCount: chat.length,
        isOpen,
        isLoading,
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
        {isLoading ? "⏳" : "🤔"}
      </button>

      {isOpen && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <span>
              MOCA 챗봇
              {process.env.NODE_ENV === "development" && sessionId && (
                <span style={{ fontSize: "10px", opacity: 0.7 }}>
                  {` (${sessionId.slice(-8)})`}
                </span>
              )}
            </span>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="chatbot-messages" ref={messagesRef}>
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${
                  msg.role === "user" ? "user" : "bot"
                } ${msg.isError ? "error" : ""}`}
                title={
                  msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString()
                    : ""
                }
              >
                {msg.text}
              </div>
            ))}

            {isLoading && (
              <div className="chat-bubble bot loading">
                <span>💭 생각하는 중...</span>
              </div>
            )}

            {/* 스크롤 앵커 */}
            <div ref={endRef} />
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isLoading ? "응답을 기다리는 중..." : "메시지를 입력하세요..."
              }
              disabled={isLoading || !sessionId}
              maxLength={500}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim() || !sessionId}
            >
              {isLoading ? "⏳" : "전송"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
