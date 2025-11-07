import api from './api.js';

// API cho Khu Vực Chung
const getAll = async () => {
  try {
    const response = await api.get('/khuvucchung');
    return response.data; // Trả về data
  } catch (error) {
    console.error("Lỗi khi lấy Khu vực chung:", error.response || error);
    throw error;
  }
};
// (Thêm create, update, delete... khi cần)
const getById = async (id) => {
  try {
    const response = await api.get(`/khuvucchung/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy khu vực chung ${id}:`, error.response || error);
    throw error;
  }
};

const createCommonArea = async (data) => {
  try {
    const response = await api.post('/khuvucchung', data);
    return response.data;
    } catch (error) {
    console.error("Lỗi khi tạo Khu vực chung:", error.response || error);
    throw error;
  }
};

const updateCommonArea = async (id, data) => {
  try {
    const response = await api.put(`/khuvucchung/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật Khu vực chung ${id}:`, error.response || error);
    throw error;
  }
};
const deleteCommonArea = async (id) => {
  try {
    const response = await api.delete(`/khuvucchung/${id}`);
    return response.data;
    } catch (error) {
    console.error(`Lỗi khi xóa Khu vực chung ${id}:`, error.response || error);
    throw error;
    }
};

export const commonAreaService = 
{ 
    getAll,
    getById,
    create: createCommonArea,
    update: updateCommonArea,
    delete: deleteCommonArea
};