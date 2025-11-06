import api from './api';

/**
 * Lớp Service: Chứa tất cả các hàm gọi API liên quan đến "Tầng" (Floor)
 */

const getAllFloors = async () => {
  try {
    const response = await api.get('/tang');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy tất cả tầng:", error.response || error);
    throw error;
  }
};


// Hàm lấy danh sách Tầng THEO ID CỦA BLOCK
const getFloorsByBlockId = async (blockId) => {
  if (!blockId) {
    // Nếu không có blockId, trả về mảng rỗng, không gọi API
    return [];
  }
  try {
    const response = await api.get(`/tang/block/${blockId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách tầng cho block ${blockId}:`, error.response || error);
    throw error;
  }
};

// Hàm tạo Tầng mới
// floorData sẽ là { MaBlock: 1, SoTang: 5 }
const createFloor = async (floorData) => {
  try {
    const response = await api.post('/tang', floorData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo tầng:", error.response || error);
    throw error;
  }
};

// Hàm xóa Tầng
const deleteFloor = async (id) => {
  try {
    const response = await api.delete(`/tang/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa tầng ${id}:`, error.response || error);
    throw error;
  }
};

// Export các hàm
export const floorService = {
  getAll: getAllFloors,
  getByBlockId: getFloorsByBlockId,
  create: createFloor,
  delete: deleteFloor,
};