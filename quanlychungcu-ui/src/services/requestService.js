// src/services/requestService.js
import api from './api'; // Import instance axios đã cấu hình

// --- 1. Yêu Cầu (Request) ---
export const getAllRequests = () => api.get('/yeucau');
export const getRequestById = (id) => api.get(`/yeucau/${id}`);
export const createRequest = (data) => api.post('/yeucau', data);
export const updateRequest = (id, data) => api.put(`/yeucau/${id}`, data);
export const deleteRequest = (id) => api.delete(`/yeucau/${id}`);

// --- HÀM MỚI CHO DASHBOARD ---
/**
 * Lấy các yêu cầu mới nhất của Cư dân (cho widget)
 * Dựa trên gợi ý của Backend
 */
export const getRecentRequests = (limit = 3) => {
  // Backend gợi ý dùng: /yeucau?limit=3&sort=desc
  // (Chúng ta dùng cú pháp query param chuẩn hơn một chút)
  return api.get(`/yeucau?_limit=${limit}&_sort=NgayTao&_order=desc`);
};


// --- 2. Log Xử Lý (Request Log) ---
export const createRequestLog = (data) => api.post('/yeucaulog', data);
export const deleteRequestLog = (id) => api.delete(`/yeucaulog/${id}`);

// --- 3. Lịch Hẹn (Appointment) ---
export const createAppointment = (data) => api.post('/lichhen', data);
export const updateAppointment = (id, data) => api.put(`/lichhen/${id}`, data);
export const deleteAppointment = (id) => api.delete(`/lichhen/${id}`);