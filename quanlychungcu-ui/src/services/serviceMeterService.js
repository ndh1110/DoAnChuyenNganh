import api from './api.js';

// API cho Chỉ Số Dịch Vụ
const getAll = async () => {
  try {
    const response = await api.get('/chisodichvu');
    return response.data; // Trả về data
  } catch (error) {
    console.error("Lỗi khi lấy Chỉ số dịch vụ:", error.response || error);
    throw error;
  }
};
const getByID = async (id) => {
    try {
        const response = await api.get(`/chisodichvu/${id}`);
        return response.data; // Trả về data
        } catch (error) {
        console.error("Lỗi khi lấy Chỉ số dịch vụ theo ID:", error.response || error);
        throw error;
    }
};

// (Thêm create, update, delete... khi cần)
const createServiceMeter = async (data) => {
    try {
        const response = await api.post('/chisodichvu', data);
        return response.data; // Trả về data
    } catch (error) {
        console.error("Lỗi khi tạo Chỉ số dịch vụ:", error.response || error);
        throw error;
    }
};

const updateServiceMeter = async (id, data) => {
    try {
        const response = await api.put(`/chisodichvu/${id}`, data);
        return response.data; // Trả về data
    } catch (error) {
        console.error("Lỗi khi cập nhật Chỉ số dịch vụ:", error.response || error);
        throw error;
    }
};

const deleteServiceMeter = async (id) => {
    try {
        const response = await api.delete(`/chisodichvu/${id}`);
        return response.data; // Trả về data
    } catch (error) {
        console.error("Lỗi khi xóa Chỉ số dịch vụ:", error.response || error);
        throw error;
    }
};


export const serviceMeterService = 
{ 
    getAll,
    getByID,
    create : createServiceMeter,
    update : updateServiceMeter,
    delete : deleteServiceMeter 
};