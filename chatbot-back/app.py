# app.py
# --- 1. Imports ---
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import os
import traceback

# --- 2. Flask & CORS ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # 필요 시 프론트 도메인으로 제한

# --- 3. Google Cloud 인증 ---
# 서비스 계정 키 경로 (환경에 맞춰 경로 확인)
SERVICE_ACCOUNT_KEY_FILE = "application_default_credentials.json"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = SERVICE_ACCOUNT_KEY_FILE

# --- 4. GenAI Client (앱 시작 시 1회 생성) ---
genai_client = genai.Client(
    vertexai=True,
    project="moca-chatbot-471203",
    location="asia-northeast1",   # Vertex는 'global' 불가
)
MODEL_NAME = "gemini-1.5-flash-002"  # 콘솔에서 사용 가능 모델인지 확인

# --- 5. 유틸: 메시지 추출(JSON → form → querystring) ---
def extract_message(req) -> str:
    data = req.get_json(silent=True)
    if isinstance(data, dict) and "message" in data:
        return (data.get("message") or "").strip()
    if "message" in req.form:
        return (req.form.get("message") or "").strip()
    if "message" in req.args:
        return (req.args.get("message") or "").strip()
    return ""

# --- 6. 유틸: 모델 호출 ---
def call_model(prompt: str) -> str:
    contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
    cfg = types.GenerateContentConfig(
        temperature=0.7,
        top_p=0.9,
        max_output_tokens=1024,
    )
    resp = genai_client.models.generate_content(
        model=MODEL_NAME,
        contents=contents,
        config=cfg,
    )
    text = (getattr(resp, "text", None) or "").strip()
    return text

# --- 7. Routes ---
@app.route("/")
def home():
    # templates/index.html 이 있으면 렌더, 없으면 간단 응답
    try:
        return render_template("index.html")
    except Exception:
        return "MOCA Chatbot Backend is running."

@app.route("/test")
def test():
    return jsonify({"tt": "aa"})  # 문자열 JSON이 아닌 dict로 반환

@app.route("/get_response", methods=["POST"])
def get_response():
    try:
        user_message = extract_message(request)
        if not user_message:
            return jsonify({"error": "message is required"}), 400

        # --- 1단계: 의도 분류 (Few-shot 예시 추가로 성능 업그레이드) ---
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
질문: {user_message}
정답(카테고리만):"""
        predicted_intent = call_model(classification_prompt) or "기타_문의"
        predicted_intent = predicted_intent.split()[0].strip()  # 불필요한 말 제거

        # --- 2단계: 답변 생성 ---
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

        generation_prompt = f"""당신은 MOCA 차량 렌탈 서비스의 고객지원 챗봇입니다.
아래 [가이드라인]을 따르되 과장 없이 정중하고 간결하게 한국어 한 문장으로 답하세요.

[가이드라인]: {guideline}
[사용자 질문]: {user_message}

[출력(한 문장)]:"""
        response_text = call_model(generation_prompt) or "요청을 이해하지 못했어요. 어떤 도움을 원하시는지 한 문장으로 알려주세요."

        return jsonify({"response": response_text}), 200

    except Exception as e:
        print("[/get_response] INTERNAL ERROR:", e)
        traceback.print_exc()
        return jsonify({"error": "internal server error"}), 500

# --- 8. Run ---
if __name__ == "__main__":
    # 개발용 서버
    app.run(host="127.0.0.1", port=5000, debug=True)
