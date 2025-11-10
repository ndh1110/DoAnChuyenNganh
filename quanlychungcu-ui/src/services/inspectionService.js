// src/services/inspectionService.js
import api from './api';

/**
 * Lớp Service: Chứa tất cả các hàm gọi API liên quan đến "Kiểm Tra" (KiemTra)
 * Sử dụng API endpoints: /api/kiemtra
 */

const getAllInspections = async () => {
  try {
    const response = await api.get('/kiemtra');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách kiểm tra:", error.response || error);
    throw error;
  }
};

// API của bạn không có Sửa (PUT)
const createInspection = async (data) => {
  try {
    const response = await api.post('/kiemtra', data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo kiểm tra:", error.response || error);
    throw error;
  }
};

const deleteInspection = async (id) => {
  try {
    const response = await api.delete(`/kiemtra/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa kiểm tra với ID ${id}:`, error.response || error);
    throw error;
  }
};

// Lấy dữ liệu phụ trợ cho Form (API bạn đã cung cấp)
const getEmployees = async () => api.get('/nhanvien');
const getCommonAreas = async () => api.get('/khuvucchung');


export const inspectionService = {
  getAll: getAllInspections,
  create: createInspection,
  delete: deleteInspection,
  // Dữ liệu phụ trợ
  getEmployees,
  getCommonAreas,
};