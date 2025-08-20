import {
  OCR_TYPE,
  activateCircle,
  buttonIds,
  getOcrTypeFromButtonId,
  rtcType,
  ocrResultFormat,
} from "./utils.js";
import WebCamera from "./webCamera.js";

const KOI_OCR_EVENT = {
  READY: "ready",
  RESULT: "result",
  PROGRESS: "progress",
  CAMERA_STARTED: "camerastarted",
};

class KoiOcr extends EventTarget {
  _webCamera;
  _ocrWorker;
  _ocrProcessor;
  _IdCardOCRProcessor;
  _Barcode;
  _DocsAffine;
  _ocrType = OCR_TYPE.PASSPORT;
  _rtcType = rtcType.MANUAL;
  _options;
  _useWasmOcr;
  _points;
  _serverUrls = {};

  constructor(options) {
    super();
    this._webCamera = new WebCamera();
    this._getUsers = this._webCamera.getUsers();
    if (options.ocrWorkerJs) {
      this._ocrWorker = new Worker(options.ocrWorkerJs);
    }

    const defaultOptions = {
      //옵션 값 없으면 디폴트 값으로 전달
      useWebCamera: true,
      cameraOptions: {},
      useWasmOcr: true,
      ocrType: OCR_TYPE.PASSPORT,
    };

    this._options = options;

    this._ocrType = this._options.ocrType;
    this._rtcType = this._options.rtcType;
    this._useWasmOcr = this._options.useWasmOcr;
  }

  async init() {
    const options = this._options;
    this._webCamera.init(this._options.cameraOptions, this._getUsers);
    this._initEventHandler();
  }

  get useWebCamera() {
    return this._webCamera != null;
  }

  get useWasmOcr() {
    return this._ocrProcessor != null && this._IdCardOCRProcessor != null;
  }

  capture() {
    this._webCamera.capture(true);
  }

  _initEventHandler() {
    if (this.useWebCamera) {
      this._webCamera.addEventListener("webcamready", (event) => {
        this.dispatchReadyEvent();
      });

      let isCaptured = false;

      this.addEventListener("capture", (event) => {
        isCaptured = true;
        this.capture();
      });

      this._webCamera.addEventListener("imagecaptured", (event) => {
        if (this.processImage(event.detail)) {
          event.preventDefault();
        }
      });
    }

    document.addEventListener(
      "touchmove",
      function (event) {
        if (event.touches.length > 1 || (event.scale && event.scale !== 1))
          return;
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
          event.preventDefault();
        }
      },
      { passive: false }
    );

