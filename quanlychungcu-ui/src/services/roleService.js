import api from './api';

/**
 * Lấy danh sách tất cả các vai trò (VD: Quản lý, Kỹ thuật...)
 * GET /api/vaitro
 */
const getAllRoles = async () => {
  try {
    const response = await api.get('/vaitro');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vai trò:", error.response || error);
    throw error;
  }
};

/**
 * Lấy danh sách người dùng và vai trò của họ
 * GET /api/user-roles
 */
const getUserRoles = async () => {
  try {
    const response = await api.get('/user-roles');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng/vai trò:", error.response || error);
    throw error;
  }
};

/**
 * Đồng bộ (cập nhật) vai trò cho một người dùng
 * POST /api/user-roles/:id/sync
 * @param {number} userId - MaNguoiDung
 * @param {Array<number>} roleIds - Mảng các MaVaiTro (VD: [1, 4])
 */
const syncUserRoles = async (userId, roleIds) => {
  try {
    // API yêu cầu body là: {"roleIds": [1, 4]}
    const response = await api.post(`/user-roles/${userId}/sync`, { roleIds });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi đồng bộ vai trò cho user ${userId}:`, error.response || error);
    throw error;
  }
};

// Export
export const roleService = {
  getAllRoles,
  getUserRoles,
  syncUserRoles,
};