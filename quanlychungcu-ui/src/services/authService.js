import api from './api';

/**
 * Lớp Service: Chứa tất cả các hàm gọi API liên quan đến "Auth"
 * Sử dụng API endpoints: /api/auth
 */

/**
 * Gọi API đăng nhập
 * @param {object} credentials - { Email, Password }
 */
const login = async (credentials) => {
  // api.js sẽ tự động thêm /api
  const response = await api.post('/auth/login', credentials);
  
  // Nếu thành công, lưu token vào localStorage
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    // Bạn cũng có thể lưu thông tin user nếu API trả về
    // localStorage.setItem('user', JSON.stringify(response.data.user)); 
  }
  return response.data;
};

/**
 * Gọi API đăng ký
 * @param {object} userData - { HoTen, Email, SoDienThoai, Password }
 */
const register = async (userData) => {
  return await api.post('/auth/register', userData);
};

/**
 * Đăng xuất
 * Xóa token khỏi localStorage
 */
const logout = () => {
  localStorage.removeItem('token');
  // localStorage.removeItem('user');
  // (Không cần gọi API, chỉ cần xóa token ở client)
};

/**
 * Lấy token hiện tại (nếu có)
 */
const getCurrentToken = () => {
  return localStorage.getItem('token');
};

export const authService = {
  login,
  register,
  logout,
  getCurrentToken,
};