    window.addEventListener("beforeunload", (event) => {
      // WebAssembly 모듈 초기화
      if (this.useWasmOcr) {
        this._ocrProcessor.unload();
        this._IdCardOCRProcessor.unload();
      }
    });
  }

  async processImage(data) {
    const imageData = data.imageData;
    const imageWidth = data.imageWidth;
    const imageHeight = data.imageHeight;
    const totalCount = data.totalCount;
    const currentCount = data.currentCount;

    const eventDetail = {
      success: false,
      imageData: imageData,
      imageWidth: imageWidth,
      imageHeight: imageHeight,
      ocrResult: null,
    };

    try {
      const eventType = await this.processOCR(
        imageData,
        imageWidth,
        imageHeight,
        eventDetail,
        totalCount,
        currentCount,
        this._ocrType
      );
      this.dispatchEvent(new CustomEvent(eventType, { detail: eventDetail }));
      return eventType == KOI_OCR_EVENT.RESULT;
    } catch (error) {
      console.error("Error processing image:", error.message);
      // 적절한 에러 처리 추가
    }
  }

  async processOCR(
    imageData,
    imageWidth,
    imageHeight,
    eventDetail,
    totalCount,
    currentCount,
    ocrType
  ) {
    if (this._useWasmOcr) {
      let result = null;
      try {
        if (ocrType == 2) {
          result = await this._ocrProcessor.ocr(
            imageData,
            imageWidth,
            imageHeight
          );
        } else if (ocrType == 4) {
          result = this._Barcode.decode(
            imageData.data,
            imageWidth,
            imageHeight
          );
        } else if (ocrType == 1) {
          result = this._IdCardOCRProcessor.ocr(
            imageData,
            imageWidth,
            imageHeight
          );
        } else if (ocrType == 7) {
          const result = await new Promise((resolve, reject) => {
            const resultPoints = this._DocsAffine.getPoints(
              imageData,
              imageData.width,
              imageData.height
            );

            const points = resultPoints.resultJSON.points;
            this._points = points;
            console.log(" this._points: ", this._points);

            // this._points 배열에서 -1이 있는지 확인
            const hasNegativeOne = this._points.some(
              (point) => point.x === -1 || point.y === -1
            );

            if (!hasNegativeOne) {
              const kwcGuideArea = document.getElementById("kwcGuideArea");
              kwcGuideArea.style.zIndex = "10002";
              const guideAreaRect = kwcGuideArea.getBoundingClientRect();
              const canvas = document.createElement("canvas");
              canvas.width = imageData.width;
              canvas.height = imageData.height;
              const context = canvas.getContext("2d");
              context.putImageData(imageData, 0, 0);
              const guideImage = document.createElement("img");
              guideImage.id = "guideImage";

              guideImage.style.position = "absolute";
              guideImage.style.top = "50%";
              guideImage.style.left = "50%";
              guideImage.style.transform = "translate(-50%, -50%)";
              guideImage.style.width = guideAreaRect.width + "px";
              guideImage.style.height = guideAreaRect.height + "px";

              const radius = 10; // 포인트의 반지름을 설정합니다.

              // 좌표를 저장할 배열 생성
              let affinePoints = [];
              let startX, startY;

              for (let i = 0; i < this._points.length; i++) {
                // 좌표가 -1인 경우, 이미지 다시 찍도록 해야함
                const point = this._points[i];
                const x = point.x;
                const y = point.y;

                function canvasX(clientX, guideAreaRect, imageData) {
                  var bound = guideAreaRect;
                  return Math.round(
                    clientX * (bound.width / imageData.width) - radius - 2
                  );
                }

                function canvasY(clientY, guideAreaRect, imageData) {
                  var bound = guideAreaRect;
                  return Math.round(
                    clientY * (bound.height / imageData.height) - radius - 2
                  );
                }

                const relativeX = canvasX(x, guideAreaRect, imageData);
                const relativeY = canvasY(y, guideAreaRect, imageData);

                affinePoints.push({ x: relativeX, y: relativeY });

                const pointDiv = document.createElement("div");
                pointDiv.className = "point-div point-div" + (i + 1); // 클래스 이름에 인덱스 추가
                pointDiv.style.position = "absolute";
                pointDiv.style.width = "25px";
                pointDiv.style.height = "25px";
                pointDiv.style.backgroundColor = "rgb(52 152 219 / 28%)"; // 배경색을 #3498db8c로 설정
                pointDiv.style.borderRadius = "50%";
                pointDiv.style.zIndex = "10010";
                pointDiv.style.border = "2px solid var(--line-border-fill)"; // 테두리 색상을 var(--line-border-fill)로 설정

                pointDiv.style.left = `${relativeX}px`;
                pointDiv.style.top = `${relativeY}px`;
                kwcGuideArea.appendChild(pointDiv);

                pointDiv.addEventListener(
                  "touchstart",
                  handleTouchStart(i),
                  false
                ); // 터치 시작 이벤트 핸들러에 인덱스 전달
                pointDiv.addEventListener("touchmove", handleTouchMove, false);
                pointDiv.addEventListener("touchend", handleTouchEnd, false);

                // 터치 시작 지점 기록
                function handleTouchStart(index) {
                  return function (event) {
                    startX =
                      event.touches[0].clientX - parseInt(pointDiv.style.left);
                    startY =
                      event.touches[0].clientY - parseInt(pointDiv.style.top);

                    // 터치 시작 시 해당 인덱스의 좌표를 affinePoints 배열에 저장
                    affinePoints[index] = { x: x, y: y };
                  };
                }

                // 터치 이동 처리
                function handleTouchMove(event) {
                  const touchX = event.touches[0].clientX;
                  const touchY = event.touches[0].clientY;

                  // 현재 터치 위치로 점 이동
                  pointDiv.style.left = touchX - startX + "px";
                  pointDiv.style.top = touchY - startY + "px";

                  // 움직인 좌표 저장
                  const movedX = parseInt(pointDiv.style.left); // 점의 중심으로 보정
                  const movedY = parseInt(pointDiv.style.top); // 점의 중심으로 보정

                  // pointDiv의 클래스 이름에서 인덱스 추출
                  const index = parseInt(
                    pointDiv.className.split(" ")[1].slice(-1)
                  );

                  // 해당 포인트의 좌표를 affinePoints 배열에 업데이트
                  affinePoints[index - 1] = { x: movedX, y: movedY };
                }

                // 터치 종료 처리
                function handleTouchEnd(event) {
                  // 터치 종료 시 필요한 작업 수행
                }
              }

              const imageDataURL = canvas.toDataURL("image/jpeg");
              guideImage.src = imageDataURL;
              kwcGuideArea.appendChild(guideImage);
              const titleEl = document.querySelector(".title");
              const pointerBtn = document.querySelector("#pointerBtn");
              titleEl.innerText = "";
              pointerBtn.style.display = "block";

              pointerBtn.onclick = async () => {
                let originalPoints = [];

                for (let i = 0; i < affinePoints.length; i++) {
                  const affinePoint = affinePoints[i];

                  // 역변환하여 원래의 이미지 상대적인 위치로 계산

                  function reverseCanvasX(relativeX, guideAreaRect, imageData) {
                    var bound = guideAreaRect;
                    return Math.round(
                      (relativeX + radius + 2) / (bound.width / imageData.width)
                    );
                  }

                  function reverseCanvasY(relativeY, guideAreaRect, imageData) {
                    var bound = guideAreaRect;
                    return Math.round(
                      (relativeY + radius + 2) /
                        (bound.height / imageData.height)
                    );
                  }

                  const originalX = reverseCanvasX(
                    affinePoint.x,
                    guideAreaRect,
                    imageData
                  );
                  const originalY = reverseCanvasY(
                    affinePoint.y,
                    guideAreaRect,
                    imageData
                  );

                  // 생성된 point 객체를 배열에 저장
                  originalPoints.push({ x: originalX, y: originalY });
                  console.log("originalPoints: ", originalPoints);
                }

                function sortPoints(originalPoints) {
                  // 배열의 길이가 4가 아니면 예외 처리
                  if (originalPoints.length !== 4) {
                    throw new Error(
                      "Invalid number of points. Expected 4 points."
                    );
                  }

                  let sorted = false;

                  while (!sorted) {
                    sorted = true; // 초기에는 정렬되었다고 가정

                    // 첫 번째와 두 번째 배열의 x 좌표 비교 후 순서 변경
                    if (originalPoints[0].x > originalPoints[1].x) {
                      [originalPoints[0], originalPoints[1]] = [
                        originalPoints[1],
                        originalPoints[0],
                      ];
                      sorted = false; // 정렬이 발생했으므로 다시 확인 필요
                    }

                    // 세 번째와 네 번째 배열의 x 좌표 비교 후 순서 변경
                    if (originalPoints[3].x > originalPoints[2].x) {
                      [originalPoints[2], originalPoints[3]] = [
                        originalPoints[3],
                        originalPoints[2],
                      ];
                      sorted = false; // 정렬이 발생했으므로 다시 확인 필요
                    }

                    // 추가 조건: 첫 번째 배열의 y 좌표가 네 번째 배열의 y 좌표보다 크면 순서 변경
                    if (originalPoints[0].y > originalPoints[3].y) {
                      [originalPoints[0], originalPoints[3]] = [
                        originalPoints[3],
                        originalPoints[0],
                      ];
                      sorted = false; // 정렬이 발생했으므로 다시 확인 필요
                    }

                    // 추가 조건: 두 번째 배열의 y 좌표가 세 번째 배열의 y 좌표보다 크면 순서 변경
                    if (originalPoints[1].y > originalPoints[2].y) {
                      [originalPoints[1], originalPoints[2]] = [
                        originalPoints[2],
                        originalPoints[1],
                      ];
                      sorted = false; // 정렬이 발생했으므로 다시 확인 필요
                    }

                    // 추가 조건: 첫 번째 배열의 y 좌표가 세 번째 배열의 y 좌표보다 크면 순서 변경
                    if (originalPoints[0].y > originalPoints[2].y) {
                      [
                        originalPoints[0],
                        originalPoints[1],
                        originalPoints[2],
                        originalPoints[3],
                      ] = [
                        originalPoints[1],
                        originalPoints[2],
                        originalPoints[3],
                        originalPoints[0],
                      ];
                      sorted = false; // 정렬이 발생했으므로 다시 확인 필요
                    }
                  }

                  // 정렬된 좌표 배열을 반환합니다.
                  return originalPoints;
                }

                const sortedPoints = sortPoints(originalPoints);
                console.log("sortedPoints: ", sortedPoints);

                const result = this._DocsAffine.getAffine(
                  imageData,
                  imageData.width,
                  imageData.height,
                  sortedPoints
                );

                resolve(result);
                const base64Data = result.resultJSON.base64image;
                eventDetail.base64Data = base64Data;
              };
            } else {
              // 좌표가 -1이 들어온 경우, 화면에서 벗어난 경우 예외 처리
              const titleEl = document.querySelector(".title");
              const captureBtn = document.querySelector("#cap_btn");
              titleEl.innerText =
                "문서를 찾을 수 없습니다.\n다시 시도해주세요.";
              captureBtn.style.display = "block";
            }
          });

          return this.processOCRResult(
            result,
            eventDetail,
            totalCount,
            currentCount,
            imageData
          );
        }
      } catch (error) {
        console.error("OCR Error:", error.message);
        alert("OCR Error:" + error.message);
        // OCR 실패 시에 대한 처리 추가
      }
      return this.processOCRResult(
        result,
        eventDetail,
        totalCount,
        currentCount,
        imageData
      );
      // WASM 아닌 경우
    } else {
      const result = await new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const context = canvas.getContext("2d");
        context.putImageData(imageData, 0, 0);

        const base64String = canvas.toDataURL("image/jpeg").split(",")[1];
        const base64Data = base64String;

        if (this._ocrWorker) {
          this._ocrWorker.postMessage({ ocrType, base64Data });
          this._ocrWorker.onmessage = (e) => {
            if (e.data.type === "ocrResult") {
              const result = e.data.message;
              console.log("result: ", result);
              resolve(result); // 워커로부터의 응답을 전달하여 Promise를 해결
            }
          };
        } else {
          resolve(null);
        }
      });
      return this.processOCRResult(
        result,
        eventDetail,
        totalCount,
        currentCount,
        imageData
      );
    }
  }

  processOCRResult(result, eventDetail, totalCount, currentCount, imageData) {
    if (result && result.resultJSON) {
      eventDetail.ocrResult = result;
    }
    if (
      result &&
      result.resultJSON &&
      result.resultJSON.resultCode === "0000"
    ) {
      // OCR successfully completed
      const successEvent = new CustomEvent("ocrsuccess", { detail: 1 });
      this._webCamera.dispatchEvent(successEvent);
      eventDetail.success = true;
      return KOI_OCR_EVENT.RESULT;
    } else {
      const successEvent = new CustomEvent("ocrsuccess", { detail: 0 });
      this._webCamera.dispatchEvent(successEvent);

      if (currentCount >= totalCount) {
        // All images processed
        let savedImageData;

        // ocr 마지막 시도차 이미지 저장
        if (imageData) {
          savedImageData = convertImageDataToBase64(imageData);
        }
        return KOI_OCR_EVENT.RESULT;
      } else {
        // OCR in progress, emit PROGRESS event
        return KOI_OCR_EVENT.PROGRESS;
      }
    }
  }

  runCamera() {
    if (this.useWebCamera) {
      this._stopOcr = false; // Reset the flag before starting OCR
      this._webCamera.start(); // Pass the flag to stop OCR
      this.dispatchEvent(new Event(KOI_OCR_EVENT.CAMERA_STARTED));
    } else {
      throw new Error("WebCamera disabled.");
    }
  }

  dispatchReadyEvent() {
    this.dispatchEvent(new Event(KOI_OCR_EVENT.READY));
  }

  async changeOcrType(ocrType) {
    if (ocrType === undefined) {
      return;
    }

    this._ocrType = null;
    if (this._ocrType === ocrType) {
      return;
    }

    const options = this._options;

    let loadModelResult = 1;
    if (options.useWasmOcr) {
      if (ocrType == 2 && !this._ocrProcessor) {
        this._ocrProcessor = new OCRProcessor();
        loadModelResult = await this._ocrProcessor.loadModel({
          wasmDirectory: "./js/passport/",
        });

        if (loadModelResult == 1) {
          if (this.useWebCamera) {
            await this._webCamera.changeOcrType(ocrType);
          }
        } else {
          this._ocrProcessor.unload();
          this._ocrProcessor = null;
        }
      } else if (ocrType == 1 && !this._IdCardOCRProcessor) {
        this._IdCardOCRProcessor = new IdCardOCRProcessor();
        loadModelResult = await this._IdCardOCRProcessor.loadModel({
          wasmDirectory: "./js/idcard/",
        });

        if (loadModelResult == 1) {
          if (this.useWebCamera) {
            await this._webCamera.changeOcrType(ocrType);
          }
        } else {
          this._IdCardOCRProcessor.unload();
          this._IdCardOCRProcessor = null;
        }
      } else if (ocrType == 4 && !this._Barcode) {
        this._Barcode = new Barcode();
        loadModelResult = await this._Barcode.initialize({
          wasmDirectory: "./js/barcode/",
        });
        if (loadModelResult == 1) {
          if (this.useWebCamera) {
            await this._webCamera.changeOcrType(ocrType);
          }
        } else {
          this._Barcode = null;
        }
      } else if (ocrType == 7 && !this._DocsAffine) {
        this._DocsAffine = new DocsAffine();
        loadModelResult = await this._DocsAffine.loadModel({
          wasmDirectory: "./js/affine/",
        });

        if (loadModelResult == 1) {
          if (this.useWebCamera) {
            await this._webCamera.changeOcrType(ocrType);
          }
        } else {
          this._DocsAffine = null;
        }
      }
    } else {
    }

    if (loadModelResult != 1) {
      const error = {
        code: loadModelResult,
        message: this.getErrorMessage(loadModelResult),
      };
      throw new Error(JSON.stringify(error));
    }

    this._ocrType = ocrType;

    if (this.useWebCamera) {
      await this._webCamera.changeOcrType(ocrType);
    }
  }

  // 토큰&라이선스 체크 결과 처리 함수
  getErrorMessage(tokenResult) {
    switch (tokenResult) {
      case 1:
        return "Loading Success.";
      case -1:
        return "Token authentication failed. Please check the token.";
      case -2:
        return "License authentication error. Please check your license.";
      case -3:
        return "The model license has expired. Please check the license.";
      default:
        return "Error initializing KoiOcr.";
    }
  }
}

function convertImageDataToBase64(imageData) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
}

export {
  KOI_OCR_EVENT,
  OCR_TYPE,
  activateCircle,
  buttonIds,
  rtcType,
  KoiOcr as default,
  getOcrTypeFromButtonId,
  ocrResultFormat,
};
