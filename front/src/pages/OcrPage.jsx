import React, { useState, useRef, useEffect, useCallback } from 'react';
import './OcrPage.css';
import Modal from '../components/Modal'; // 모달 컴포넌트 임포트
import { addLicense } from '../services/paymentLicenseService'; // addLicense 임포트
import { useLocation, useNavigate } from 'react-router-dom';

const OCR_TYPE = {
  IDCARD: 1,
  DRIVER_LICENSE: 2,
  PASSPORT: 3,
  ALIEN_REGISTRATION: 4,
  BACK_SIDE: 5,
  CREDITCARD: 6,
  QRCODE: 7,
  SEALCERT: 8,
  BIZREGCERT: 9,
  DOCS: 10,
  ACCOUNT: 11,
  CHECK: 12,
  GIRO: 13,
  IDFAKE: 14,
};

const VIEW_MODE = {
  START: 'start',
  CAMERA: 'camera',
  PROCESSING: 'processing',
  RESULT: 'result',
};

// 유효성 검사 로직
const validate = (data) => {
  const newErrors = {};
  if (!data) return newErrors;

  if (data.resUserName.length < 3) {
    newErrors.resUserName = '이름은 3자 이상으로 입력해주세요.';
  }
  if (!(/^\d{10}$/.test(data.resLicenseNo) || /^\d{12}$/.test(data.resLicenseNo))) {
    newErrors.resLicenseNo = '면허 번호는 10자리 또는 12자리 숫자로 입력해주세요.';
  }
  if (!/^\d{13}$/.test(data.resUserIdentity)) {
    newErrors.resUserIdentity = '주민등록번호는 13자리 숫자로 입력해주세요.';
  }
  const dateFields = {
    resIssueDate: '발급일자',
    commStartDate: '갱신기간 시작일',
    commEndDate: '갱신기간 종료일',
  };
  for (const field in dateFields) {
    if (!/^\d{8}$/.test(data[field])) {
      newErrors[field] = `${dateFields[field]}는 8자리 숫자로 입력해주세요. (YYYYMMDD)`;
    }
  }
  return newErrors;
};

