import os
import json
import joblib
import threading
import uuid
import time
from datetime import datetime, timedelta
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

class LocalMLManager:
    def __init__(self):
        # 스레드 안전성을 위한 락 추가
        self.model_lock = threading.RLock()  # 재진입 가능한 락
        self.data_lock = threading.RLock()   # 데이터 접근용 락
        
        self.model_path = "models"
        self.training_data = []
        self.prediction_log = []
        self.feedback_data = []
        self.intent_classifier = None
        self.vectorizer = None
        
        # 디렉토리 생성
        if not os.path.exists(self.model_path):
            os.makedirs(self.model_path)
        
        # 저장된 모델 로드 시도
        self.load_models()
        
        print(f"[AutoML] LocalMLManager 초기화 완료 (스레드 안전)")
    
    def add_training_data(self, text, intent, confidence=0.5):
        """훈련 데이터 추가 - 스레드 안전"""
        with self.data_lock:
            self.training_data.append({
                'text': text,
                'intent': intent,
                'confidence': confidence,
                'timestamp': datetime.now()
            })
            print(f"[AutoML] 훈련 데이터 추가: {text[:30]}... -> {intent}")
    
    def train_intent_classifier(self):
        """의도 분류 모델 훈련 - 스레드 안전"""
        with self.model_lock:  # 모델 훈련 중 다른 작업 차단
            print("[AutoML] 모델 훈련 시작...")
            
            # 데이터 접근 시에도 락 사용
            with self.data_lock:
                if len(self.training_data) < 10:
                    print(f"[AutoML] 훈련 데이터 부족: {len(self.training_data)}개 (최소 10개 필요)")
                    return False
                
                # 데이터 복사 (락 범위 최소화)
                training_data_copy = self.training_data.copy()
            
            # 데이터 준비
            texts = [item['text'] for item in training_data_copy]
            intents = [item['intent'] for item in training_data_copy]
            
            # 클래스별 데이터 수 확인
            intent_counts = Counter(intents)
            min_samples_per_class = min(intent_counts.values())
            unique_classes = len(intent_counts)
            
            print(f"[AutoML] 클래스별 데이터 수: {dict(intent_counts)}")
            print(f"[AutoML] 총 데이터: {len(texts)}개, 클래스: {unique_classes}개")
            
            try:
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
                print("[AutoML] 모델 훈련 완료")
                return True
                
            except Exception as e:
                print(f"[AutoML] 모델 훈련 오류: {e}")
                return False
    
    def predict_intent(self, text):
        """의도 예측 - 스레드 안전"""
        # 모델 접근 시 읽기 락 (다른 예측과 동시 실행 가능)
        with self.model_lock:
            if not self.intent_classifier or not self.vectorizer:
                return None, 0.0
            
            try:
                X = self.vectorizer.transform([text])
                intent = self.intent_classifier.predict(X)[0]
                confidence = max(self.intent_classifier.predict_proba(X)[0])
                
                # 예측 로그 저장 (데이터 락 사용)
                with self.data_lock:
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
        """사용자 피드백 수집 - 스레드 안전"""
        with self.data_lock:
            self.feedback_data.append({
                'text': text,
                'predicted_intent': predicted_intent,
                'actual_intent': actual_intent,
                'user_satisfied': user_satisfied,
                'timestamp': datetime.now()
            })
            
            # 잘못된 예측에 대해 훈련 데이터 추가
            if actual_intent and predicted_intent != actual_intent:
                self.add_training_data(text, actual_intent, confidence=1.0)
    
    def auto_retrain(self):
        """자동 재훈련 - 스레드 안전"""
        with self.data_lock:
            feedback_count = len(self.feedback_data)
        
        if feedback_count >= 20:
            print("[AutoML] 자동 재훈련 시작...")
            success = self.train_intent_classifier()
            if success:
                with self.data_lock:
                    self.feedback_data = []
                print("[AutoML] 자동 재훈련 완료")
    
    def save_models(self):
        """모델 저장 - 스레드 안전"""
        try:
            # 모델 저장 시 락 사용
            with self.model_lock:
                if self.intent_classifier:
                    joblib.dump(self.intent_classifier, f"{self.model_path}/intent_classifier.pkl")
                if self.vectorizer:
                    joblib.dump(self.vectorizer, f"{self.model_path}/vectorizer.pkl")
            
            # 데이터 저장 시 데이터 락 사용
            with self.data_lock:
                training_data_copy = [
                    {**item, 'timestamp': item['timestamp'].isoformat() if isinstance(item['timestamp'], datetime) else item['timestamp']}
                    for item in self.training_data
                ]
                
                with open(f"{self.model_path}/training_data.json", 'w', encoding='utf-8') as f:
                    json.dump(training_data_copy, f, ensure_ascii=False, indent=2)
                    
            print("[AutoML] 모델 저장 완료")
        except Exception as e:
            print(f"[AutoML] 모델 저장 오류: {e}")
    
    def load_models(self):
        """저장된 모델 로드 - 스레드 안전"""
        try:
            classifier_path = f"{self.model_path}/intent_classifier.pkl"
            vectorizer_path = f"{self.model_path}/vectorizer.pkl"
            data_path = f"{self.model_path}/training_data.json"
            
            with self.model_lock:
                if os.path.exists(classifier_path):
                    self.intent_classifier = joblib.load(classifier_path)
                    print("[AutoML] 의도 분류 모델 로드 완료")
                
                if os.path.exists(vectorizer_path):
                    self.vectorizer = joblib.load(vectorizer_path)
                    print("[AutoML] 벡터라이저 로드 완료")
            
            with self.data_lock:
                if os.path.exists(data_path):
                    with open(data_path, 'r', encoding='utf-8') as f:
                        loaded_data = json.load(f)
                        # datetime 객체 복원
                        for item in loaded_data:
                            if isinstance(item.get('timestamp'), str):
                                try:
                                    item['timestamp'] = datetime.fromisoformat(item['timestamp'])
                                except:
                                    item['timestamp'] = datetime.now()
                        self.training_data = loaded_data
                    print(f"[AutoML] 훈련 데이터 로드 완료: {len(self.training_data)}개")
                    
        except Exception as e:
            print(f"[AutoML] 모델 로드 오류: {e}")
    
    def get_model_stats(self):
        """모델 통계 정보 - 스레드 안전"""
        with self.data_lock:
            training_count = len(self.training_data)
            prediction_count = len(self.prediction_log)
            feedback_count = len(self.feedback_data)
        
        with self.model_lock:
            model_loaded = self.intent_classifier is not None
            vectorizer_loaded = self.vectorizer is not None
        
        return {
            "training_data_count": training_count,
            "prediction_count": prediction_count,
            "feedback_count": feedback_count,
            "model_loaded": model_loaded,
            "vectorizer_loaded": vectorizer_loaded
        }

