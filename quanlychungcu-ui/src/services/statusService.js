import api from './api';

/**
 * Lớp Service: Chứa các hàm gọi API liên quan đến "TrangThai" (Dùng chung)
 */

/**
 * Lấy tất cả trạng thái theo ngữ cảnh (ví dụ: 'APARTMENT', 'INVOICE')
 * Dùng API: GET /api/trangthai/context/:context
 */
const getTrangThaiByContext = async (contextName) => {
  try {
    const response = await api.get(`/trangthai/context/${contextName}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách trạng thái cho context ${contextName}:`, error.response || error);
    throw error;
  }
};

export const statusService = {
  getByContext: getTrangThaiByContext,
};