function OcrPage() {
  const [view, setView] = useState(VIEW_MODE.START);
  const [stream, setStream] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = location.state?.isEdit || false;

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return null;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
  };
  
  const handleUserNameChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    const licenseData = {
        name: formData.resUserName,
        licenseNumber: formData.resLicenseNo,
        residentRegistrationNumber: formData.resUserIdentity,
        issueDate: formatDate(formData.resIssueDate),
        renewalStartDate: formatDate(formData.commStartDate),
        renewalEndDate: formatDate(formData.commEndDate),
    };

    try {
        await addLicense(licenseData);
        console.log('최종 수정된 데이터:', licenseData);
        setIsModalOpen(true);
    } catch (error) {
        console.error("Failed to add license:", error);
        setError("면허증 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate('/payments-licenses'); // Redirect to payments and licenses page
  };

  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    return () => cleanupCamera();
  }, [cleanupCamera]);

  useEffect(() => {
    if (view === VIEW_MODE.RESULT && result) {
      const ocrData = result.data || {};
      setFormData({
        resUserName: ocrData.resUserName || '',
        resLicenseNo: (ocrData.resLicenseNo || '').replace(/\D/g, ''),
        resUserIdentity: (ocrData.resUserIdentity || '').replace(/\D/g, ''),
        resIssueDate: (ocrData.resIssueDate || '').replace(/\D/g, ''),
        commStartDate: (ocrData.commStartDate || '').replace(/\D/g, ''),
        commEndDate: (ocrData.commEndDate || '').replace(/\D/g, ''),
      });
    }
  }, [view, result]);

  useEffect(() => {
    if (formData) {
      const validationErrors = validate(formData);
      setErrors(validationErrors);
    }
  }, [formData]);

  const startCamera = async () => {
    cleanupCamera();
    setError('');
    setResult(null);
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      setView(VIEW_MODE.CAMERA);
    } catch (err) {
      console.error("Camera access error:", err);
      setError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
      setView(VIEW_MODE.START);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
    const jsonData = { base64Data: imageDataUrl.split(',')[1], ocrType: OCR_TYPE.DRIVER_LICENSE };
    sendImageToServer(jsonData);
    cleanupCamera();
    setView(VIEW_MODE.PROCESSING);
  };

  const sendImageToServer = async (jsonData) => {
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '서버에서 오류가 발생했습니다.');
      setResult(data);
      setView(VIEW_MODE.RESULT);
    } catch (err) {
      console.error("OCR 요청 실패:", err);
      setError(err.message);
      setView(VIEW_MODE.START);
    }
  };

  const renderContent = () => {
    if (error) {
      return (
          <div className="error-message">
            <h3>❌ 오류 발생</h3>
            <p>{error}</p>
            <button onClick={() => setError('')} className="button button-red">확인</button>
          </div>
      );
    }

    switch (view) {
      case VIEW_MODE.CAMERA:
        return (
            <div className="camera-view-container">
              <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
              <div className="guide-overlay">
                <div className="guide-box">
                   <div className="guide-box-corner top-left"></div>
                   <div className="guide-box-corner top-right"></div>
                   <div className="guide-box-corner bottom-left"></div>
                   <div className="guide-box-corner bottom-right"></div>
                </div>
                <p className="guide-text">선 안에 운전면허증을 맞춰주세요.</p>
              </div>
              <button onClick={handleCapture} className="capture-button">촬영하기</button>
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
        const isSubmitDisabled = !formData || Object.keys(errors).length > 0 || Object.values(formData).some(value => value.trim() === '');
        return (
            <div className="result-view-container">
              <h2>정보 확인 및 수정</h2>
              <p className="result-description">인식된 정보를 확인하고, 잘못된 부분이 있다면 수정해주세요.</p>
              <div className="result-content-wrapper">
                <div className="result-image-section">
                  <h3>촬영된 이미지</h3>
                  {capturedImage ? <img src={capturedImage} alt="Captured" className="captured-image" /> : <div className="image-placeholder">이미지 없음</div>}
                </div>
                <div className="result-form-section">
                  <h3>인식된 정보</h3>
                  {formData ? (
                    <form className="result-form" onSubmit={(e) => e.preventDefault()}>
                      <div className={`form-field ${errors.resUserName ? 'invalid' : ''}`}>
                        <label htmlFor="resUserName">이름</label>
                        <input type="text" id="resUserName" name="resUserName" value={formData.resUserName} onChange={handleUserNameChange} />
                        {errors.resUserName && <p className="error-text">{errors.resUserName}</p>}
                      </div>
                      <div className={`form-field ${errors.resLicenseNo ? 'invalid' : ''}`}>
                        <label htmlFor="resLicenseNo">면허 번호</label>
                        <input type="text" id="resLicenseNo" name="resLicenseNo" value={formData.resLicenseNo} onChange={handleFormChange} maxLength="12" />
                        {errors.resLicenseNo && <p className="error-text">{errors.resLicenseNo}</p>}
                      </div>
                      <div className={`form-field ${errors.resUserIdentity ? 'invalid' : ''}`}>
                        <label htmlFor="resUserIdentity">주민등록번호</label>
                        <input type="text" id="resUserIdentity" name="resUserIdentity" value={formData.resUserIdentity} onChange={handleFormChange} maxLength="13" />
                        {errors.resUserIdentity && <p className="error-text">{errors.resUserIdentity}</p>}
                      </div>
                      <div className={`form-field ${errors.resIssueDate ? 'invalid' : ''}`}>
                        <label htmlFor="resIssueDate">발급 일자</label>
                        <input type="text" id="resIssueDate" name="resIssueDate" value={formData.resIssueDate} onChange={handleFormChange} maxLength="8" />
                        {errors.resIssueDate && <p className="error-text">{errors.resIssueDate}</p>}
                      </div>
                      <div className={`form-field ${errors.commStartDate ? 'invalid' : ''}`}>
                        <label htmlFor="commStartDate">갱신 기간 (시작)</label>
                        <input type="text" id="commStartDate" name="commStartDate" value={formData.commStartDate} onChange={handleFormChange} maxLength="8" />
                        {errors.commStartDate && <p className="error-text">{errors.commStartDate}</p>}
                      </div>
                      <div className={`form-field ${errors.commEndDate ? 'invalid' : ''}`}>
                        <label htmlFor="commEndDate">갱신 기간 (종료)</label>
                        <input type="text" id="commEndDate" name="commEndDate" value={formData.commEndDate} onChange={handleFormChange} maxLength="8" />
                        {errors.commEndDate && <p className="error-text">{errors.commEndDate}</p>}
                      </div>
                    </form>
                  ) : <p>데이터를 불러오는 중입니다...</p>}
                </div>
              </div>
              <div className="button-group">
                <button onClick={startCamera} className="button button-gray">재촬영</button>
                <button onClick={handleFormSubmit} className="button button-blue" disabled={isSubmitDisabled}>완료</button>
              </div>
            </div>
        );

      case VIEW_MODE.START:
      default:
        return (
            <div className="start-view-container">
              <h1 className="start-title">운전면허증 등록</h1>
              <p className="start-description">안전한 차량 대여를 위해<br/>운전면허증을 인증해주세요.</p>
              <button onClick={startCamera} className="button button-start">시작하기</button>
            </div>
        );
    }
  };

  return (
      <div className={`ocr-app-container ${
          view === VIEW_MODE.CAMERA ? 'camera-mode' : view === VIEW_MODE.RESULT ? 'result-mode' : ''
      }`}>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        {renderContent()}

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="success-modal-content">
            <h3>{isEdit ? '수정 완료' : '등록 완료'}</h3>
            <p>{isEdit ? '면허정보가 수정되었습니다.' : '운전면허증 등록이 완료되었습니다.'}</p>
            <button onClick={closeModal} className="button button-blue">확인</button>
          </div>
        </Modal>
      </div>
  );
}

export default OcrPage;