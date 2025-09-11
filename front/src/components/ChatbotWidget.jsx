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
  const [chat, setChat] = useState([]); // { role: 'user'|'assistant', text, meta? }
  const [loading, setLoading] = useState(false);

  const welcomedRef = useRef(false);
  const composingRef = useRef(false); // IME 조합중 여부
  const messagesRef = useRef(null);
  const endRef = useRef(null);
  const firstScrollDoneRef = useRef(false);
  const inputRef = useRef(null);

  // API Base URL (env → dev/prod)
  const RAW_BASE =
      (import.meta?.env?.VITE_CHATBOT_API || "").trim() ||
      (import.meta?.env?.MODE === "development" ? "http://127.0.0.1:5000" : "https://YOUR-PROD-DOMAIN");
  const BASE_URL = RAW_BASE.endsWith("/") ? RAW_BASE.slice(0, -1) : RAW_BASE;

  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  const handleToggleOpen = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    if (willOpen) {
      // 환영 멘트 1회
      if (!welcomedRef.current && chat.length === 0) {
        setChat([
          {
            role: "assistant",
            text: "안녕하세요. MOCA 고객지원 챗봇입니다.\n무엇을 도와드릴까요?",
          },
        ]);
        welcomedRef.current = true;
      }
      // 인풋 포커스
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const safeAppend = (entry) => setChat((prev) => [...prev, entry]);

  const sendMessage = async () => {
    const msg = (input || "").trim();
    if (!msg || loading) return;

    // 사용자 메세지 반영
    safeAppend({ role: "user", text: msg });
    setInput("");
    setLoading(true);

    try {
      // 1) 기본: POST
      const { data } = await api.post(`/get_response`, { message: msg });
      const text = data?.response ?? "죄송해요, 다시 시도해주세요.";
      safeAppend({ role: "assistant", text, meta: data?.source || {} });
    } catch (err) {
      // 2) 폴백: GET (?message=) — 백엔드가 GET 허용하도록 세팅되어 있음
      try {
        const { data } = await api.get(`/get_response`, { params: { message: msg } });
        const text = data?.response ?? "죄송해요, 다시 시도해주세요.";
        safeAppend({ role: "assistant", text, meta: data?.source || {} });
      } catch (err2) {
        console.error("서버 오류:", err2);
        safeAppend({ role: "assistant", text: "⚠️ 서버와 연결할 수 없어요. 잠시 후 다시 시도해 주세요." });
      }
    } finally {
      setLoading(false);
    }
  };

  // 자동 스크롤
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

  return (
      <div className="chatbot-widget">
        <button className="chatbot-button" onClick={handleToggleOpen} aria-label="MOCA Chatbot">
          ❔
        </button>

        {isOpen && (
            <div className="chatbot-popup">
              <div className="chatbot-header">
                <span>MOCA 챗봇</span>
                <button onClick={() => setIsOpen(false)} aria-label="Close">✖</button>
              </div>

              <div className="chatbot-messages" ref={messagesRef}>
                {chat.map((msg, i) => (
                    <div key={i} className={`chat-bubble ${msg.role === "user" ? "user" : "bot"}`}>
                      <div>{msg.text}</div>
                      {msg.role === "assistant" && msg.meta && (
                          <div className="meta">
                            {msg.meta.type && (
                                <span className={`pill ${msg.meta.type}`}>{String(msg.meta.type).toUpperCase()}</span>
                            )}
                            {msg.meta.intent && <span className="pill">{msg.meta.intent}</span>}
                            {typeof msg.meta.score === "number" && <span className="pill">score {msg.meta.score}</span>}
                            {msg.meta.matched_question && <span className="pill">FAQ 매칭</span>}
                          </div>
                      )}
                    </div>
                ))}
                {loading && (
                    <div className="chat-bubble bot">
                      <div className="typing">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="chatbot-input">
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요 (Enter 전송, Shift+Enter 줄바꿈)"
                    onKeyDown={onKeyDown}
                    onCompositionStart={() => (composingRef.current = true)}
                    onCompositionEnd={() => (composingRef.current = false)}
                    disabled={loading}
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()}>
                  전송
                </button>
              </div>
            </div>
        )}
      </div>
  );
};

export default ChatbotWidget;
