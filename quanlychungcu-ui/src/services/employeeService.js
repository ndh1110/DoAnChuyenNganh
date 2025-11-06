// src/services/employeeService.js
import api from './api'; // Import instance axios đã cấu hình

// --- 1. Nhân Viên ---
export const getAllEmployees = () => api.get('/nhanvien');
export const createEmployee = (data) => api.post('/nhanvien', data);
export const updateEmployee = (id, data) => api.put(`/nhanvien/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/nhanvien/${id}`);

// --- 2. Lịch Trực ---
export const getAllSchedules = () => api.get('/lichtruc');
export const createSchedule = (data) => api.post('/lichtruc', data);
export const updateSchedule = (id, data) => api.put(`/lichtruc/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/lichtruc/${id}`);

// --- 3. Phân Công ---
export const getAllAssignments = () => api.get('/phancong');
export const createAssignment = (data) => api.post('/phancong', data);
export const updateAssignment = (id, data) => api.put(`/phancong/${id}`, data);
export const deleteAssignment = (id) => api.delete(`/phancong/${id}`);

// --- 4. Dữ liệu phụ trợ cho Forms ---

// (Lấy tất cả người dùng để chọn gán làm nhân viên)
export const getAllUsers = () => api.get('/nguoidung'); 

// (Lấy tất cả khu vực chung để phân công)
export const getAllCommonAreas = () => api.get('/khuvucchung');