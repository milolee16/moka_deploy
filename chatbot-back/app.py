# app.py - CORS 문제 해결된 버전
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
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
from collections import Counter, defaultdict

# --- Flask 앱 생성 ---
app = Flask(__name__)

# --- CORS 설정 (수정됨) ---
CORS(app, 
     origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React 개발 서버
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True)

# --- Google Cloud 인증 ---
SERVICE_ACCOUNT_KEY_FILE = "application_default_credentials.json"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = SERVICE_ACCOUNT_KEY_FILE

# --- GenAI Client ---
genai_client = genai.Client(
    vertexai=True,
    project="moca-chatbot-471203",
    location="asia-northeast1",
)
MODEL_NAME = "gemini-1.5-flash-002"

# --- 로컬 ML 모델 관리 클래스 ---
class LocalMLManager:
    def __init__(self):
        self.intent_classifier = None
        self.vectorizer = None
        self.training_data = []
        self.model_path = "models/"
        self.ensure_model_dir()
        self.load_models()
        
        # 성능 모니터링
        self.prediction_log = []
        self.feedback_data = []
        
    def ensure_model_dir(self):
        """모델 디렉토리 생성"""
        os.makedirs(self.model_path, exist_ok=True)
    
    def add_training_data(self, text, intent, confidence=1.0):
        """훈련 데이터 추가"""
        self.training_data.append({
            'text': text,
            'intent': intent,
            'confidence': confidence,
            'timestamp': datetime.now()
        })
    
    def train_intent_classifier(self):
        """의도 분류 모델 훈련"""
        if len(self.training_data) < 10:
            print(f"[AutoML] 훈련 데이터 부족: {len(self.training_data)}개 (최소 10개 필요)")
            return False
        
        # 데이터 준비
        texts = [item['text'] for item in self.training_data]
        intents = [item['intent'] for item in self.training_data]
        
        # 클래스별 데이터 수 확인
        intent_counts = Counter(intents)
        min_samples_per_class = min(intent_counts.values())
        unique_classes = len(intent_counts)
        
        print(f"[AutoML] 클래스별 데이터 수: {dict(intent_counts)}")
        print(f"[AutoML] 총 데이터: {len(texts)}개, 클래스: {unique_classes}개")
        
        # 텍스트 벡터화
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            stop_words=None
        )
        X = self.vectorizer.fit_transform(texts)
        
        # 모델 훈련
        self.intent_classifier = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            class_weight='balanced'
        )
        
        # 데이터 분할 조건 확인 및 조정
        if len(texts) >= 20 and unique_classes > 1 and min_samples_per_class >= 2:
            try:
                X_train, X_test, y_train, y_test = train_test_split(
                    X, intents, test_size=0.2, random_state=42, stratify=intents
                )
                self.intent_classifier.fit(X_train, y_train)
                
                # 성능 평가
                y_pred = self.intent_classifier.predict(X_test)
                accuracy = accuracy_score(y_test, y_pred)
                print(f"[AutoML] 의도 분류 정확도 (stratified): {accuracy:.3f}")
                
            except ValueError as e:
                print(f"[AutoML] Stratify 실패, 일반 분할로 진행: {e}")
                X_train, X_test, y_train, y_test = train_test_split(
                    X, intents, test_size=0.2, random_state=42
                )
                self.intent_classifier.fit(X_train, y_train)
                
                y_pred = self.intent_classifier.predict(X_test)
                accuracy = accuracy_score(y_test, y_pred)
                print(f"[AutoML] 의도 분류 정확도 (non-stratified): {accuracy:.3f}")
                
        else:
            print(f"[AutoML] 데이터 부족으로 전체 데이터로 훈련 (검증 없음)")
            self.intent_classifier.fit(X, intents)
        
        # 모델 저장
        self.save_models()
        return True
    
    def predict_intent(self, text):
        """의도 예측"""
        if not self.intent_classifier or not self.vectorizer:
            return None, 0.0
        
        try:
            X = self.vectorizer.transform([text])
            intent = self.intent_classifier.predict(X)[0]
            confidence = max(self.intent_classifier.predict_proba(X)[0])
            
            # 예측 로그 저장
            self.prediction_log.append({
                'text': text,
                'predicted_intent': intent,
                'confidence': confidence,
                'timestamp': datetime.now()
            })
            
            return intent, confidence
            
        except Exception as e:
            print(f"[AutoML] 예측 오류: {e}")
            return None, 0.0
    
    def add_feedback(self, text, predicted_intent, actual_intent, user_satisfied=True):
        """사용자 피드백 수집"""
        self.feedback_data.append({
            'text': text,
            'predicted_intent': predicted_intent,
            'actual_intent': actual_intent,
            'user_satisfied': user_satisfied,
            'timestamp': datetime.now()
        })
        
        if actual_intent and predicted_intent != actual_intent:
            self.add_training_data(text, actual_intent, confidence=1.0)
    
    def auto_retrain(self):
        """자동 재훈련"""
        if len(self.feedback_data) >= 20:
            print("[AutoML] 자동 재훈련 시작...")
            success = self.train_intent_classifier()
            if success:
                self.feedback_data = []
                print("[AutoML] 자동 재훈련 완료")
    
    def save_models(self):
        """모델 저장"""
        try:
            if self.intent_classifier:
                joblib.dump(self.intent_classifier, f"{self.model_path}/intent_classifier.pkl")
            if self.vectorizer:
                joblib.dump(self.vectorizer, f"{self.model_path}/vectorizer.pkl")
            
            with open(f"{self.model_path}/training_data.json", 'w', encoding='utf-8') as f:
                json.dump(self.training_data, f, ensure_ascii=False, indent=2, default=str)
                
            print("[AutoML] 모델 저장 완료")
        except Exception as e:
            print(f"[AutoML] 모델 저장 오류: {e}")
    
    def load_models(self):
        """저장된 모델 로드"""
        try:
            classifier_path = f"{self.model_path}/intent_classifier.pkl"
            vectorizer_path = f"{self.model_path}/vectorizer.pkl"
            data_path = f"{self.model_path}/training_data.json"
            
            if os.path.exists(classifier_path):
                self.intent_classifier = joblib.load(classifier_path)
                print("[AutoML] 의도 분류 모델 로드 완료")
            
            if os.path.exists(vectorizer_path):
                self.vectorizer = joblib.load(vectorizer_path)
                print("[AutoML] 벡터라이저 로드 완료")
            
            if os.path.exists(data_path):
                with open(data_path, 'r', encoding='utf-8') as f:
                    self.training_data = json.load(f)
                print(f"[AutoML] 훈련 데이터 로드 완료: {len(self.training_data)}개")
                
        except Exception as e:
            print(f"[AutoML] 모델 로드 오류: {e}")
    
    def get_model_stats(self):
        """모델 통계 정보"""
        return {
            "training_data_count": len(self.training_data),
            "prediction_count": len(self.prediction_log),
            "feedback_count": len(self.feedback_data),
            "model_loaded": self.intent_classifier is not None,
            "vectorizer_loaded": self.vectorizer is not None
        }

