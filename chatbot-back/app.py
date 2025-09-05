# --- 1. 필요한 라이브러리 가져오기 (Imports) ---
# Flask 관련 라이브러리
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS   # 🔥 추가
# 새로운 Google Generative AI 라이브러리
from google import genai
from google.genai import types
import os

app = Flask(__name__)
CORS(app)
# --- 2. Google Cloud 및 서비스 계정 키 설정 ---
# 이전에 다운로드한 서비스 계정 키 JSON 파일의 정확한 파일명을 입력하세요.
SERVICE_ACCOUNT_KEY_FILE = "application_default_credentials.json"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = SERVICE_ACCOUNT_KEY_FILE

# --- 3. AI 모델 클라이언트 설정 ---
# 사용자님이 '코드 빌드'로 생성한 코드의 클라이언트 설정 부분입니다.
# 앱이 실행될 때 한 번만 생성되도록 전역 변수로 둡니다.
genai_client = genai.Client(
    vertexai=True,
    project="moca-chatbot-471203", # 사용자님의 프로젝트 ID
    location="asia-northeast1",       # 프롬프트를 저장한 지역
)

# --- 4. Flask 웹 서버 로직 ---
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/test")
def test():
    print("asdasd")
    return jsonify("{\"tt\" : \"aa\"}")

@app.route("/get_response", methods=["POST"])
def get_response():
#     user_message = request.form["message"]
    user_message = "이건 테스트야 반응해봐"
    try:
        # 사용자님의 프롬프트를 가져옵니다.
        # 마지막 질문 부분만 사용자의 입력 메시지로 동적으로 변경합니다.
        prompt_text = f"""사용자의 질문을 MOCA(모카) 앱의 기능에 따라 다음과 같은 카테고리로 분류하는 과제입니다: 예약_문의, 요금_문의, 이용_방법, 문제_해결, 계정_관리, 기타_문의, 인사, 감사 ### 예시 ### 질문: MOCA 어떻게 예약해요? 분류: 예약_문의 질문: 주행 요금은 1km당 얼마예요? 분류: 요금_문의 질문: 차 문은 어떻게 열어요? 분류: 이용_방법 질문: 사고가 났어요 어떻게 해야하죠? 분류: 문제_해결 질문: 안녕하세요 분류: 인사 ### 실제 분류 ### 질문: {user_message} 분류:"""

        # AI에게 보낼 내용을 구성합니다.
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt_text)]
            ),
        ]

        # AI 모델을 호출합니다.
        # 참고: generate_content_stream 대신 generate_content를 사용하여 한번에 전체 답변을 받습니다.
        # 챗봇 분류 작업에는 이 방식이 더 간단합니다.
        response = genai_client.models.generate_content(
            model="gemini-1.5-flash", # 또는 gemini-1.5-pro-001 등 사용 가능
            contents=contents,
        )

        # AI의 답변(분류 결과)에서 불필요한 공백을 제거합니다.
        predicted_intent = response.text.strip()

        # 의도에 따른 답변 생성 (이 부분은 기존과 동일합니다)
        if predicted_intent == "예약_문의":
            response_text = "예약에 대해 궁금하시군요! 무엇을 도와드릴까요?"
        elif predicted_intent == "요금_문의":
            response_text = "요금 관련 정보입니다. 무엇이 궁금하세요?"
        # ... (이하 다른 elif 조건들은 기존과 동일하게 유지) ...
        elif predicted_intent == "이용_방법":
            response_text = "MOCA 이용 방법을 안내해 드릴게요."
        elif predicted_intent == "문제_해결":
            response_text = "문제가 발생했나요? 고객센터에 연결해 드릴까요?"
        elif predicted_intent == "계정_관리":
            response_text = "계정 관련 문의시군요."
        elif predicted_intent == "인사":
            response_text = "안녕하세요! MOCA 챗봇입니다."
        elif predicted_intent == "감사":
            response_text = "천만에요! 더 궁금한 점이 있으신가요?"
        else:
            response_text = f"죄송해요, '{predicted_intent}'에 대해서는 아직 잘 모르겠어요."

    except Exception as e:
        print(f"Error: {e}")
        response_text = "죄송합니다. 시스템에 오류가 발생했습니다."

    return jsonify({"response": response_text})

if __name__ == "__main__":
    app.run(debug=True)