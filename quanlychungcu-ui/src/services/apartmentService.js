// src/services/apartmentService.js
import api from './api';

// --- CÁC HÀM CŨ ---
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

const createApartment = async (apartmentData) => {
  try {
    const response = await api.post('/canho', apartmentData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo căn hộ:", error.response || error);
    throw error;
  }
};

const updateApartment = async (id, apartmentData) => {
  try {
    const response = await api.put(`/canho/${id}`, apartmentData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật căn hộ ${id}:`, error.response || error);
    throw error;
  }
};

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


// --- BỔ SUNG: HÀM TOGGLE RENT STATUS ---
const toggleRentStatus = async (id) => {
  try {
    // Gọi API PUT /canho/toggle-rent/:id
    const response = await api.put(`/canho/toggle-rent/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi toggle trạng thái thuê căn hộ ${id}:`, error.response || error);
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
  // --- QUAN TRỌNG: EXPORT HÀM NÀY ---
  toggleRentStatus: toggleRentStatus, 
};