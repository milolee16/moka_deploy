import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Chatbot.css";

/**
 * 페이지 내 임베드형 챗봇 (강화판)
 * - 처음 열릴 때 환영 멘트 + 인풋 자동 포커스
 * - 자동 스크롤 (첫 회 auto, 이후 smooth)
 * - IME(한글) 조합 중 Enter 전송 방지
 * - axios POST 실패/400시 GET 폴백 (?message=)
 * - 응답 메타(FAQ/LLM/intent/score) 뱃지 표시
 */
const Chatbot = ({ isOpen = true }) => {
    const [input, setInput] = useState("");
    const [chat, setChat] = useState([]); // { role: 'user'|'assistant', text, meta? }
    const [loading, setLoading] = useState(false);

    const hasWelcomedRef = useRef(false);
    const prevOpenRef = useRef(isOpen);

    const listRef = useRef(null);
    const endRef = useRef(null);
    const firstScrollDoneRef = useRef(false);
    const inputRef = useRef(null);
    const composingRef = useRef(false); // IME 한글 조합 중 여부

    // API Base URL (env > dev/prod)
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

    // 열릴 때 환영 멘트 1회 + 인풋 포커스
    useEffect(() => {
        const justOpened = !prevOpenRef.current && isOpen;
        prevOpenRef.current = isOpen;

        if ((justOpened || isOpen) && !hasWelcomedRef.current && chat.length === 0) {
            setChat([
                {
                    role: "assistant",
                    text:
                        "안녕하세요. MOCA 고객지원 챗봇입니다.\n" +
                        "예약/변경, 결제/환불, 차량/보험, 계정/로그인 관련 문의를 도와드릴게요!",
                },
            ]);
            hasWelcomedRef.current = true;
            // 살짝 지연 후 포커스
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [isOpen, chat.length]);

    // 자동 스크롤
    useEffect(() => {
        if (!isOpen) return;
        requestAnimationFrame(() => {
            if (endRef.current) {
                endRef.current.scrollIntoView({
                    behavior: firstScrollDoneRef.current ? "smooth" : "auto",
                    block: "end",
                });
            } else if (listRef.current) {
                const el = listRef.current;
                el.scrollTop = el.scrollHeight;
            }
            firstScrollDoneRef.current = true;
        });
    }, [chat, isOpen, loading]);

    const safeAppend = (entry) => setChat((prev) => [...prev, entry]);

    const sendMessage = async () => {
        const msg = input.trim();
        if (!msg || loading) return;

        safeAppend({ role: "user", text: msg });
        setInput("");
        setLoading(true);

        try {
            // 1) 기본: POST
            const { data } = await api.post(`/get_response`, { message: msg });
            const text = data?.response ?? "죄송해요, 다시 시도해주세요.";
            safeAppend({ role: "assistant", text, meta: data?.source || {} });
        } catch (err) {
            // 2) 폴백: GET (?message=) — 백엔드가 GET도 허용하도록 설정됨
            try {
                const { data } = await api.get(`/get_response`, { params: { message: msg } });
                const text = data?.response ?? "죄송해요, 다시 시도해주세요.";
                safeAppend({ role: "assistant", text, meta: data?.source || {} });
            } catch (err2) {
                console.error("서버 오류:", err2);
                safeAppend({
                    role: "assistant",
                    text: "⚠️ 서버와 연결할 수 없어요. 잠시 후 다시 시도해 주세요.",
                });
            }
        } finally {
            setLoading(false);
            // 전송 후 포커스 유지
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const onKeyDown = (e) => {
        // 한글 IME 조합 중에는 Enter로 전송하지 않음
        if (composingRef.current) return;
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-box" ref={listRef}>
                {chat.map((msg, i) => (
                    <div key={i} className={`chat-bubble ${msg.role === "user" ? "user" : "bot"}`}>
                        <div>{msg.text}</div>
                        {msg.role === "assistant" && msg.meta && (
                            <div className="chat-meta">
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

            <div className="chat-input">
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
    );
};

export default Chatbot;
