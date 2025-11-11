// src/services/requestService.js
import api from './api'; // Import instance axios đã cấu hình

// --- 1. Yêu Cầu (Request) ---
export const getAllRequests = () => api.get('/yeucau');
export const getRequestById = (id) => api.get(`/yeucau/${id}`);
export const createRequest = (data) => api.post('/yeucau', data);
export const updateRequest = (id, data) => api.put(`/yeucau/${id}`, data);
export const deleteRequest = (id) => api.delete(`/yeucau/${id}`);

// --- 2. Log Xử Lý (Request Log) ---
// (Chỉ cần API tạo và xóa, vì API GET đã nằm trong getRequestById)
export const createRequestLog = (data) => api.post('/yeucaulog', data);
export const deleteRequestLog = (id) => api.delete(`/yeucaulog/${id}`);

// --- 3. Lịch Hẹn (Appointment) ---
// (Chỉ cần API CRUD, vì API GET đã nằm trong getRequestById)
export const createAppointment = (data) => api.post('/lichhen', data);
export const updateAppointment = (id, data) => api.put(`/lichhen/${id}`, data);
export const deleteAppointment = (id) => api.delete(`/lichhen/${id}`);