import React, { useState, useRef, useEffect, useCallback } from 'react';

// OCR_TYPE 상수를 이 파일 내부에 직접 정의합니다.
// 백엔드(ApiSampleService.java)의 명시적인 매핑에 따라 운전면허증 타입을 추가합니다.
const OCR_TYPE = {
  IDCARD: 1,       // 주민등록증 (registration-card)
  DRIVER_LICENSE: 2, // ✨ 운전면허증 (drivers-license) - 백엔드에서 이 값을 명시적으로 기대합니다.
  PASSPORT: 3,     // 여권 (passport)
  ALIEN_REGISTRATION: 4, // 외국인등록증 (alien-registration-card)
  BACK_SIDE: 5,    // 신분증 뒷면 (back-side)
  // 나머지 타입은 필요에 따라 추가 또는 조정하세요.
  CREDITCARD: 6,   // 신용카드 API
  QRCODE: 7,       // QR/Barcode WASM
  SEALCERT: 8,     // 인감증명서
  BIZREGCERT: 9,   // 사업자등록증
  DOCS: 10,        // 문서 crop WASM
  ACCOUNT: 11,     // 계좌번호 인식
  CHECK: 12,       // 수표 인식
  GIRO: 13,        // 지로번호 인식
  IDFAKE: 14,      // 지로번호 인식
};


const VIEW_MODE = {
  START: 'start',
  CAMERA: 'camera',
  PROCESSING: 'processing',
  RESULT: 'result',
};

