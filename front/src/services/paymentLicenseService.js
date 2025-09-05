import apiClient from '../utils/apiClientWithRefresh';

const API_URL = '/api/my-page';

// Get both payments and license info
export const getPaymentLicenseInfo = async () => {
    // Two separate calls in parallel
    const [paymentsResponse, licensesResponse] = await Promise.all([
        apiClient.get(`${API_URL}/payments`),
        apiClient.get(`${API_URL}/licenses`)
    ]);

    // Combine the results
    return {
        payments: paymentsResponse.data,
        license: licensesResponse.data.length > 0 ? licensesResponse.data[0] : null // Assuming user has only one license
    };
};

// Add a new payment method
export const addPaymentMethod = (paymentData) => {
    return apiClient.post(`${API_URL}/payments`, paymentData);
};

// Add a new license
export const addLicense = (licenseData) => {
    return apiClient.post(`${API_URL}/licenses`, licenseData);
};

// Delete a payment method
export const deletePaymentMethod = (paymentId) => {
    return apiClient.delete(`${API_URL}/payments/${paymentId}`);
};