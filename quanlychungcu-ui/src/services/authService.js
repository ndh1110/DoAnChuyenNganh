import api from './api';

/**
 * Lớp Service: Chứa tất cả các hàm gọi API liên quan đến "Auth"
 */

/**
 * Gọi API đăng nhập
 */
const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  
  // SỬA: Lưu cả token và user object
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    // API của bạn trả về { token, user: {...} }
    localStorage.setItem('user', JSON.stringify(response.data.user)); 
  }
  return response.data;
};

/**
 * Gọi API đăng ký
 */
const register = async (userData) => {
  return await api.post('/auth/register', userData);
};

/**
 * Đăng xuất
 */
const logout = () => {
  // SỬA: Xóa cả token và user
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Lấy token hiện tại (nếu có)
 */
const getCurrentToken = () => {
  return localStorage.getItem('token');
};

/**
 * Lấy user object hiện tại (nếu có)
 */
const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

/**
 * Gọi API yêu cầu reset mật khẩu (Backend sẽ gửi email)
 * @param {object} emailData - { Email: "..." }
 */
const forgotPassword = async (emailData) => {
  // API của bạn: POST /api/auth/forgot-password
  const response = await api.post('/auth/forgot-password', emailData);
  return response.data; // Trả về message (ví dụ: "Vui lòng kiểm tra email...")
};

/**
 * Gọi API để đặt mật khẩu mới bằng token
 * @param {string} token - Token từ URL email
 * @param {object} passwordData - { newPassword: "..." }
 */
const resetPassword = async (token, passwordData) => {
  // API của bạn: POST /api/auth/reset-password/:token
  const response = await api.post(`/auth/reset-password/${token}`, passwordData);
  return response.data;
};

// --- THÊM HÀM MỚI NÀY ---
const socialLogin = async (provider, token) => {
  try {
    // Gọi API: POST /api/auth/social-login
    const response = await api.post('/auth/social-login', { 
      provider, // 'google' hoặc 'facebook'
      token     // access_token từ google
    });
    
    // Lưu token giống hệt như login thường
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cập nhật export
export const authService = {
  login,
  register,
  getCurrentToken,
  getCurrentUser, // <-- Thêm hàm mới
  forgotPassword,
  resetPassword,
  socialLogin, // <-- Thêm hàm mới
  logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },
    getCurrentUser: () => JSON.parse(localStorage.getItem('user')),
    getCurrentToken: () => localStorage.getItem('token'),
};