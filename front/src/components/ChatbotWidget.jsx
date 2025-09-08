import { useState } from "react";
import axios from "axios";
import "./ChatbotWidget.css";

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [chat, setChat] = useState([]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        setChat((prev) => [...prev, { role: "user", text: input }]);

        try {
            const res = await axios.post("http://127.0.0.1:5000/get_response", {
                message: input,
            });

            setChat((prev) => [
                ...prev,
                { role: "assistant", text: res.data.response },
            ]);
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
        <div className="chatbot-widget">
            {/* 말풍선 버튼 */}
            <button className="chatbot-button" onClick={() => setIsOpen(!isOpen)}>
                ❔
            </button>

            {/* 팝업 챗봇 */}
            {isOpen && (
                <div className="chatbot-popup">
                    <div className="chatbot-header">
                        <span>MOCA 챗봇</span>
                        <button onClick={() => setIsOpen(false)}>✖</button>
                    </div>
                    <div className="chatbot-messages">
                        {chat.map((msg, i) => (
                            <div
                                key={i}
                                className={`chat-bubble ${msg.role === "user" ? "user" : "bot"}`}
                            >
                                {msg.text}
                            </div>
                        ))}
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
