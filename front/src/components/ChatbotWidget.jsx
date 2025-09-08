import { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./ChatbotWidget.css";

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [chat, setChat] = useState([]);
    const welcomedRef = useRef(false);

    // ✅ 메시지 영역 & 끝 앵커 ref
    const messagesRef = useRef(null);
    const endRef = useRef(null);
    const firstScrollDoneRef = useRef(false);

    const handleToggleOpen = () => {
        const willOpen = !isOpen;
        setIsOpen(willOpen);

        if (willOpen && !welcomedRef.current && chat.length === 0) {
            setChat([
                {
                    role: "assistant",
                    text:
                        "안녕하세요. MOCA 고객지원 챗봇입니다.\n" +
                        "예약/변경, 결제/환불, 차량/보험, 계정/로그인 관련 문의를 도와드립니다.",
                },
            ]);
            welcomedRef.current = true;
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        setChat((prev) => [...prev, { role: "user", text: input }]);

        try {
            const res = await axios.post(
                "http://localhost:5000/get_response",
                { message: input },
                { headers: { "Content-Type": "application/json" } }
            );

            setChat((prev) => [...prev, { role: "assistant", text: res.data.response }]);
        } catch (err) {
            console.error("서버 오류:", err);
            setChat((prev) => [
                ...prev,
                { role: "assistant", text: "⚠️ 서버와 연결할 수 없어요." },
            ]);
        }

        setInput("");
    };

    // ✅ 대화가 업데이트될 때마다 자동 스크롤
    useEffect(() => {
        if (!isOpen) return;

        // 렌더가 끝난 직후 스크롤 보정
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
    }, [chat, isOpen]);

    return (
        <div className="chatbot-widget">
            <button className="chatbot-button" onClick={handleToggleOpen}>
                ❔
            </button>

            {isOpen && (
                <div className="chatbot-popup">
                    <div className="chatbot-header">
                        <span>MOCA 챗봇</span>
                        <button onClick={() => setIsOpen(false)}>✖</button>
                    </div>

                    {/* ✅ ref 연결 */}
                    <div className="chatbot-messages" ref={messagesRef}>
                        {chat.map((msg, i) => (
                            <div
                                key={i}
                                className={`chat-bubble ${msg.role === "user" ? "user" : "bot"}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {/* ✅ 스크롤 앵커 */}
                        <div ref={endRef} />
                    </div>

                    <div className="chatbot-input">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="메시지를 입력하세요..."
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button onClick={sendMessage}>전송</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;