# --- 세션 관리 (기존과 동일하지만 락 사용) ---
conversation_sessions = {}
session_lock = threading.Lock()
MAX_MESSAGES_PER_SESSION = 20
SESSION_TIMEOUT_HOURS = 2

# ML 매니저 초기화
ml_manager = LocalMLManager()

class ConversationSession:
    def __init__(self, session_id):
        self.session_id = session_id
        self.messages = []
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        self.ml_predictions = []
        # 세션별 락 추가
        self.session_lock = threading.Lock()
    
    def add_message(self, role, content, ml_prediction=None):
        """메시지 추가 - 세션별 스레드 안전"""
        with self.session_lock:
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
        """대화 컨텍스트 조회 - 스레드 안전"""
        with self.session_lock:
            if not self.messages:
                return ""
            
            context_parts = []
            for msg in self.messages:
                role_label = "사용자" if msg["role"] == "user" else "챗봇"
                context_parts.append(f"{role_label}: {msg['content']}")
            
            return "\n".join(context_parts)
    
    def is_expired(self):
        """세션 만료 확인 - 스레드 안전"""
        with self.session_lock:
            return datetime.now() - self.last_activity > timedelta(hours=SESSION_TIMEOUT_HOURS)

def get_or_create_session(session_id):
    """세션 생성 또는 조회 - 스레드 안전"""
    with session_lock:
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = ConversationSession(session_id)
        return conversation_sessions[session_id]

def cleanup_expired_sessions():
    """만료된 세션 정리 - 스레드 안전"""
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
    
    # 충분한 데이터가 있으면 초기 훈련
    if len(ml_manager.training_data) >= 20:
        ml_manager.train_intent_classifier()

