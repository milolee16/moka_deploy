import { useState } from "react";
import axios from "axios";
import "./Chatbot.css"; // 말풍선 스타일을 따로 CSS로 관리

const Chatbot = () => {
    const [input, setInput] = useState("");
    const [chat, setChat] = useState([]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        // 내 메시지 추가
        setChat((prev) => [...prev, { role: "user", text: input }]);

        try {
            const res = await axios.post("http://localhost:5000/get_response", {
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
        <div className="chat-container">
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
