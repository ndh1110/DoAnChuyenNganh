import api from './api';

/**
 * Lớp Service: Chứa tất cả các hàm gọi API liên quan đến "Căn Hộ" (Apartment)
 * Sử dụng API endpoints: /api/canho
 */

// Lấy tất cả Căn hộ
const getAllApartments = async () => {
  try {
    const response = await api.get('/canho');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách căn hộ:", error.response || error);
    throw error;
  }
};

// Lấy 1 Căn hộ theo ID
const getApartmentById = async (id) => {
  try {
    const response = await api.get(`/canho/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy căn hộ ${id}:`, error.response || error);
    throw error;
  }
};

// Tạo Căn hộ mới
// apartmentData là { MaTang: 1, SoCanHo: "101", ... }
const createApartment = async (apartmentData) => {
  try {
    const response = await api.post('/canho', apartmentData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo căn hộ:", error.response || error);
    throw error;
  }
};

// Cập nhật Căn hộ
const updateApartment = async (id, apartmentData) => {
  try {
    const response = await api.put(`/canho/${id}`, apartmentData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật căn hộ ${id}:`, error.response || error);
    throw error;
  }
};

// Xóa Căn hộ
const deleteApartment = async (id) => {
  try {
    const response = await api.delete(`/canho/${id}`);
    return response.data;
  } catch (error)
 {
    console.error(`Lỗi khi xóa căn hộ ${id}:`, error.response || error);
    throw error;
  }
};

// Export tất cả các hàm
export const apartmentService = {
  getAll: getAllApartments,
  getById: getApartmentById,
  create: createApartment,
  update: updateApartment,
  delete: deleteApartment,
};