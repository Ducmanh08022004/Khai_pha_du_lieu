import axios from 'axios';

// Node backend (Express) exposes: /api/v1/predict/text and /api/v1/predict/image
// Allow overriding via Vite env: VITE_BACKEND_URL (e.g. http://localhost:3000)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const API_URL = `${BACKEND_URL}/api/v1`;

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const predictFromText = async (symptoms, metadata) => {
    // POST /api/v1/predict/text
    const response = await apiClient.post('/predict/text', { symptoms, metadata });
    return response.data;
};

export const predictFromImage = async (imageFile) => {
    // POST /api/v1/predict/image (multipart/form-data, field name: image)
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post('/predict/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
};

export const uploadDataset = async (file) => {
    // Gửi file dataset lên để phân tích
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export default apiClient;