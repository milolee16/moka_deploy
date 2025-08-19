export const OCR_TYPE = {
  IDCARD: 1,       // 주민등록증, 운전면허증, 여권(외국인등록증 미포함) WASM
  PASSPORT: 2,     // 여권 MRZ WASM
  CREDITCARD: 3,   // 신용카드 API
  QRCODE: 4,       // QR/Barcode WASM
  SEALCERT: 5,     // 인감증명서 
  BIZREGCERT: 6,   // 사업자등록증
  DOCS: 7,         // 문서 crop WASM
  ACCOUNT: 8,         // 계좌번호 인식
  CHECK: 9,         // 수표 인식
  GIRO: 10,         // 지로번호 인식
  IDFAKE: 11,         // 지로번호 인식
};

export const rtcType = {
  AUTO: 1,
  MANUAL: 2,
  FILE: 3,
}

export function extendObj(defObj, obj, expension) {
  expension = typeof expension === "undefined" ? false : expension;

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (Array.isArray(defObj[key]) || defObj[key] === null) {
        defObj[key] = obj[key];
      } else if (defObj.hasOwnProperty(key)) {
        if (typeof defObj[key] === "object") {
          defObj[key] = extendObj(defObj[key], obj[key]);
        } else {
          defObj[key] = obj[key];
        }
      } else if (expension) {
        defObj[key] = obj[key];
      }
    }
  }
  return defObj;
}

//여기에 result 포맷팅하는 함수 추가해도 됨
// 버튼 id에 따라 OCR 타입을 반환하는 함수
export function getOcrTypeFromButtonId(buttonId) {
  switch (buttonId) {
    case "passport":
      return OCR_TYPE.PASSPORT;
    case "qr_barcode":
      return OCR_TYPE.QRCODE;
    case "idcard":
      return OCR_TYPE.IDCARD;
    case "card":
      return OCR_TYPE.CREDITCARD;
    case "cor_certify":
      return OCR_TYPE.SEALCERT;
    case "biz_license":
      return OCR_TYPE.BIZREGCERT;
    case "docs_edge":
      return OCR_TYPE.DOCS;
    case "account":
      return OCR_TYPE.ACCOUNT;
    case "check":
      return OCR_TYPE.CHECK;
    case "giro":
      return OCR_TYPE.GIRO;
      case "idfake":
      return OCR_TYPE.IDFAKE;
    default:
      return null;
  }
}

// 버튼 id 배열
export const buttonIds = [
  "passport",
  "qr_barcode",
  "idcard",
  "card",
  "cor_certify",
  "biz_license",
  "docs_edge",
  "account",
  "check",
  "giro",
  "idfake",
];

export function activateCircle(action) {
  // 현재 active 상태인 circle을 찾습니다.
  const currentActiveCircle = document.querySelector(".circle.active");

  // 분기 처리를 통해 각각의 기능을 수행합니다.
  switch (action) {
    case 1: // 다음 circle을 활성화합니다.
      const nextCircle = currentActiveCircle.nextElementSibling;
      if (nextCircle) {
        currentActiveCircle.classList.remove("active");
        nextCircle.classList.add("active");
      }
      break;

    case 2: // 이전 circle을 활성화합니다.
      const previousCircle = currentActiveCircle.previousElementSibling;
      if (previousCircle) {
        currentActiveCircle.classList.remove("active");
        previousCircle.classList.add("active");
      }
      break;

    case 3: // 첫 번째 circle을 활성화합니다.
      const circles = document.querySelectorAll(".circle");
      const firstCircle = circles[0];
      currentActiveCircle.classList.remove("active");
      firstCircle.classList.add("active");
      break;

    default:
      break;
  }
}

export const ocrResultFormat = (ocrResult) => {
  // Accessing resultJSON from data
  let resultItems = "";

  const fieldResults = ocrResult.resultJSON.formResult.fieldResults;

  for (let i = 0; i < fieldResults.length; i++) {
    const fieldResult = fieldResults[i];
    let value = fieldResult.value;
    // Check if the field is '카드번호' and if the value is numeric
    if (fieldResult.displayName === "카드번호" && /^\d+$/.test(value)) {
      // Formatting based on the length of the value
      if (value.length === 16) {
        // Splitting the value into groups of 4 digits
        value = value.replace(
          /(\d{4})(\d{4})(\d{4})(\d{4})/,
          "$1 $2 $3 $4"
        );
      } else if (value.length === 15) {
        // Splitting the value into groups of 4, 6, and 5 digits
        value = value.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
      }
    }
    resultItems += `<tr>
                              <td>${fieldResult.displayName}</td>
                              <td>${value}</td>
                          </tr>`;
  }

  return `<table class="result_content">
                  <thead>
                      <tr>
                          <th>인식 타입</th>
                          <th>인식 결과</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${resultItems}
                  </tbody>
              </table>`;
};

