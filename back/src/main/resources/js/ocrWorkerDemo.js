let controller = new AbortController();

// 지정된 URL(API 주소)로 이미지를 전송하고, 요청에 대한 응답 반환
const attemptFetch = async (url, data) => {
  const result = await fetch(url, {
    method: "POST",
    signal: controller.signal, // AbortController의 시그널을 사용하여 요청을 취소
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });
  return result;
};

self.onmessage = async (e) => {
  if (e?.data) {
    if (e.data.ocrType && e.data.base64Data) {
      const ocrType = e.data.ocrType;
      const base64Data = e.data.base64Data;

      try {
        const result = await Promise.race([
          attemptFetch("http://localhost:80/ocrtest", JSON.stringify(e.data))
          //서버에 올리거나 외부에서 접근하기 위해서는 해당 url 변경
        ]);
        let response = await result.json();
        let resultJSON = { resultJSON: response };
        self.postMessage({ type: 'ocrResult', message: resultJSON })

      } catch (e) {
        console.log(e);
        controller?.abort(); // AbortController를 사용하여 이전 요청을 취소
        self.postMessage({ type: 'ocrResult', message: null })
      }
    } else if (e.data === "new") {
      controller = new AbortController();
      self.postMessage({ type: 'ocrResult', message: null })
    }
  }
};

const dataURLtoBlob = (dataURL) => {  
  var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  return base64toBlob(dataURL.split(',')[1], mimeString);  
};

const base64toBlob = (base64Data, mimeString) => {
  var byteString = atob(base64Data);  
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);

  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
};