# --- 세션 관리 ---
conversation_sessions = {}
session_lock = threading.Lock()
MAX_MESSAGES_PER_SESSION = 20
SESSION_TIMEOUT_HOURS = 2

ml_manager = LocalMLManager()

class ConversationSession:
    def __init__(self, session_id):
        self.session_id = session_id
        self.messages = []
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        self.ml_predictions = []
    
    def add_message(self, role, content, ml_prediction=None):
        message_data = {
            "role": role,
            "content": content,
            "timestamp": datetime.now(),
            "ml_prediction": ml_prediction
        }
        self.messages.append(message_data)
        self.last_activity = datetime.now()
        
        if len(self.messages) > MAX_MESSAGES_PER_SESSION:
            self.messages = self.messages[-MAX_MESSAGES_PER_SESSION:]
    
    def get_conversation_context(self):
        if not self.messages:
            return ""
        
        context_parts = []
        for msg in self.messages:
            role_label = "사용자" if msg["role"] == "user" else "챗봇"
            context_parts.append(f"{role_label}: {msg['content']}")
        
        return "\n".join(context_parts)
    
    def is_expired(self):
        return datetime.now() - self.last_activity > timedelta(hours=SESSION_TIMEOUT_HOURS)

def get_or_create_session(session_id):
    with session_lock:
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = ConversationSession(session_id)
        return conversation_sessions[session_id]

