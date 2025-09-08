# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import traceback

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ✅ Vertex AI (필요시 인증 환경변수 설정)
client = genai.Client(
  vertexai=True,
  project="moca-chatbot-471203",
  location="asia-northeast1",  # 'global' 금지
)
MODEL_NAME = "gemini-2.5-flash-lite"  # 콘솔에서 사용 가능 모델명인지 확인 필요

def extract_message(req):
  """JSON → form → querystring 순으로 안전 추출"""
  data = req.get_json(silent=True)
  if isinstance(data, dict) and "message" in data:
    return (data.get("message") or "").strip()
  if "message" in req.form:
    return (req.form.get("message") or "").strip()
  if "message" in req.args:
    return (req.args.get("message") or "").strip()
  return ""

@app.route("/get_response", methods=["POST"])
def get_response():
  try:
    user_msg = extract_message(request)
    if not user_msg:
      return jsonify({"error": "message is required"}), 400

    contents = [types.Content(role="user", parts=[types.Part.from_text(user_msg)])]
    cfg = types.GenerateContentConfig(
      temperature=0.7,
      top_p=0.9,
      max_output_tokens=1024,
    )

    resp = client.models.generate_content(
      model=MODEL_NAME,
      contents=contents,
      config=cfg
    )
    bot_text = (getattr(resp, "text", None) or "").strip() or "답변을 생성하지 못했어요."

    return jsonify({"response": bot_text}), 200

  except Exception as e:
    print("[/get_response] INTERNAL ERROR:", e)
    traceback.print_exc()
    return jsonify({"error": "internal server error"}), 500

if __name__ == "__main__":
  app.run(host="127.0.0.1", port=5000, debug=True)
