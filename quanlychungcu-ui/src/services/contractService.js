import api from './api';

/**
 * Lớp Service: Chứa tất cả các hàm gọi API liên quan đến "Hợp Đồng" (Contract)
 * Sử dụng API endpoints: /api/hopdong
 */

// Lấy tất cả Hợp đồng
const getAllContracts = async () => {
  try {
    const response = await api.get('/hopdong');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hợp đồng:", error.response || error);
    throw error;
  }
};

// Lấy 1 Hợp đồng theo ID
const getContractById = async (id) => {
  try {
    const response = await api.get(`/hopdong/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy hợp đồng ${id}:`, error.response || error);
    throw error;
  }
};

// Tạo Hợp đồng mới
// contractData là { MaCanHo, ChuHoId, Loai, NgayKy, ... }
const createContract = async (contractData) => {
  try {
    const response = await api.post('/hopdong', contractData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo hợp đồng:", error.response || error);
    throw error;
  }
};

// Cập nhật Hợp đồng
const updateContract = async (id, contractData) => {
  try {
    const response = await api.put(`/hopdong/${id}`, contractData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật hợp đồng ${id}:`, error.response || error);
    throw error;
  }
};

// Xóa Hợp đồng
const deleteContract = async (id) => {
  try {
    const response = await api.delete(`/hopdong/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa hợp đồng ${id}:`, error.response || error);
    throw error;
  }
};

// Export tất cả các hàm
export const contractService = {
  getAll: getAllContracts,
  getById: getContractById,
  create: createContract,
  update: updateContract,
  delete: deleteContract,
};