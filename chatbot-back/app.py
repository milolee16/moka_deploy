# app.py - 세션 기반 대화 관리 업그레이드
# --- 1. Imports ---
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import os
import traceback
import uuid
from datetime import datetime, timedelta
import threading
import time

# --- 2. Flask & CORS ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- 3. Google Cloud 인증 ---
SERVICE_ACCOUNT_KEY_FILE = "application_default_credentials.json"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = SERVICE_ACCOUNT_KEY_FILE

# --- 4. GenAI Client ---
genai_client = genai.Client(
    vertexai=True,
    project="moca-chatbot-471203",
    location="asia-northeast1",
)
MODEL_NAME = "gemini-1.5-flash-002"

# --- 5. 세션 관리 (메모리 기반) ---
conversation_sessions = {}
session_lock = threading.Lock()

# 세션 설정
MAX_MESSAGES_PER_SESSION = 20  # 세션당 최대 메시지 수 (user + assistant)
SESSION_TIMEOUT_HOURS = 2      # 세션 타임아웃 (2시간)

class ConversationSession:
    def __init__(self, session_id):
        self.session_id = session_id
        self.messages = []
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
    
    def add_message(self, role, content):
        """메시지 추가"""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now()
        })
        self.last_activity = datetime.now()
        
        # 메시지 수 제한
        if len(self.messages) > MAX_MESSAGES_PER_SESSION:
            self.messages = self.messages[-MAX_MESSAGES_PER_SESSION:]
    
    def get_conversation_context(self):
        """대화 맥락을 문자열로 변환"""
        if not self.messages:
            return ""
        
        context_parts = []
        for msg in self.messages:
            role_label = "사용자" if msg["role"] == "user" else "챗봇"
            context_parts.append(f"{role_label}: {msg['content']}")
        
        return "\n".join(context_parts)
    
    def is_expired(self):
        """세션 만료 여부 확인"""
        return datetime.now() - self.last_activity > timedelta(hours=SESSION_TIMEOUT_HOURS)

def get_or_create_session(session_id):
    """세션 가져오기 또는 생성"""
    with session_lock:
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = ConversationSession(session_id)
        return conversation_sessions[session_id]

def cleanup_expired_sessions():
    """만료된 세션 정리"""
    with session_lock:
        expired_sessions = [
            sid for sid, session in conversation_sessions.items() 
            if session.is_expired()
        ]
        for sid in expired_sessions:
            del conversation_sessions[sid]
        
        if expired_sessions:
            print(f"[세션 정리] {len(expired_sessions)}개 만료된 세션 삭제")

# --- 6. 세션 정리 스레드 (백그라운드) ---
def session_cleanup_worker():
    """백그라운드에서 주기적으로 세션 정리"""
    while True:
        try:
            cleanup_expired_sessions()
            time.sleep(3600)  # 1시간마다 정리
        except Exception as e:
            print(f"[세션 정리 오류] {e}")
            time.sleep(3600)

# 백그라운드 스레드 시작
cleanup_thread = threading.Thread(target=session_cleanup_worker, daemon=True)
cleanup_thread.start()

# --- 7. 유틸: 메시지 추출 ---
def extract_message_and_session(req) -> tuple:
    """요청에서 메시지와 세션 ID 추출"""
    data = req.get_json(silent=True)
    
    if isinstance(data, dict):
        message = (data.get("message") or "").strip()
        session_id = data.get("session_id") or str(uuid.uuid4())
        return message, session_id
    
    # 폼 데이터 또는 쿼리스트링에서 추출
    message = (req.form.get("message") or req.args.get("message") or "").strip()
    session_id = req.form.get("session_id") or req.args.get("session_id") or str(uuid.uuid4())
    
    return message, session_id