def cleanup_expired_sessions():
    with session_lock:
        expired_sessions = [
            sid for sid, session in conversation_sessions.items() 
            if session.is_expired()
        ]
        for sid in expired_sessions:
            del conversation_sessions[sid]
        
        if expired_sessions:
            print(f"[세션 정리] {len(expired_sessions)}개 만료된 세션 삭제")

def initialize_training_data():
    """초기 훈련 데이터 설정"""
    initial_data = [
        # 예약 문의 (10개)
        ("지금 바로 탈 수 있는 차 있어요?", "예약_문의"),
        ("내일 아침에 차 예약하고 싶어요", "예약_문의"),
        ("차량 예약 가능한가요?", "예약_문의"),
        ("예약 취소하고 싶어요", "예약_문의"),
        ("예약 변경 가능한가요?", "예약_문의"),
        ("오늘 저녁에 차 빌릴 수 있나요?", "예약_문의"),
        ("예약하려면 어떻게 해야 하나요?", "예약_문의"),
        ("차 예약 신청하고 싶습니다", "예약_문의"),
        ("당일 예약 가능한가요?", "예약_문의"),
        ("예약 확인하고 싶어요", "예약_문의"),
        
        # 요금 문의 (10개)
        ("주행 요금은 1km당 얼마예요?", "요금_문의"),
        ("하루 렌트비가 얼마인가요?", "요금_문의"),
        ("보험료는 별도인가요?", "요금_문의"),
        ("할인 혜택 있나요?", "요금_문의"),
        ("결제 방법이 궁금해요", "요금_문의"),
        ("요금표 보여주세요", "요금_문의"),
        ("얼마나 비싸요?", "요금_문의"),
        ("가격이 궁금합니다", "요금_문의"),
        ("요금 계산 방법을 알려주세요", "요금_문의"),
        ("비용이 어떻게 되나요?", "요금_문의"),
        
        # 이용 방법 (10개)
        ("차 문은 어떻게 열어요?", "이용_방법"),
        ("앱 사용법 알려주세요", "이용_방법"),
        ("차량 반납은 어떻게 하나요?", "이용_방법"),
        ("시동은 어떻게 거나요?", "이용_방법"),
        ("주유는 어떻게 하나요?", "이용_방법"),
        ("사용법이 궁금해요", "이용_방법"),
        ("어떻게 이용하나요?", "이용_방법"),
        ("차 키는 어디 있어요?", "이용_방법"),
        ("반납 장소가 어디인가요?", "이용_방법"),
        ("앱에서 차량 찾기 어떻게 해요?", "이용_방법"),
        
        # 문제 해결 (10개)
        ("사고가 났어요 어떻게 해야하죠?", "문제_해결"),
        ("차가 시동이 안 걸려요", "문제_해결"),
        ("앱이 안 열려요", "문제_해결"),
        ("차 문이 안 열려요", "문제_해결"),
        ("고장 신고하고 싶어요", "문제_해결"),
        ("문제가 생겼어요", "문제_해결"),
        ("차량에 이상이 있어요", "문제_해결"),
        ("도움이 필요해요", "문제_해결"),
        ("차가 고장났어요", "문제_해결"),
        ("사고 처리 어떻게 하나요?", "문제_해결"),
        
        # 계정 관리 (10개)
        ("비밀번호를 잊어버렸어요", "계정_관리"),
        ("회원가입은 어떻게 하나요?", "계정_관리"),
        ("아이디 찾기", "계정_관리"),
        ("회원 탈퇴하고 싶어요", "계정_관리"),
        ("로그인이 안 돼요", "계정_관리"),
        ("계정 정보 변경하고 싶어요", "계정_관리"),
        ("내 정보 수정", "계정_관리"),
        ("패스워드 재설정", "계정_관리"),
        ("프로필 변경", "계정_관리"),
        ("회원정보 업데이트", "계정_관리"),
        
        # 인사 (8개)
        ("안녕하세요", "인사"),
        ("안녕", "인사"),
        ("하이", "인사"),
        ("안녕하십니까", "인사"),
        ("반갑습니다", "인사"),
        ("처음 뵙겠습니다", "인사"),
        ("좋은 아침이에요", "인사"),
        ("안녕히 계세요", "인사"),
        
        # 감사 (8개)
        ("고마워요", "감사"),
        ("감사합니다", "감사"),
        ("도움이 됐어요", "감사"),
        ("고맙습니다", "감사"),
        ("감사해요", "감사"),
        ("정말 고마워요", "감사"),
        ("많은 도움이 되었습니다", "감사"),
        ("친절하게 알려주셔서 감사합니다", "감사"),
    ]
    
    for text, intent in initial_data:
        ml_manager.add_training_data(text, intent)
    
    print(f"[AutoML] 초기 훈련 데이터 설정 완료: {len(initial_data)}개")
    
    if len(ml_manager.training_data) >= 20:
        ml_manager.train_intent_classifier()

