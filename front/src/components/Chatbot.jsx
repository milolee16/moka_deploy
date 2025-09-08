import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = ({ isOpen = false }) => {
    const [input, setInput] = useState("");
    const [chat, setChat] = useState([]);
    const hasWelcomedRef = useRef(false);
    const prevOpenRef = useRef(isOpen);

    // ✅ isOpen이 false→true로 바뀌는 순간에, 채팅이 비어 있으면 환영 멘트 삽입
    useEffect(() => {
        const justOpened = !prevOpenRef.current && isOpen;
        prevOpenRef.current = isOpen;

        if (justOpened && !hasWelcomedRef.current && chat.length === 0) {
            setChat([
                {
                    role: "assistant",
                    text:
                        "안녕하세요. MOCA 고객지원 챗봇입니다.\n" +
                        "예약/변경, 결제/환불, 차량/보험, 계정/로그인 관련 문의를 도와드립니다.",
                },
            ]);
            hasWelcomedRef.current = true; // 같은 세션에서 중복 방지
        }
    }, [isOpen, chat.length]);

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

    return (
        <div className="chat-inner">
            <div className="chat-box">
                {chat.map((msg, i) => (
                    <div
                        key={i}
                        className={`chat-bubble ${msg.role === "user" ? "user" : "bot"}`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}>전송</button>
            </div>
        </div>
    );
};

export default Chatbot;
