// src/services/announcementService.js
import api from './api';

/**
 * Lấy các thông báo chung (public) cho toàn bộ chung cư
 * Dựa trên API: GET /api/thongbao
 */
const getCommonAnnouncements = async () => {
  try {
    const response = await api.get('/thongbao');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông báo chung:", error.response || error);
    throw error;
  }
};

export const announcementService = {
  getCommonAnnouncements,
};