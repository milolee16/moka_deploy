const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty("--vh", `${vh}px`);
document.documentElement.style.backgroundColor = "rgba(255, 255, 255, 1)";

import { OCR_TYPE } from "./utils.js";

export default class WebCamera extends EventTarget {
  _md;
  _container;
  _videoWrapper;
  _videoRef;
  _mediaStream;
  _canvasRef;
  _guideArea;
  _letterboxTop;
  _letterboxBottom;
  _uncoveredArea;
  _video = "video";
  _canvas = "canvas";
  _ocrType = OCR_TYPE.IDCARD;
  _pictureWidth = window.innerWidth;
  _pictureHeight = window.innerHeight;
  _vertical;
  _useCapOcr;
  _iscaptured;
  _a = false;

  constructor() {
    super();
    this._md = new MobileDetect(window.navigator.userAgent);
    this.captureStopped = false;
  }

  get md() {
    return this._md;
  }

  isLandscape() {
    return (
      screen.orientation && screen.orientation.type.startsWith("landscape")
    );
  }

  get pictureWidth() {
    return this._pictureWidth;
  }

  set pictureWidth(value) {
    this._pictureWidth = value;
  }

  get pictureHeight() {
    return this._pictureHeight;
  }

  set pictureHeight(value) {
    this._pictureHeight = value;
  }

  async init(options, getUsers) {
    this._options = options;
    this._useCapOcr = this._options.useCapOcr;
    this._getUsers = getUsers;
    const navigator = window.navigator;

    try {
      // await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      console.error("Error requesting camera permission:", err);
      // Handle permission denied or other errors
      return;
    }

    this.createElement(options.containerId);
    this._initEventHandler();
    this.unload();
  }

  changeOcrType(ocrType) {
    if (ocrType === undefined) {
      return;
    }

    this._ocrType = null;
    if (this._ocrType === ocrType) {
      return;
    }

    this._ocrType = ocrType;
    this._resetUI();
  }

  _resetUI() {
    this._letterboxTop.innerHTML = "";
    this._letterboxBottom.innerHTML = "";
    this._guideArea.innerHTML = "";

    this._vertical = null;
    const containerSize = this._getContainerSize();
    const videoSize = this._calcVideoSize();
    const hspace = containerSize.width - videoSize.width;
    const vspace = containerSize.height - videoSize.height;

    const oldContainerDisplay = this._container.display;
    this._container.display = "none";
    if (hspace > vspace) {
      this._vertical = 0;
      this._letterboxTop.style.display = "inline";
      this._letterboxTop.style.top = `0px`;
      this._letterboxTop.style.bottom = null;
      this._letterboxTop.style.left = `0px`;
      this._letterboxTop.style.right = null;
      this._letterboxTop.style.width = `${hspace / 2}px`;
      this._letterboxTop.style.height = `100%`;

      this._videoWrapper.style.display = "inline";
      this._videoWrapper.style.left = `${hspace / 2}px`;
      this._videoWrapper.style.right = null;
      this._videoWrapper.style.top = `0px`;
      this._videoWrapper.style.bottom = null;
      this._videoWrapper.style.width = `${videoSize.width}px`;
      this._videoWrapper.style.height = `100%`;

      this._letterboxBottom.style.display = "inline";
      this._letterboxBottom.style.left = null;
      this._letterboxBottom.style.right = `0px`;
      this._letterboxBottom.style.top = `0px`;
      this._letterboxBottom.style.bottom = null;
      this._letterboxBottom.style.width = `${hspace / 2}px`;
      this._letterboxBottom.style.height = `100%`;
    } else {
      this._vertical = 1;
      this._letterboxTop.style.display = "block";
      this._letterboxTop.style.top = `0px`;
      this._letterboxTop.style.bottom = null;
      this._letterboxTop.style.left = `0px`;
      this._letterboxTop.style.right = null;
      this._letterboxTop.style.width = `100%`;
      this._letterboxTop.style.height = `${vspace / 2}px`;

      this._videoWrapper.style.display = "block";
      this._videoWrapper.style.width = `100%`;
      this._videoWrapper.style.left = `0px`;
      this._videoWrapper.style.right = null;
      this._videoWrapper.style.top = `${vspace / 2}px`;
      this._videoWrapper.style.bottom = null;
      this._videoWrapper.style.height = `${videoSize.height}px`;

      this._letterboxBottom.style.display = "block";
      this._letterboxBottom.style.width = `100%`;
      this._letterboxBottom.style.height = `${vspace / 2}px`;
      this._letterboxBottom.style.left = `0px`;
      this._letterboxBottom.style.right = null;
      this._letterboxBottom.style.top = null;
      this._letterboxBottom.style.bottom = `0px`;
    }

    switch (this._ocrType) {
      case 1: {
        this.createIdCardGuide();
        break;
      }
      case 2: {
        this.createPassportGuide();
        break;
      }
      case 3: {
        this.createCreaditGuide();
        break;
      }
      case 4: {
        this.createQrcodeGuide();
        break;
      }
      case 5: {
        this.createSealCertGuide();
        break;
      }
      case 6: {
        this.createBizGuide();
        break;
      }
      case 7: {
        this.createDocsEdge();
        break;
      }
      case 8: {
        this.createAccountGuide();
        break;
      }
      case 9: {
        this.createCheckGuide();
        break;
      }
      case 10: {
        this.createGiroGuide();
        break;
      }
    }

    this._container.display = oldContainerDisplay;
    this.loadVideoSource();
  }