# --- 8. 모델 호출 (대화 기록 포함) ---
def call_model_with_context(current_message: str, conversation_context: str = "") -> str:
    """대화 맥락을 포함한 모델 호출"""
    
    # 1단계: 의도 분류 (현재 메시지만 사용)
    classification_prompt = f"""사용자의 질문 의도를 MOCA(모카) 앱의 기능에 따라 아래 [카테고리] 중 하나로만 분류하세요.

[카테고리]
예약_문의, 요금_문의, 이용_방법, 문제_해결, 계정_관리, 인사, 감사, 기타_문의

---
[분류 예시]
- 질문: 지금 바로 탈 수 있는 차 있어요?
- 정답: 예약_문의
- 질문: 주행 요금은 1km당 얼마예요?
- 정답: 요금_문의
- 질문: 차 문은 어떻게 열어요?
- 정답: 이용_방법
- 질문: 사고가 났어요 어떻게 해야하죠?
- 정답: 문제_해결
- 질문: 비밀번호를 잊어버렸어요
- 정답: 계정_관리
- 질문: 안녕하세요
- 정답: 인사
- 질문: 고마워
- 정답: 감사
---

[실제 문제]
질문: {current_message}
정답(카테고리만):"""

    contents = [types.Content(role="user", parts=[types.Part.from_text(text=classification_prompt)])]
    cfg = types.GenerateContentConfig(temperature=0.3, max_output_tokens=50)
    
    try:
        resp = genai_client.models.generate_content(
            model=MODEL_NAME, contents=contents, config=cfg
        )
        predicted_intent = (getattr(resp, "text", None) or "기타_문의").split()[0].strip()
    except Exception as e:
        print(f"[의도 분류 오류] {e}")
        predicted_intent = "기타_문의"

    # 2단계: 답변 생성 (대화 맥락 포함)
    generation_guidelines = {
        "예약_문의": "사용자가 예약을 원합니다. 원하는 차종/지역/날짜/시간을 정중히 물어보세요.",
        "요금_문의": "요금이 궁금합니다. 구체적으로 차량/기간/보험 여부를 물어보며 기본 안내를 시작하세요.",
        "이용_방법": "앱/차량 이용 방법을 묻고 있습니다. 필요한 기능이나 화면을 물어보세요.",
        "문제_해결": "문제가 발생했습니다. 공감 표현 후 어떤 화면/오류메시지인지 물어보고 조치 단계를 안내하세요.",
        "계정_관리": "계정 관련 문의입니다. 아이디/비밀번호/로그인 문제 등 구체 항목을 물어보세요.",
        "인사": "밝고 간단히 인사하고, 무엇을 도와드릴지 물어보세요.",
        "감사": "정중히 답하고, 추가로 도와드릴 일이 있는지 물어보세요.",
        "기타_문의": "의도가 불명확합니다. 어떤 도움을 원하시는지 한 문장으로 구체적으로 물어보세요.",
    }
    guideline = generation_guidelines.get(predicted_intent, generation_guidelines["기타_문의"])

    # 대화 맥락이 있으면 포함
    context_instruction = ""
    if conversation_context:
        context_instruction = f"""
[이전 대화 기록]
{conversation_context}

위 대화 맥락을 참고하여 답변하세요. 사용자가 "그것", "그거", "아까 말한" 등을 사용하면 이전 대화를 참조해서 답변하세요."""

    generation_prompt = f"""당신은 MOCA 차량 렌탈 서비스의 고객지원 챗봇입니다.
아래 [가이드라인]을 따르되 과장 없이 정중하고 간결하게 한국어로 답하세요.
{context_instruction}

[가이드라인]: {guideline}
[현재 사용자 질문]: {current_message}

[출력]:"""

    contents = [types.Content(role="user", parts=[types.Part.from_text(text=generation_prompt)])]
    cfg = types.GenerateContentConfig(temperature=0.7, top_p=0.9, max_output_tokens=1024)
    
    try:
        resp = genai_client.models.generate_content(
            model=MODEL_NAME, contents=contents, config=cfg
        )
        response_text = (getattr(resp, "text", None) or "").strip()
        if not response_text:
            response_text = "죄송합니다. 다시 한 번 말씀해 주시겠어요?"
    except Exception as e:
        print(f"[답변 생성 오류] {e}")
        response_text = "서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요."
    
    return response_text

# --- 9. Routes ---
@app.route("/")
def home():
    try:
        return render_template("index.html")
    except Exception:
        return "MOCA Chatbot Backend is running."

@app.route("/test")
def test():
    return jsonify({"status": "ok", "sessions": len(conversation_sessions)})

@app.route("/get_response", methods=["POST"])
def get_response():
    try:
        user_message, session_id = extract_message_and_session(request)
        
        if not user_message:
            return jsonify({"error": "message is required"}), 400

        # 세션 가져오기 또는 생성
        session = get_or_create_session(session_id)
        
        # 대화 맥락 가져오기
        conversation_context = session.get_conversation_context()
        
        # 사용자 메시지 추가
        session.add_message("user", user_message)
        
        # AI 응답 생성 (맥락 포함)
        response_text = call_model_with_context(user_message, conversation_context)
        
        # AI 응답 추가
        session.add_message("assistant", response_text)
        
        return jsonify({
            "response": response_text,
            "session_id": session_id
        }), 200

    except Exception as e:
        print("[/get_response] INTERNAL ERROR:", e)
        traceback.print_exc()
        return jsonify({"error": "internal server error"}), 500

@app.route("/session/<session_id>/history", methods=["GET"])
def get_session_history(session_id):
    """세션의 대화 기록 조회 (디버깅용)"""
    try:
        if session_id in conversation_sessions:
            session = conversation_sessions[session_id]
            return jsonify({
                "session_id": session_id,
                "message_count": len(session.messages),
                "created_at": session.created_at.isoformat(),
                "last_activity": session.last_activity.isoformat(),
                "messages": session.messages
            })
        else:
            return jsonify({"error": "session not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/sessions", methods=["GET"])
def get_all_sessions():
    """모든 세션 정보 조회 (관리용)"""
    try:
        sessions_info = []
        with session_lock:
            for sid, session in conversation_sessions.items():
                sessions_info.append({
                    "session_id": sid,
                    "message_count": len(session.messages),
                    "created_at": session.created_at.isoformat(),
                    "last_activity": session.last_activity.isoformat(),
                    "is_expired": session.is_expired()
                })
        
        return jsonify({
            "total_sessions": len(sessions_info),
            "sessions": sessions_info
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- 10. Run ---
if __name__ == "__main__":
    print("🚀 MOCA 챗봇 서버 시작 (세션 기반 대화 관리)")
    print(f"📊 세션 설정: 최대 {MAX_MESSAGES_PER_SESSION}개 메시지, {SESSION_TIMEOUT_HOURS}시간 타임아웃")
    app.run(host="127.0.0.1", port=5000, debug=True)