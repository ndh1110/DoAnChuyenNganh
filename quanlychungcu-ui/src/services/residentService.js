// src/services/residentService.js
import api from './api'; // Import instance axios đã cấu hình

const API_ENDPOINT = '/nguoidung';

/**
 * Lấy toàn bộ danh sách cư dân (Đã sửa)
 */
const getAllResidents = async () => {
  try {
    const response = await api.get(API_ENDPOINT);
    return response.data; // <--- SỬA: Trả về data
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Cư dân:", error.response || error);
    throw error;
  }
};

/**
 * Lấy chi tiết một cư dân (Đã sửa)
 */
const getResidentById = async (id) => {
  try {
    const response = await api.get(`${API_ENDPOINT}/${id}`);
    return response.data; // <--- SỬA: Trả về data
  } catch (error) {
    console.error(`Lỗi khi lấy Cư dân ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Tạo một cư dân mới (Đã sửa)
 */
const createResident = async (residentData) => {
  try {
    const response = await api.post(API_ENDPOINT, residentData);
    return response.data; // <--- SỬA: Trả về data
  } catch (error) {
    console.error("Lỗi khi tạo Cư dân:", error.response || error);
    throw error;
  }
};

/**
 * Cập nhật thông tin cư dân (Đã sửa)
 */
const updateResident = async (id, residentData) => {
  try {
    const response = await api.put(`${API_ENDPOINT}/${id}`, residentData);
    return response.data; // <--- SỬA: Trả về data
  } catch (error) {
    console.error(`Lỗi khi cập nhật Cư dân ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Xóa một cư dân (Đã sửa)
 */
const deleteResident = async (id) => {
  try {
    const response = await api.delete(`${API_ENDPOINT}/${id}`);
    return response.data; // <--- SỬA: Trả về data
  } catch (error) {
    console.error(`Lỗi khi xóa Cư dân ${id}:`, error.response || error);
    throw error;
  }
};

// Export object (Phần này của bạn đã đúng)
export const residentService = {
  getAll: getAllResidents,
  getById: getResidentById,
  create: createResident,
  update: updateResident,
  delete: deleteResident,
};