  createIdCardGuide() {
    this._guideArea.style.border = "3px solid yellow";
    this._guideArea.style.zIndex = "10006";
  }

  createCreaditGuide() {
    this._guideArea.style.border = "3px solid yellow";
    this._guideArea.style.zIndex = "10006";
  }

  createSealCertGuide() {
    this._guideArea.style.border = "3px solid yellow";
    this._guideArea.style.zIndex = "10006";
  }

  createBizGuide() {
    this._guideArea.style.border = "3px solid yellow";
    this._guideArea.style.zIndex = "10006";
  }

  createDocsEdge() {
    this._guideArea.style.border = "3px solid yellow";
    this._guideArea.style.zIndex = "10006";
  }

  createPassportGuide() {
    const uncoveredAreaTop = document.createElement("div");
    const uncoveredAreaBottom = document.createElement("div");
    const mrzFace = document.createElement("div"); // 새로운 div 엘리먼트 생성

    // 새로운 uncovered-area에 클래스를 추가합니다.
    uncoveredAreaTop.classList.add("uncovered-area", "uncovered-area-top");
    uncoveredAreaBottom.classList.add(
      "uncovered-area",
      "uncovered-area-bottom"
    );

    // 윗 영역 스타일을 수정합니다.
    uncoveredAreaTop.style.backgroundColor = "rgba(169, 169, 169, 0.6)";
    uncoveredAreaTop.style.width = "100%";
    uncoveredAreaTop.style.height = "75%";
    uncoveredAreaTop.style.top = "0px";
    uncoveredAreaTop.style.position = "absolute";
    uncoveredAreaTop.style.zIndex = "10020";

    uncoveredAreaBottom.style.border = "3px solid yellow";
    uncoveredAreaBottom.style.width = "100%";
    uncoveredAreaBottom.style.height = "25%";
    uncoveredAreaBottom.style.zIndex = "10205";
    uncoveredAreaBottom.style.position = "absolute";
    uncoveredAreaBottom.style.bottom = "0px";

    mrzFace.classList.add("mrz_face");
    mrzFace.style.position = "absolute";
    mrzFace.style.width = "27%";
    mrzFace.style.height = "60%";
    mrzFace.style.top = "30%";
    mrzFace.style.left = "5%";
    mrzFace.style.backgroundImage = "url('images/faceline.png')";
    mrzFace.style.backgroundSize = "cover";
    mrzFace.style.backgroundPosition = "center";

    this._letterboxTop.style.backgroundColor = "rgba(255, 255, 255, 0)";

    this._uncoveredAreaTop = uncoveredAreaTop;
    this._uncoveredAreaBottom = uncoveredAreaBottom;
    this._guideArea.appendChild(uncoveredAreaTop);
    this._guideArea.appendChild(uncoveredAreaBottom);
    uncoveredAreaTop.appendChild(mrzFace);
  }

  createDocumentGuide() {}

  createCornerHighlight(parentElement, character, vertical, horizontal) {
    const cornerHighlight = document.createElement("div");
    cornerHighlight.classList.add("corner-highlight");
    cornerHighlight.style.position = "absolute";
    cornerHighlight.style.width = "20px"; // Adjust the size as needed
    cornerHighlight.style.height = "20px"; // Adjust the size as needed
    cornerHighlight.style.color = "#fff"; // White color
    cornerHighlight.style[vertical] = "0";
    cornerHighlight.style[horizontal] = "0";
    cornerHighlight.style.fontSize = "60px"; // Adjust the font size as needed
    cornerHighlight.textContent = character;

    parentElement.appendChild(cornerHighlight);
  }

