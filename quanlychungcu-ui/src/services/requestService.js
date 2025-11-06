// src/services/requestService.js
import api from './api'; // Import instance axios đã cấu hình

// --- 1. Yêu Cầu ---
export const getAllRequests = () => api.get('/yeucau');
export const getRequestById = (id) => api.get(`/yeucau/${id}`);
export const createRequest = (data) => api.post('/yeucau', data);
export const updateRequest = (id, data) => api.put(`/yeucau/${id}`, data);
export const deleteRequest = (id) => api.delete(`/yeucau/${id}`);

// --- 2. Log Xử Lý (API của bạn chỉ có POST và DELETE) ---
// (Giả định chúng ta cần 1 API GET log theo MaYeuCau - Cần cập nhật BE nếu thiếu)
// export const getLogsByRequestId = (id) => api.get(`/yeucaulog/request/${id}`); 
export const createRequestLog = (data) => api.post('/yeucaulog', data);

// --- 3. Lịch Hẹn (API của bạn chỉ có POST, PUT, DELETE) ---
// (Giả định chúng ta cần 1 API GET lịch hẹn theo MaYeuCau - Cần cập nhật BE nếu thiếu)
// export const getAppointmentsByRequestId = (id) => api.get(`/lichhen/request/${id}`);
export const createAppointment = (data) => api.post('/lichhen', data);
export const updateAppointment = (id, data) => api.put(`/lichhen/${id}`, data);