def session_cleanup_worker():
    while True:
        try:
            cleanup_expired_sessions()
            ml_manager.auto_retrain()
            time.sleep(3600)
        except Exception as e:
            print(f"[백그라운드 작업 오류] {e}")
            time.sleep(3600)

cleanup_thread = threading.Thread(target=session_cleanup_worker, daemon=True)
cleanup_thread.start()

def extract_message_and_session(req) -> tuple:
    data = req.get_json(silent=True)
    
    if isinstance(data, dict):
        message = (data.get("message") or "").strip()
        session_id = data.get("session_id") or str(uuid.uuid4())
        return message, session_id
    
    message = (req.form.get("message") or req.args.get("message") or "").strip()
    session_id = req.form.get("session_id") or req.args.get("session_id") or str(uuid.uuid4())
    
    return message, session_id

def call_model_with_automl(current_message: str, conversation_context: str = "") -> tuple:
    ml_intent, ml_confidence = ml_manager.predict_intent(current_message)
    
    classification_prompt = f"""사용자의 질문 의도를 MOCA(모카) 앱의 기능에 따라 아래 [카테고리] 중 하나로만 분류하세요.

[카테고리]
예약_문의, 요금_문의, 이용_방법, 문제_해결, 계정_관리, 인사, 감사, 기타_문의

질문: {current_message}
정답(카테고리만):"""

    contents = [types.Content(role="user", parts=[types.Part.from_text(text=classification_prompt)])]
    cfg = types.GenerateContentConfig(temperature=0.3, max_output_tokens=50)
    
    gemini_intent = "기타_문의"
    try:
        resp = genai_client.models.generate_content(
            model=MODEL_NAME, contents=contents, config=cfg
        )
        gemini_intent = (getattr(resp, "text", None) or "기타_문의").split()[0].strip()
    except Exception as e:
        print(f"[Gemini 의도 분류 오류] {e}")

    final_intent = gemini_intent
    prediction_source = "gemini"
    
    if ml_intent and ml_confidence > 0.7:
        final_intent = ml_intent
        prediction_source = "local_ml"
    elif ml_intent and ml_confidence > 0.5:
        if ml_intent == gemini_intent:
            final_intent = ml_intent
            prediction_source = "consensus"
    
    print(f"[AutoML] ML: {ml_intent}({ml_confidence:.2f}), Gemini: {gemini_intent}, Final: {final_intent} ({prediction_source})")

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
    guideline = generation_guidelines.get(final_intent, generation_guidelines["기타_문의"])

    context_instruction = ""
    if conversation_context:
        context_instruction = f"""
[이전 대화 기록]
{conversation_context}

위 대화 맥락을 참고하여 답변하세요."""

    generation_prompt = f"""당신은 MOCA 차량 렌탈 서비스의 고객지원 챗봇입니다.
아래 [가이드라인]을 따르되 과장 없이 정중하고 간결하게 한국어로 답하세요.
{context_instruction}

[가이드라인]: {guideline}
[현재 사용자 질문]: {current_message}

[출력]:"""

    contents = [types.Content(role="user", parts=[types.Part.from_text(text=generation_prompt)])]
    cfg = types.GenerateContentConfig(temperature=0.7, top_p=0.9, max_output_tokens=1024)
    
    response_text = "죄송합니다. 다시 한 번 말씀해 주시겠어요?"
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
    
    ml_prediction = {
        "ml_intent": ml_intent,
        "ml_confidence": ml_confidence,
        "gemini_intent": gemini_intent,
        "final_intent": final_intent,
        "prediction_source": prediction_source
    }
    
    return response_text, ml_prediction

