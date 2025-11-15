// src/services/userService.js
import api from './api';

export const userService = {
  // Lấy thông tin chi tiết của 1 user
  getById: async (id) => {
    try {
      const response = await api.get(`/nguoidung/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error);
      throw error;
    }
  },

  // Cập nhật thông tin user
  update: async (id, data) => {
    try {
      // data bao gồm: { HoTen, SoDienThoai, ... }
      const response = await api.put(`/nguoidung/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Lỗi cập nhật người dùng:", error);
      throw error;
    }
  }
};