// src/services/employeeService.js
import api from './api'; // Import instance axios đã cấu hình

// --- 1. Nhân Viên ---
const getAllEmployees = async () => {
  try {
    const response = await api.get('/nhanvien');
    return response.data; // Trả về data
  } catch (error) {
    console.error("Lỗi khi lấy Nhân viên:", error.response || error);
    throw error;
  }
};
const createEmployee = async (data) => {
  try {
    const response = await api.post('/nhanvien', data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo Nhân viên:", error.response || error);
    throw error;
  }
};
const updateEmployee = async (id, data) => {
  try {
    const response = await api.put(`/nhanvien/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật Nhân viên:", error.response || error);
    throw error;
  }
};
const deleteEmployee = async (id) => {
  try {
    const response = await api.delete(`/nhanvien/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa Nhân viên:", error.response || error);
    throw error;
  }
};

// --- 2. Lịch Trực ---
const getAllSchedules = async () => {
  try {
    const response = await api.get('/lichtruc');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy Lịch trực:", error.response || error);
    throw error;
  }
};
const createSchedule = async (data) => {
  try {
    const response = await api.post('/lichtruc', data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo Lịch trực:", error.response || error);
    throw error;
  }
};
const updateSchedule = async (id, data) => {
  try {
    const response = await api.put(`/lichtruc/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật Lịch trực:", error.response || error);
    throw error;
  }
};
const deleteSchedule = async (id) => {
  try {
    const response = await api.delete(`/lichtruc/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa Lịch trực:", error.response || error);
    throw error;
  }
};

// --- 3. Phân Công ---
const getAllAssignments = async () => {
  try {
    const response = await api.get('/phancong');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy Phân công:", error.response || error);
    throw error;
  }
};
const createAssignment = async (data) => {
  try {
    const response = await api.post('/phancong', data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo Phân công:", error.response || error);
    throw error;
  }
};
const updateAssignment = async (id, data) => {
  try {
    const response = await api.put(`/phancong/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật Phân công:", error.response || error);
    throw error;
  }
};
const deleteAssignment = async (id) => {
  try {
    const response = await api.delete(`/phancong/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa Phân công:", error.response || error);
    throw error;
  }
};

// --- 4. Dữ liệu phụ trợ ---
const getAllUsers = async () => {
  try {
    const response = await api.get('/nguoidung');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy Người dùng:", error.response || error);
    throw error;
  }
};
const getAllCommonAreas = async () => {
  try {
    const response = await api.get('/khuvucchung');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy Khu vực chung:", error.response || error);
    throw error;
  }
};

// --- Gộp tất cả lại và export ---
export const employeeService = {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getAllSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getAllAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAllUsers,
    getAllCommonAreas
};