  createQrcodeGuide() {
    // Create a div for QR code area box

    this._guideArea.style.border = "3px solid yellow";
    this._guideArea.style.zIndex = "10006";

    const qrCodeBox = document.createElement("div");
    qrCodeBox.classList.add("qr-code-box");

    // Add styles to highlight the corners of the QR code area
    qrCodeBox.style.position = "absolute";
    qrCodeBox.style.top = "10%";
    qrCodeBox.style.left = "20%";
    qrCodeBox.style.width = "60%";
    qrCodeBox.style.height = "60%";
    qrCodeBox.style.borderRadius = "10px"; // Rounded corners

    // Add corner highlights
    this.createCornerHighlight(qrCodeBox, "⌜", "top", "left");
    this.createCornerHighlight(qrCodeBox, "⌝", "top", "right");
    this.createCornerHighlight(qrCodeBox, "⌞", "bottom", "left");
    this.createCornerHighlight(qrCodeBox, "⌟", "bottom", "right");

    // Add the QR code box to the guideArea
    this._guideArea.appendChild(qrCodeBox);
  }

  createAccountGuide() {
    this._guideArea.style.border = "3px solid yellow";
    this._guideArea.style.zIndex = "10006";
  }
  
  createCheckGuide() {        
    this._guideArea.style.border = "3px solid yellow";
    this._guideArea.style.zIndex = "10006";
  }
      
  createGiroGuide() {
    this._guideArea.style.border = "3px solid yellow";
    this._guideArea.style.zIndex = "10006";

    const topPadding = document.createElement("div");
    topPadding.style.position = "absolute";
    topPadding.style.top = "0px";
    topPadding.style.left = "0px";
    topPadding.style.width = "100%";
    topPadding.style.height = "37.5%";
    topPadding.style.backgroundColor = "rgba(169, 169, 169, 0.6)";    
    
    const sampleBox = document.createElement("div");
    sampleBox.classList.add("fade-out-box");
    sampleBox.style.border = "2px solid red";
    sampleBox.style.position = "absolute";
    sampleBox.style.top = "37.5%";
    sampleBox.style.left = "0px";
    sampleBox.style.width = "100%";
    sampleBox.style.height = "25%";
    sampleBox.style.backgroundImage = "url('images/giro_sample.jpg')";
    sampleBox.style.backgroundSize = "contain";
    sampleBox.style.backgroundPosition = "center";
    sampleBox.style.backgroundRepeat = "no-repeat";

    const bottomPadding = document.createElement("div");
    bottomPadding.style.position = "absolute";
    bottomPadding.style.bottom = "0px";
    bottomPadding.style.left = "0px";
    bottomPadding.style.width = "100%";
    bottomPadding.style.height = "37.5%";
    bottomPadding.style.backgroundColor = "rgba(169, 169, 169, 0.6)";    
    
    this._guideArea.appendChild(topPadding);
    this._guideArea.appendChild(bottomPadding);
    this._guideArea.appendChild(sampleBox);
    this._guideArea.appendChild(guideBox);
  }

  capture(captured) {    
    this._isCaptured = captured;
    const options = this._options;
    options.rtcMaxRetryCount = 1; // rtcMaxRetryCount를 강제로 1로 설정
    options.rtcStartDelay = 0;    

    this.start();
  }

  async start() {
    let imageData = null;
    let cropWidth = null;
    let cropHeight = null;

    const options = this._options;
    // this._isCaptured = false;

    if (this._useCapOcr !== 1) {
      // 자동 촬영이 아닐 경우만 처리
      this.removeEventListener("captureWeb", this.captureWebEventListener);

      this.captureWebEventListener = (event) => {
        const eventData = event.detail;
        this.capture(eventData.captured);        
      };

      this.addEventListener("captureWeb", this.captureWebEventListener);
    } else {
      this._isCaptured = true;
    }

    if (options.useRtc && this._isCaptured) {
      this.captureInProgress = true;
      if(options.rtcStartDelay > 0) {
        await this.delay(options.rtcStartDelay);
      }

      const ocrSuccessListener = (event) => {
        if (event.detail === 1) {
          // Break the loop if event.detail is 1
          this.captureInProgress = false;
        }
      };

      this.addEventListener("ocrsuccess", ocrSuccessListener);

      let count = 1;

      while (this.captureInProgress && count <= options.rtcMaxRetryCount) {
        const cropImageData = await this.getCropImage(this._ocrType);
        imageData = cropImageData.imageData;
        cropWidth = cropImageData.cropWidth;
        cropHeight = cropImageData.cropHeight;

        const eventDetail = {
          imageData: imageData,
          imageWidth: cropWidth,
          imageHeight: cropHeight,
          currentCount: count,
          totalCount: options.rtcMaxRetryCount,
        };

        // 이벤트 디스패치 및 중지 여부 확인
        if (
          !this.dispatchEvent(
            new CustomEvent("imagecaptured", { detail: eventDetail })
          )
        ) {
          break;
        } else {
          await this.delay(options.rtcRetryDelay);
          count++;
        }
      }
    } else {
      // 다른 처리
    }
    this._isCaptured = false;
  }

