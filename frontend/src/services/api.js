import axios from 'axios';

// Giả sử sau này Backend Python (Flask/FastAPI) chạy ở port 5000 hoặc 8000
const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const diagnoseDisease = async (symptoms) => {
    // Gửi danh sách triệu chứng lên model Python
    const response = await apiClient.post('/diagnose', { symptoms });
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