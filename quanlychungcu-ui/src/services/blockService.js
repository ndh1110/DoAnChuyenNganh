// src/services/blockService.js
import api from './api';

const blockService = {
  // --- QUẢN LÝ BLOCK ---
  // (Giữ nguyên vì Backend không nhắc sửa cái này, và danh sách Block vẫn hiện)
  getAll: async () => {
    const response = await api.get('/block');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/block/${id}`);
    return response.data; // Trả về nested data: Block -> Floors -> Apartments
  },
  create: async (data) => {
    const response = await api.post('/block', data);
    return response.data;
  },
  createSetup: async (setupData) => {
    const response = await api.post('/block/setup', setupData);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/block/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/block/${id}`);
    return response.data;
  },

  // --- QUẢN LÝ TẦNG (SỬA THEO BACKEND: /tang) ---
  getAllFloors: async () => {
    // Backend không nói rõ API lấy tất cả tầng, nhưng ta cứ để tạm endpoint gốc
    const response = await api.get('/tang'); 
    return response.data;
  },
  addFloor: async (data) => {
    // data nhận vào: { TenTang: "...", MaBlock: ... }
    // Backend yêu cầu: { SoTang: int, MaBlock: int }
    // Frontend cần đảm bảo data truyền vào khớp với yêu cầu này
    const response = await api.post('/tang', data);
    return response.data;
  },
  deleteFloor: async (id) => {
    const response = await api.delete(`/tang/${id}`);
    return response.data;
  },

  // --- QUẢN LÝ CĂN HỘ (SỬA THEO BACKEND: /canho) ---
  getAllApartments: async () => {
    const response = await api.get('/canho'); 
    return response.data;
  },
  
  addApartment: async (data) => {
    // data có thể là JSON hoặc FormData
    // Endpoint: /api/canho
    const response = await api.post('/canho', data);
    return response.data;
  },
  
  updateApartment: async (id, data) => {
    const response = await api.put(`/canho/${id}`, data);
    return response.data;
  },
  
  deleteApartment: async (id) => {
    const response = await api.delete(`/canho/${id}`);
    return response.data;
  },
  getApartmentInfo: async (id) => {
    // Endpoint: GET /api/canho/:id/info
    const response = await api.get(`/canho/${id}/info`);
    return response.data;
  }
};

export { blockService };