function OcrPage() {
  const [view, setView] = useState(VIEW_MODE.START);
  const [stream, setStream] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 카메라 스트림을 정리하는 함수
  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // 컴포넌트가 언마운트될 때 카메라 정리
  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, [cleanupCamera]);

  // 카메라 시작
  const startCamera = async () => {
    cleanupCamera();
    setError('');
    setResult(null);
    setCapturedImage(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 후면 카메라 우선
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      setStream(mediaStream);
      setView(VIEW_MODE.CAMERA);
    } catch (err) {
      console.error("Camera access error:", err);
      setError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
      setView(VIEW_MODE.START);
    }
  };

  // 스트림이 사용 가능할 때 비디오 소스 설정
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // 이미지 캡처 처리
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current; // useRef에서 current 속성으로 접근
    const canvas = canvasRef.current; // useRef에서 current 속성으로 접근
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 표시를 위해 이미지 데이터 URL 저장
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);

    // 서버로 보낼 JSON 데이터 생성
    const jsonData = {
      base64Data: imageDataUrl.split(',')[1], // 'data:image/jpeg;base64,' 접두사 제거
      // ✨ 백엔드에 명시된 운전면허증 타입 (2)를 사용합니다.
      ocrType: OCR_TYPE.DRIVER_LICENSE
    };

    // 서버로 JSON 데이터 전송
    sendImageToServer(jsonData);

    cleanupCamera();
    setView(VIEW_MODE.PROCESSING);
  };

  // 이미지 데이터 (Base64가 포함된 JSON)를 서버로 전송
  const sendImageToServer = async (jsonData) => {
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Content-Type을 JSON으로 설정
        },
        body: JSON.stringify(jsonData), // JSON 데이터를 문자열로 전송
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '서버에서 오류가 발생했습니다.');
      }

      setResult(data);
      setView(VIEW_MODE.RESULT);
    } catch (err) {
      console.error("OCR 요청 실패:", err);
      setError(err.message);
      setView(VIEW_MODE.START); // 오류 발생 시 처음으로 돌아감
    }
  };

  // 현재 뷰 모드에 따라 콘텐츠 렌더링
  const renderContent = () => {
    if (error) {
      return (
          <div className="error-message">
            <h3>❌ 오류 발생</h3>
            <p>{error}</p>
            <button
                onClick={() => setError('')}
                className="button button-red"
            >
              확인
            </button>
          </div>
      );
    }

    switch (view) {
      case VIEW_MODE.CAMERA:
        return (
            <div className="camera-view-container">
              <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
              <div className="guide-overlay">
                <div className="guide-box"></div>
                <p className="guide-text">가이드 영역에 신분증을 맞춰주세요.</p>
              </div>
              <button
                  onClick={handleCapture}
                  className="capture-button"
              >
                촬영
              </button>
            </div>
        );

      case VIEW_MODE.PROCESSING:
        return (
            <div className="processing-view-container">
              <div className="spinner"></div>
              <h2>인식 중...</h2>
              <p>잠시만 기다려주세요.</p>
            </div>
        );

      case VIEW_MODE.RESULT:
        return (
            <div className="result-view-container">
              <h2>OCR 인식 결과</h2>
              <div className="result-content-wrapper">
                <div className="result-image-section">
                  <h3>촬영된 이미지</h3>
                  {capturedImage ? (
                      <img src={capturedImage} alt="Captured" className="captured-image" />
                  ) : (
                      <div className="image-placeholder">이미지 없음</div>
                  )}
                </div>
                <div className="result-json-section">
                  <h3>인식된 텍스트</h3>
                  <div className="result-json-pre">
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                  </div>
                </div>
              </div>
              <div className="button-group">
                <button
                    onClick={startCamera}
                    className="button button-blue"
                >
                  재촬영
                </button>
                <button
                    onClick={() => setView(VIEW_MODE.START)}
                    className="button button-gray"
                >
                  처음으로
                </button>
              </div>
            </div>
        );

      case VIEW_MODE.START:
      default:
        return (
            <div className="start-view-container">
              <h1 className="start-title">운전면허증 OCR</h1>
              <p className="start-description">
                운전면허증을 촬영하여<br/>정보를 자동으로 인식합니다.
              </p>
              <button
                  onClick={startCamera}
                  className="button button-start"
              >
                시작하기
              </button>
            </div>
        );
    }
  };

  return (
      <div className={`ocr-app-container ${
          view === VIEW_MODE.CAMERA ? 'camera-mode' : view === VIEW_MODE.RESULT ? 'result-mode' : ''
      }`}>
        {/* 캔버스는 화면에 보이지 않게 숨겨둠 */}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        {renderContent()}

        {/* 여기에 모든 CSS 스타일을 정의합니다. */}
        <style>
          {`
        .ocr-app-container {
            /* 컨테이너의 높이를 고정하고, 내용이 넘칠 경우를 대비해 overflow를 설정합니다. */
            height: calc(100vh - 82px);
            background: #fdfbfa; /* Moca: Light Beige BG */
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            font-family: inherit; /* 기본 폰트 상속 */
            overflow-y: hidden; /* 기본적으로 스크롤 숨김 */
        }

        .ocr-app-container.camera-mode {
            padding: 0;
            align-items: stretch;
        }

        .ocr-app-container.result-mode {
            /* 컨텐츠가 길어질 경우, 화면 상단부터 보이도록 정렬 방식을 변경합니다. */
            align-items: flex-start;
            padding-top: 2rem;
            padding-bottom: 2rem;
            overflow-y: auto; /* 결과 화면에서만 세로 스크롤을 허용합니다. */
        }

        /* --- Global Button Styles --- */
        .button {
            padding: 0.75rem 1.5rem; /* px-6 py-3 */
            border-radius: 0.5rem; /* rounded-lg */
            font-weight: 600; /* font-semibold */
            box-shadow: 0 4px 12px rgba(0,0,0,.05);
            transition: all 0.2s ease-in-out; /* transition-colors duration-200 */
            cursor: pointer;
            border: none;
        }

        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(164, 117, 81, .15);
        }

        .button:active {
            transform: scale(0.95);
        }

        .button-red {
            background-color: #dc2626; /* bg-red-600 */
            color: #ffffff; /* text-white */
        }

        .button-red:hover {
            background-color: #b91c1c; /* hover:bg-red-700 */
        }

        .button-blue {
            background-color: #a47551; /* Moca: Primary */
            color: #ffffff; /* text-white */
        }

        .button-blue:hover {
            background-color: #8c6342; /* Darker Moca */
        }

        .button-gray {
            background-color: #f5f1ed; /* Moca: Light Brown BG */
            color: #795548; /* Moca: Medium Brown */
            border: 1px solid #e7e0d9; /* Moca: Beige Border */
        }

        .button-gray:hover {
            background-color: #e7e0d9;
        }

        .button-start {
            width: 100%; /* w-full */
            padding: 1rem 2rem; /* px-8 py-4 */
            background-color: #a47551; /* Moca: Primary */
            color: #ffffff; /* text-white */
            font-size: 1.25rem; /* text-xl */
            font-weight: 700; /* font-bold */
            border-radius: 999px; /* Pill shape */
            box-shadow: 0 10px 24px rgba(164, 117, 81, .35); /* Moca: Shadow */
            transition: all 0.3s ease; /* transition-all duration-300 */
            border: none;
        }

        .button-start:hover {
            background-color: #8c6342; /* Darker Moca */
            transform: scale(1.05); /* hover:scale-105 */
        }

        .button-start:active {
            transform: scale(0.95); /* active:scale-95 */
        }

        /* --- Error Message Styles --- */
        .error-message {
            padding: 1.5rem; /* p-6 */
            background-color: #fee2e2; /* bg-red-100 */
            border: 1px solid #ef4444; /* border border-red-400 */
            color: #b91c1c; /* text-red-700 */
            border-radius: 0.5rem; /* rounded-lg */
            box-shadow: 0 4px 12px rgba(0,0,0,.05);
            max-width: 24rem; /* max-w-sm */
            margin-left: auto; /* mx-auto */
            margin-right: auto; /* mx-auto */
            text-align: center;
        }

        .error-message h3 {
            font-size: 1.25rem; /* text-xl */
            font-weight: 700; /* font-bold */
            margin-bottom: 1rem; /* mb-4 */
        }

        .error-message p {
            margin-bottom: 1.5rem; /* mb-6 */
        }

        /* --- Start View Styles --- */
        .start-view-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem; /* p-8 */
            background-color: #ffffff; /* bg-white */
            border-radius: 24px; /* Moca Style */
            box-shadow: 0 6px 18px rgba(0,0,0,.06);
            border: 1px solid #e7e0d9; /* Moca: Beige Border */
            text-align: center;
            row-gap: 1.5rem; /* space-y-6 */
            max-width: 560px; /* Align with Layout */
            width: 100%; /* w-full */
        }

        .start-title {
            font-size: 2.25rem; /* text-4xl */
            font-weight: 800; /* font-extrabold */
            color: #5d4037; /* Moca: Dark Brown */
        }

        .start-description {
            font-size: 1.125rem; /* text-lg */
            color: #795548; /* Moca: Medium Brown */
            line-height: 1.625; /* leading-relaxed */
        }

        /* --- Camera View Styles --- */
        .camera-view-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #000000; /* bg-black */
            overflow: hidden; /* Ensure video doesn't overflow */
        }

        .camera-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .guide-overlay {
            position: relative;
            z-index: 10; /* z-10 */
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .guide-box {
            width: 91.666667%; /* w-11/12 */
            max-width: 50%; /* lg:w-1/2 */
            aspect-ratio: 1.58; /* 실제 신분증 비율 */
            border: 3px solid #a47551; /* Moca: Primary */
            border-radius: 0.5rem; /* rounded-lg */
            background-color: transparent; /* bg-transparent */
            box-shadow: 0 0 0 9999px rgba(0,0,0,0.5); /* Dim background */
            pointer-events: none;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 1rem; /* p-4 */
        }

        @media (min-width: 768px) { /* md breakpoint */
            .guide-box {
                width: 75%; /* md:w-3/4 */
            }
        }
        @media (min-width: 1024px) { /* lg breakpoint */
            .guide-box {
                width: 50%; /* lg:w-1/2 */
            }
        }


        .guide-text {
            color: #ffffff; /* text-white */
            font-size: 1rem; /* text-base, 작게 수정 */
            font-weight: 600; /* font-semibold */
            background-color: rgba(0, 0, 0, 0.5); /* bg-black bg-opacity-50 */
            padding: 0.5rem 1rem; /* px-4 py-2 */
            border-radius: 0.375rem; /* rounded-md */
            margin-top: 1rem; /* Custom margin to place text below guide box */
            text-align: center; /* 가운데 정렬 추가 */
        }

        @media (min-width: 768px) { /* md breakpoint */
            .guide-text {
                font-size: 1.125rem; /* md:text-lg, 작게 수정 */
            }
        }


        .capture-button {
            position: absolute;
            bottom: 2rem; /* bottom-8 */
            z-index: 20; /* z-20 */
            width: 72px; height: 72px;
            background-color: #a47551; /* Moca: Primary */
            color: #ffffff; /* text-white */
            font-size: 1.125rem; /* text-lg */
            font-weight: 700; /* font-bold */
            border-radius: 9999px; /* rounded-full */
            box-shadow: 0 10px 24px rgba(164, 117, 81, .35); /* Moca: Shadow */
            transition: all 0.3s ease; /* transition-colors duration-300 transform */
            cursor: pointer;
            border: 4px solid white;
        }

        .capture-button:hover {
            background-color: #8c6342; /* Darker Moca */
        }

        .capture-button:active {
            transform: scale(0.95); /* active:scale-95 */
        }

        /* --- Processing View Styles --- */
        .processing-view-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem; /* p-8 */
            background-color: #fff;
            border-radius: 24px;
            border: 1px solid #e7e0d9;
            box-shadow: 0 6px 18px rgba(0,0,0,.06);
            text-align: center;
            row-gap: 1rem; /* space-y-4 */
        }

        .spinner {
            animation: spin 1s linear infinite;
            border-radius: 9999px; /* rounded-full */
            height: 4rem; /* h-16 */
            width: 4rem; /* w-16 */
            border-top: 4px solid #a47551; /* Moca: Primary */
            border-bottom: 4px solid #a47551; /* Moca: Primary */
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .processing-view-container h2 {
            font-size: 1.5rem; /* text-2xl */
            font-weight: 600; /* font-semibold */
            color: #5d4037; /* Moca: Dark Brown */
        }

        .processing-view-container p {
            color: #795548; /* Moca: Medium Brown */
        }

        /* --- Result View Styles --- */
        .result-view-container {
            width: 100%; /* w-full */
            max-width: 768px; /* max-w-3xl */
            padding: 2rem; /* p-8 */
            background-color: #ffffff; /* bg-white */
            border-radius: 24px;
            border: 1px solid #e7e0d9;
            box-shadow: 0 6px 18px rgba(0,0,0,.06);
            display: flex;
            flex-direction: column;
            align-items: center;
            row-gap: 1.5rem; /* space-y-6 */
        }

        .result-view-container h2 {
            font-size: 1.875rem; /* text-3xl */
            font-weight: 700; /* font-bold */
            color: #5d4037; /* Moca: Dark Brown */
            margin-bottom: 1rem; /* mb-4 */
        }

        .result-content-wrapper {
            display: flex;
            flex-direction: column; /* flex-col */
            width: 100%; /* w-full */
            gap: 1.5rem; /* gap-6 */
        }

        @media (min-width: 768px) { /* md breakpoint */
            .result-content-wrapper {
                flex-direction: row; /* md:flex-row */
            }
        }

        .result-image-section,
        .result-json-section {
            width: 100%; /* w-full */
            background-color: #fdfbfa; /* Moca: Light Beige BG */
            padding: 1rem; /* p-4 */
            border-radius: 0.5rem; /* rounded-lg */
            border: 1px solid #e7e0d9; /* Moca: Beige Border */
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
            display: flex;
            flex-direction: column;
        }
        
        @media (min-width: 768px) { /* md breakpoint */
            .result-image-section,
            .result-json-section {
                width: 50%; /* md:w-1/2 */
            }
        }

        .result-image-section {
            align-items: center;
        }

        .result-image-section h3,
        .result-json-section h3 {
            font-size: 1.25rem; /* text-xl */
            font-weight: 600; /* font-semibold */
            color: #5d4037; /* Moca: Dark Brown */
            margin-bottom: 1rem; /* mb-4 */
        }

        .captured-image {
            max-width: 100%; /* max-w-full */
            height: auto; /* h-auto */
            border-radius: 0.375rem; /* rounded-md */
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
        }

        .image-placeholder {
            width: 100%;
            height: 12rem; /* h-48 */
            background-color: #e5e7eb; /* bg-gray-200 */
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.375rem; /* rounded-md */
            color: #6b7280; /* text-gray-500 */
        }

        .result-json-pre {
            background-color: #f5f1ed; /* Moca: Light Brown BG */
            color: #5d4037; /* Moca: Dark Brown */
            padding: 1rem; /* p-4 */
            border-radius: 0.375rem; /* rounded-md */
            border: 1px solid #e7e0d9;
            overflow: auto; /* overflow-auto */
            max-height: 24rem; /* max-h-96 */
            font-size: 0.875rem; /* text-sm */
            font-family: monospace; /* font-mono */
        }

        .button-group {
            display: flex;
            flex-direction: column; /* flex-col */
            gap: 1rem; /* gap-4 */
            width: 100%; /* w-full */
            justify-content: center;
            margin-top: 1.5rem; /* mt-6 */
        }

        @media (min-width: 640px) { /* sm breakpoint */
            .button-group {
                flex-direction: row; /* sm:flex-row */
            }
        }
        `}
        </style>
      </div>
  );
}

export default OcrPage;
