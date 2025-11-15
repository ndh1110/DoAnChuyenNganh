// src/services/apartmentService.js
import api from './api';

// ... (Giữ nguyên các hàm getAll, getById, delete)
const getAllApartments = async () => {
  try {
    const response = await api.get('/canho');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách căn hộ:", error.response || error);
    throw error;
  }
};

const getApartmentById = async (id) => {
  try {
    const response = await api.get(`/canho/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy căn hộ ${id}:`, error.response || error);
    throw error;
  }
};

const deleteApartment = async (id) => {
  try {
    const response = await api.delete(`/canho/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa căn hộ ${id}:`, error.response || error);
    throw error;
  }
};

// --- CẬP NHẬT 2 HÀM NÀY ---

// Tạo Căn hộ mới (Nhận FormData)
const createApartment = async (apartmentData) => {
  try {
    // Khi gửi file, axios tự động set Content-Type là multipart/form-data nếu data là FormData
    const response = await api.post('/canho', apartmentData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo căn hộ:", error.response || error);
    throw error;
  }
};

// Cập nhật Căn hộ (Nhận FormData)
const updateApartment = async (id, apartmentData) => {
  try {
    const response = await api.put(`/canho/${id}`, apartmentData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật căn hộ ${id}:`, error.response || error);
    throw error;
  }
};


// Hàm Import Excel (Giữ nguyên)
const importExcel = async (formData) => {
  try {
    const response = await api.post('/canho/import-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi import excel căn hộ:", error.response || error);
    throw error;
  }
};

export const apartmentService = {
  getAll: getAllApartments,
  getById: getApartmentById,
  create: createApartment,
  update: updateApartment,
  delete: deleteApartment,
  importExcel: importExcel,
};