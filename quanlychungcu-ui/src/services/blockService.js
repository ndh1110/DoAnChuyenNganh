// 1. Import instance 'api' đã được cấu hình (từ file api.js)
import api from './api';

/**
 * Lớp Service: Chứa tất cả các hàm gọi API liên quan đến "Block"
 * Sử dụng API endpoints: /api/block
 */

// Hàm lấy tất cả Block
const getAllBlocks = async () => {
  try {
    const response = await api.get('/block');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách block:", error.response || error);
    // Ném lỗi ra để Lớp Page có thể bắt và xử lý
    throw error;
  }
};

// Hàm lấy 1 Block theo ID
const getBlockById = async (id) => {
  try {
    const response = await api.get(`/block/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy block ${id}:`, error.response || error);
    throw error;
  }
};

// Hàm tạo Block mới
// blockData là một object, ví dụ: { TenBlock: "Block D", SoTang: 15 }
const createBlock = async (blockData) => {
  try {
    const response = await api.post('/block', blockData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo block:", error.response || error);
    throw error;
  }
};

// Hàm cập nhật Block
const updateBlock = async (id, blockData) => {
  try {
    const response = await api.put(`/block/${id}`, blockData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật block ${id}:`, error.response || error);
    throw error;
  }
};

// Hàm xóa Block
const deleteBlock = async (id) => {
  try {
    // API của bạn có thể trả về message xác nhận
    const response = await api.delete(`/block/${id}`);
    return response.data;
  } catch (error)
 {
    console.error(`Lỗi khi xóa block ${id}:`, error.response || error);
    throw error;
  }
};

// Export tất cả các hàm
export const blockService = {
  getAll: getAllBlocks,
  getById: getBlockById,
  create: createBlock,
  update: updateBlock,
  delete: deleteBlock,
};