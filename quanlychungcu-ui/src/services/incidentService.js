import api from './api';

/**
 * Lớp Service: Chứa tất cả các hàm gọi API liên quan đến "Sự Cố" (SuCo)
 * Sử dụng API endpoints: /api/suco
 */

const getAllIncidents = async () => {
  try {
    const response = await api.get('/suco');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sự cố:", error.response || error);
    throw error;
  }
};

// (Bạn có thể thêm các hàm create, update, delete... sau)

export const incidentService = {
  getAll: getAllIncidents,
};