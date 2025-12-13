// src/services/apartmentService.js (PHIÊN BẢN HOÀN THIỆN MODULE LISTING)
import api from './api';

// --- CÁC HÀM CŨ ---
const getAll = async () => {
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


// --- BỔ SUNG: HÀM TOGGLE RENT STATUS (Giữ nguyên) ---
const toggleRentStatus = async (id) => {
  try {
    // Gọi API PUT /canho/toggle-rent/:id
    const response = await api.put(`/canho/toggle-rent/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi toggle trạng thái thuê căn...`, error.response || error);
    throw error;
  }
};


// ⭐ BỔ SUNG: HÀM UPDATE LISTING MỚI ⭐
const updateListing = async (id, listingData) => {
  try {
    // Gọi API PUT /canho/listing/:id
    const response = await api.put(`/canho/listing/${id}`, listingData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật listing ${id}:`, error.response?.data || error);
    throw error;
  }
};

const getApartmentDetailsForStaff = async (id) => {
  try {
    // Gọi API đã tạo ở Bước 2
    const response = await api.get(`/canho/details/${id}`); 
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết căn hộ ${id} cho Staff:`, error.response || error);
    throw error;
  }
};

// --- EXPORT TẤT CẢ CÁC HÀM ---
export const apartmentService = {
  getAll,
  getApartmentById,
  deleteApartment,
  createApartment,
  updateApartment,
  importExcel,
  toggleRentStatus,
  updateListing,
  getApartmentDetailsForStaff // ⭐ EXPORT HÀM MỚI
};