def session_cleanup_worker():
    """백그라운드 세션 정리 작업 - 스레드 안전"""
    while True:
        try:
            cleanup_expired_sessions()
            ml_manager.auto_retrain()
            time.sleep(3600)  # 1시간마다 실행
        except Exception as e:
            print(f"[백그라운드 작업 오류] {e}")
            time.sleep(3600)

# 백그라운드 스레드 시작
cleanup_thread = threading.Thread(target=session_cleanup_worker, daemon=True)
cleanup_thread.start()

# --- API 엔드포인트들 (기존과 동일) ---
@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        # 요청 파싱
        data = request.get_json(silent=True)
        if isinstance(data, dict):
            message = (data.get("message") or "").strip()
            session_id = data.get("session_id") or str(uuid.uuid4())
        else:
            message = (request.form.get("message") or request.args.get("message") or "").strip()
            session_id = request.form.get("session_id") or request.args.get("session_id") or str(uuid.uuid4())
        
        if not message:
            return jsonify({"error": "메시지가 없습니다"}), 400
        
        # 세션 가져오기
        session = get_or_create_session(session_id)
        
        # ML 예측
        ml_intent, ml_confidence = ml_manager.predict_intent(message)
        
        # 간단한 응답 생성 (실제로는 더 복잡한 NLG 사용)
        response = generate_response(message, ml_intent, ml_confidence)
        
        # 메시지 기록
        session.add_message("user", message, {
            "predicted_intent": ml_intent,
            "confidence": ml_confidence
        })
        session.add_message("assistant", response)
        
        return jsonify({
            "response": response,
            "session_id": session_id,
            "ml_prediction": {
                "intent": ml_intent,
                "confidence": ml_confidence
            }
        })
        
    except Exception as e:
        print(f"[Chat API 오류] {e}")
        return jsonify({"error": "채팅 처리 중 오류가 발생했습니다"}), 500

def generate_response(message, intent, confidence):
    """간단한 응답 생성기"""
    if confidence < 0.3:
        return "죄송합니다. 정확히 이해하지 못했습니다. 다시 말씀해 주시겠어요?"
    
    responses = {
        "예약_문의": "차량 예약 관련 문의군요! MOCA 앱에서 실시간으로 예약 가능한 차량을 확인하실 수 있습니다.",
        "요금_문의": "요금 문의해 주셨네요! 기본 요금은 시간당 1,000원이며, 주행요금은 km당 100원입니다.",
        "이용_방법": "이용 방법에 대해 궁금하시군요! MOCA 앱을 통해 차량 예약부터 반납까지 모든 과정을 진행하실 수 있습니다.",
        "문제_해결": "문제가 발생하셨군요! 고객센터(1588-1234)로 연락주시면 즉시 도움을 드리겠습니다.",
        "계정_관리": "계정 관리 관련 문의시군요! 앱 설정에서 개인정보를 수정하시거나 고객센터로 문의해 주세요.",
        "인사": "안녕하세요! MOCA 챗봇입니다. 무엇을 도와드릴까요?",
        "감사": "천만에요! 더 궁금한 것이 있으시면 언제든 물어보세요."
    }
    
    return responses.get(intent, "MOCA 서비스에 대해 궁금한 것이 있으시면 언제든 말씀해 주세요!")

@app.route("/ml_stats", methods=["GET", "OPTIONS"])
def get_ml_stats():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        stats = ml_manager.get_model_stats()
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/retrain", methods=["POST", "OPTIONS"])
def retrain_model():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        success = ml_manager.train_intent_classifier()
        if success:
            return jsonify({"status": "retrain completed"})
        else:
            return jsonify({"status": "retrain failed", "error": "insufficient data"}), 400
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
    print("🚀 MOCA 챗봇 서버 시작 (Thread-Safe AutoML)")
    print(f"📊 세션 설정: 최대 {MAX_MESSAGES_PER_SESSION}개 메시지, {SESSION_TIMEOUT_HOURS}시간 타임아웃")
    print(f"🤖 AutoML 통계: {ml_manager.get_model_stats()}")
    print("🔒 스레드 안전성: 모든 ML 작업이 락으로 보호됨")
    print("🌐 CORS 설정: localhost:3000, 127.0.0.1:3000 허용")
    app.run(host="0.0.0.0", port=5000, debug=False)  # debug=False로 변경 (프로덕션 환경)