  getCropImage(ocrType) {
    this.pictureWidth = this._videoRef.videoWidth;
    this.pictureHeight = this._videoRef.videoHeight;    

    const coordinates = this.convertGuideAreaCoordinates(
      this._guideArea,
      this._container,
      this._uncoveredArea,
      ocrType
    );

    const cropX = coordinates.x;
    const cropY = coordinates.y;
    let cropWidth = coordinates.width;
    let cropHeight = coordinates.height;

    const canvasRef = this._canvasRef;

    canvasRef.width = this.pictureWidth;
    canvasRef.height = this.pictureHeight;

    const ctx = canvasRef.getContext("2d");

    ctx.drawImage(this._videoRef, 0, 0, this.pictureWidth, this.pictureHeight);

    // IDCARD인 경우 리사이징
    if (ocrType === 1) {
      const resizedCanvas = document.createElement("canvas");
      const resizedCtx = resizedCanvas.getContext("2d");

      const targetWidth = 640;
      const targetHeight = 480;

      resizedCanvas.width = targetWidth;
      resizedCanvas.height = targetHeight;

      resizedCtx.drawImage(
        canvasRef,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      cropWidth = targetWidth;
      cropHeight = targetHeight;

      const imageData = resizedCtx.getImageData(0, 0, cropWidth, cropHeight);
      return { imageData, cropWidth, cropHeight };
    }

    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");

    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    croppedCtx.drawImage(
      canvasRef,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const imageData = croppedCtx.getImageData(0, 0, cropWidth, cropHeight);

    return { imageData, cropWidth, cropHeight };
  }

  convertGuideAreaCoordinates(guideArea, container, uncoveredArea, ocrType) {
    var containerStyle = window.getComputedStyle(container);
    var containerRect = container.getBoundingClientRect();
    var guideAreaRect = guideArea.getBoundingClientRect();

    // guideArea의 현재 좌표를 계산합니다.
    var left = guideAreaRect.left - containerRect.left;
    var top = guideAreaRect.top - containerRect.top;

    // 크롭 영역 초기화
    var cropWidth = 0;
    var cropHeight = 0;
    var guideAreaX = 0;
    var guideAreaY = 0;

    var fitWidth =
      this.pictureWidth / guideAreaRect.width <=
      this.pictureHeight / guideAreaRect.height;

    // 세로가 더 큰 경우에 대한 처리
    if (fitWidth) {
      switch (ocrType) {        
        case OCR_TYPE.PASSPORT: //
          cropWidth = this.pictureWidth;
          cropHeight =
            (this.pictureWidth * guideAreaRect.height) / guideAreaRect.width;

          guideAreaY = (this.pictureHeight - cropHeight) / 2;
          guideAreaX = 0;

          guideAreaY += (cropHeight * 3) / 4;
          cropHeight = cropHeight / 4;

          break; 
        case OCR_TYPE.GIRO: //
          cropWidth = this.pictureWidth;
          cropHeight =
            (this.pictureWidth * guideAreaRect.height) / guideAreaRect.width;
          cropHeight = cropHeight * (2/8);            

          guideAreaY = (this.pictureHeight - cropHeight) / 2;
          guideAreaX = (this.pictureWidth - cropWidth) / 2;
          break;        
        default:
          cropWidth = this.pictureWidth;
          cropHeight =
            (this.pictureWidth * guideAreaRect.height) / guideAreaRect.width;
          guideAreaY = (this.pictureHeight - cropHeight) / 2;
          guideAreaX = 0;
          // 다른 OCR_TYPE에 대한 처리 추가
          break;
      }
    } else {
      switch (ocrType) {        
        case OCR_TYPE.PASSPORT:
          // OCR_TYPE.PASSPORT에 대한 처리 추가
          cropHeight = this.pictureHeight;
          cropWidth =
            (this.pictureHeight * guideAreaRect.width) / guideAreaRect.height;
          guideAreaY = 0;
          guideAreaX = (this.pictureWidth - cropWidth) / 2;
          guideAreaY += (cropHeight * 3) / 4;
          cropHeight = cropHeight / 4;

          break;   
        case OCR_TYPE.GIRO: //
          cropHeight = this.pictureHeight;            
          cropWidth =
            (this.pictureHeight * guideAreaRect.width) / guideAreaRect.height;
          cropWidth = cropWidth * (2/8);

          guideAreaY = (this.pictureHeight - cropHeight) / 2;
          guideAreaX = (this.pictureWidth - cropWidth) / 2;
          break;   
        default:
          cropHeight = this.pictureHeight;
          cropWidth =
            (this.pictureHeight * guideAreaRect.width) / guideAreaRect.height;
          guideAreaY = 0;
          guideAreaX = (this.pictureWidth - cropWidth) / 2;
          // 다른 OCR_TYPE에 대한 처리 추가
          break;
      }
    }

    var coordinates = {
      x: guideAreaX,
      y: guideAreaY,
      width: cropWidth,
      height: cropHeight,
    };

    return coordinates;
  }

  getVideoRatio(ocrType) {
    switch (ocrType) {
      case OCR_TYPE.IDCARD: {
        return {
          width: 4,
          height: 3,
        };
      }
      case OCR_TYPE.PASSPORT: {
        return {
          width: 4,
          height: 3,
        };
      }
      case OCR_TYPE.CREDITCARD: {
        return {
          width: 1,
          height: 0.65,
        };
      }
      case OCR_TYPE.QRCODE: {
        return {
          width: 4,
          height: 3,
        };
      }
      case OCR_TYPE.SEALCERT: {
        return {
          width: 1,
          height: 1.4,
        };
      }
      case OCR_TYPE.BIZREGCERT: {
        return {
          width: 1,
          height: 1.4,
        };
      }
      case OCR_TYPE.DOCS: {
        return {
          width: 1,
          height: 1.4,
        };
      }
      case OCR_TYPE.ACCOUNT: {
        return {
          width: 2,
          height: 1,
        };
      }
      case OCR_TYPE.CHECK: {
        return {
          width: 40,
          height: 17,
        };
      }
      case OCR_TYPE.GIRO: {
        return {
          width: 13,
          height: 8,
        };
      }
      default: {
        return {
          width: 4,
          height: 3,
        };
      }
    }
  }

  createElement(containerId) {
    this._container = document.querySelector(containerId);

    // top or left letter box
    this._letterboxTop = document.createElement("div");
    this._letterboxTop.classList.add("background", "top");
    this._letterboxTop.setAttribute("style", "display: block !important;");
    this._letterboxTop.style.display = "block";
    this._letterboxTop.style.zIndex = "10001";
    this._letterboxTop.style.position = "fixed";
    this._letterboxTop.style.height = "var(--blur_bg_height)";
    this._letterboxTop.style.backgroundColor = "#ffffff00";
    this._letterboxTop.style.width = "100%";
    this._container.appendChild(this._letterboxTop);

    // create video wrapper
    this._videoWrapper = document.createElement("div");
    this._videoWrapper.classList.add("wrapper");
    this._videoWrapper.style.position = "absolute";

    // video
    this._videoRef = document.createElement("video");
    this._videoRef.id = "kwcVideo";
    this._videoRef.classList.add("video");
    this._videoRef.autoplay = "autoplay";
    this._videoRef.WebKitPlaysInline = true;
    this._videoRef.setAttribute("playsinline", true);
    this._videoRef.muted = true;
    this._videoRef.setAttribute("muted", true);
    this._videoRef.setAttribute(
      "style",
      "position: absolute; left:0px; top:0px; width:100%; height:100%; z-index: 10002; background-color: transparent; opacity: 1; transition: opacity 0.8s ease 0s; object-fit:cover;"
    );

    // canvas
    this._canvasRef = document.createElement("canvas");
    this._canvasRef.id = "kwcCanvas";
    this._canvasRef.classList.add("canvas");
    this._canvasRef.setAttribute("style", "display: none;");

    // guide
    this._guideArea = document.createElement("div");
    this._guideArea.id = "kwcGuideArea";
    this._guideArea.style.position = "absolute";
    this._guideArea.style.width = "100%";
    this._guideArea.style.height = "100%";

    this._videoWrapper.appendChild(this._videoRef);
    this._videoWrapper.appendChild(this._canvasRef);
    this._videoWrapper.appendChild(this._guideArea);

    this._container.appendChild(this._videoWrapper);

    // bottom or right letter box
    this._letterboxBottom = document.createElement("div");
    this._letterboxBottom.classList.add("background", "bottom");
    this._letterboxBottom.style.display = "block";
    this._letterboxBottom.style.zIndex = "10003";
    this._letterboxBottom.style.position = "fixed";
    this._letterboxBottom.style.height = "var(--blur_bg_height)";
    this._letterboxBottom.style.backgroundColor = "#ffffff00";
    this._letterboxBottom.style.width = "100%";

    this._letterboxBottom.style.width = "100%";

    this._container.appendChild(this._letterboxBottom);
  }

  _getContainerSize() {
    let oldDisplay = null;
    oldDisplay = this._container.style.display;
    this._container.style.display = "block";
    // Get the container size
    const sizeObj = {
      width: this._container.clientWidth,
      height: this._container.clientHeight, // Use offsetHeight instead of clientHeight
    };

    this._container.style.display = oldDisplay;

    return sizeObj;
  }

  _calcVideoSize() {
    const containerSize = this._getContainerSize(); //7
    const videoRatio = this.getVideoRatio(this._ocrType);

    const wl = containerSize.width / videoRatio.width;
    const hl = containerSize.height / videoRatio.height;
    const minLength = Math.min(wl, hl);

    return {
      width: minLength * videoRatio.width,
      height: minLength * videoRatio.height,
    };
  }

  _initEventHandler() {
    this._videoRef.addEventListener("loadedmetadata", (event) => {
      this.dispatchEvent(new Event("webcamready"));
    });

    this._isCaptured = false; // 초기 값 설정

    window.addEventListener("beforeunload", (event) => {
      this.unload();
    });

    window.addEventListener("orientationchange", (event) => {
      this.unload();
      setTimeout(() => {
        this._resetUI();
      }, 300);
    });
  }

  async getUsers() {
    try {
      const constraints = await this.getConstraints();
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      return mediaStream;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async loadVideoSource() {
    try {
      const mediaStream = await this.getUsers();

      this._mediaStream = mediaStream;

      if ("srcObject" in this._videoRef) {
        this._videoRef.srcObject = mediaStream;
      } else {
        this._videoRef.src = URL.createObjectURL(mediaStream);
      }
    } catch (err) {
      console.log(err);
      alert(err);
      throw err;
    }
  }

  async getConstraints() {
    // forcusDistance로 망원 카메라 찾기 -> forcusDistance 있으면 후면 카메라 마지막에서 두번째로 가져오기
    const devices = await navigator.mediaDevices.enumerateDevices();
    const filteredDevices = devices.filter((v) => {
      return v.kind === "videoinput";
    });

    for (const device of filteredDevices) {
    }

    const deviceId = filteredDevices[filteredDevices.length - 1].deviceId;

    let isIpad =
      /Macintosh/i.test(navigator.userAgent) &&
      navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 1;
    

    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        zoom: true,
        focusMode: "continuous",
        width: {
          ideal: isIpad ? (this.isLandscape() ? 1920 : 1080) : 1080,          
        },
        height: {
          ideal: isIpad ? (this.isLandscape() ? 1080 : 1920) : 1920,          
        },
      },
    };
    
    if (/Android/i.test(navigator.userAgent)) {
      console.log("This is an android device.");
      //alert("This is an android device.")
      //ios인 경우에만 마지막 device를 선택하도록 설정
      if(filteredDevices.length > 0) {
        constraints.video.deviceId = filteredDevices[filteredDevices.length - 1].deviceId;
      }
    } else if (/iPad|iPhone|iPod/i.test(navigator.userAgent)) {
      console.log("This is not an iOS device!");
    } else {
      console.log("Etc device : " + navigator.userAgent);
    }  

    return constraints;
  }

  unload() {
    if (this._mediaStream) {
      this._mediaStream.getTracks().forEach((track) => track.stop());
      this._mediaStream = null;
      this._videoRef.srcObject = null;
    }
  }

  //move To Utils
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