# --- Routes ---
@app.route("/")
def home():
    try:
        return render_template("index.html")
    except Exception:
        return "MOCA Chatbot Backend with AutoML is running."

@app.route("/test")
def test():
    stats = ml_manager.get_model_stats()
    return jsonify({
        "status": "ok", 
        "sessions": len(conversation_sessions),
        "automl_stats": stats
    })

@app.route("/get_response", methods=["POST", "OPTIONS"])
def get_response():
    # OPTIONS 요청 처리 (CORS preflight)
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        user_message, session_id = extract_message_and_session(request)
        
        if not user_message:
            return jsonify({"error": "message is required"}), 400

        session = get_or_create_session(session_id)
        conversation_context = session.get_conversation_context()
        
        response_text, ml_prediction = call_model_with_automl(user_message, conversation_context)
        
        session.add_message("user", user_message)
        session.add_message("assistant", response_text, ml_prediction)
        
        return jsonify({
            "response": response_text,
            "session_id": session_id,
            "ml_prediction": ml_prediction
        }), 200

    except Exception as e:
        print("[/get_response] INTERNAL ERROR:", e)
        traceback.print_exc()
        return jsonify({"error": "internal server error"}), 500

@app.route("/feedback", methods=["POST", "OPTIONS"])
def submit_feedback():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        data = request.get_json()
        text = data.get("text")
        predicted_intent = data.get("predicted_intent")
        actual_intent = data.get("actual_intent")
        user_satisfied = data.get("user_satisfied", True)
        
        if text and predicted_intent:
            ml_manager.add_feedback(text, predicted_intent, actual_intent, user_satisfied)
            return jsonify({"status": "feedback recorded"}), 200
        else:
            return jsonify({"error": "invalid feedback data"}), 400
            
    except Exception as e:
        print(f"[피드백 오류] {e}")
        return jsonify({"error": "feedback processing failed"}), 500

@app.route("/retrain", methods=["POST", "OPTIONS"])
def manual_retrain():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        success = ml_manager.train_intent_classifier()
        if success:
            return jsonify({"status": "retrain completed", "stats": ml_manager.get_model_stats()}), 200
        else:
            return jsonify({"error": "insufficient training data"}), 400
    except Exception as e:
        print(f"[재훈련 오류] {e}")
        return jsonify({"error": "retrain failed"}), 500

@app.route("/ml_stats", methods=["GET", "OPTIONS"])
def get_ml_stats():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        stats = ml_manager.get_model_stats()
        
        recent_predictions = ml_manager.prediction_log[-100:]
        recent_accuracy = 0.0
        if recent_predictions and ml_manager.feedback_data:
            correct_predictions = sum(1 for fb in ml_manager.feedback_data[-50:] 
                                    if fb['predicted_intent'] == fb['actual_intent'])
            recent_accuracy = correct_predictions / min(len(ml_manager.feedback_data), 50) if ml_manager.feedback_data else 0
        
        stats["recent_accuracy"] = recent_accuracy
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/session/<session_id>/history", methods=["GET", "OPTIONS"])
def get_session_history(session_id):
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
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

@app.route("/sessions", methods=["GET", "OPTIONS"])
def get_all_sessions():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
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

# --- 앱 시작 시 초기화 ---
initialize_training_data()

if __name__ == "__main__":
    print("🚀 MOCA 챗봇 서버 시작 (AutoML 통합 + CORS 해결)")
    print(f"📊 세션 설정: 최대 {MAX_MESSAGES_PER_SESSION}개 메시지, {SESSION_TIMEOUT_HOURS}시간 타임아웃")
    print(f"🤖 AutoML 통계: {ml_manager.get_model_stats()}")
    print("🌐 CORS 설정: localhost:3000, 127.0.0.1:3000 허용")
    app.run(host="0.0.0.0", port=5000, debug=True)