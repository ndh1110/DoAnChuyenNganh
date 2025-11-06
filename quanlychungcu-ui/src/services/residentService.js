// src/services/residentService.js
import api from './api'; // Import instance axios đã cấu hình

const API_ENDPOINT = '/nguoidung';

/**
 * Lấy toàn bộ danh sách cư dân
 */
const getAllResidents = () => {
  return api.get(API_ENDPOINT);
};

/**
 * Lấy chi tiết một cư dân
 * @param {string} id - Mã người dùng (MaNguoiDung)
 */
const getResidentById = (id) => {
  return api.get(`${API_ENDPOINT}/${id}`);
};

/**
 * Tạo một cư dân mới
 * @param {object} residentData - Dữ liệu cư dân (ví dụ: { HoTen, Email, SoDienThoai, ... })
 */
const createResident = (residentData) => {
  return api.post(API_ENDPOINT, residentData);
};

/**
 * Cập nhật thông tin cư dân
 * @param {string} id - Mã người dùng
 * @param {object} residentData - Dữ liệu cập nhật
 */
const updateResident = (id, residentData) => {
  return api.put(`${API_ENDPOINT}/${id}`, residentData);
};

/**
 * Xóa một cư dân
 * @param {string} id - Mã người dùng
 */
const deleteResident = (id) => {
  return api.delete(`${API_ENDPOINT}/${id}`);
};

// =============================================
// ⭐ PHẦN SỬA: Gom tất cả vào 1 object để export
// =============================================
export const residentService = {
  getAll: getAllResidents,
  getById: getResidentById,
  create: createResident,
  update: updateResident,
  delete: deleteResident,
};