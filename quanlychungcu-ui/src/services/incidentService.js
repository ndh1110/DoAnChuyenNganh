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

const getIncidentById = async (id) => {
  try {
    const response = await api.get(`/suco/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy sự cố với ID ${id}:`, error.response || error);
    throw error;
  }
};

// (Bạn có thể thêm các hàm create, update, delete... sau)
const createIncident = async (data) => {
  try {
    const response = await api.post('/suco', data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo sự cố:", error.response || error);
    throw error;
  }
};
const updateIncident = async (id, data) => {
  try {
    const response = await api.put(`/suco/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật sự cố với ID ${id}:`, error.response || error);
    throw error;
  }
};
const deleteIncident = async (id) => {
  try {
    const response = await api.delete(`/suco/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa sự cố với ID ${id}:`, error.response || error);
    throw error;
  }
};


export const incidentService = {
  getAll: getAllIncidents,
  getById: getIncidentById,
  create: createIncident,
  update: updateIncident,
  delete: deleteIncident
};