import axios from 'axios';

const API_URL = '/api/payments-licenses';

// 사용자의 결제 및 면허 정보를 가져오는 함수
export const getPaymentLicenseInfo = (userId) => {
    // 실제로는 로그인된 사용자 정보를 사용해야 하므로 userId를 인자로 받지 않을 수 있습니다.
    return axios.get(`${API_URL}/${userId}`);
};

// 새 결제 수단을 등록하는 함수
export const addPaymentMethod = (paymentData) => {
    return axios.post(API_URL, paymentData);
};
