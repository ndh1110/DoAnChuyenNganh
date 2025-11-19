import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider (Component "Cha" bọc App)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Sẽ chứa { id, email, name, role }
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // State loading để kiểm tra auth

  // 3. Kiểm tra localStorage khi app tải lần đầu
  useEffect(() => {
    try {
      // Dùng service đã cập nhật
      const token = authService.getCurrentToken();
      const storedUser = authService.getCurrentUser();

      if (token && storedUser) {
        // (Bạn có thể thêm logic giải mã token (jwt-decode) để kiểm tra hết hạn ở đây)
        setUser(storedUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin xác thực:", error);
      authService.logout(); // Dọn dẹp
    } finally {
      setLoading(false); // Đã kiểm tra xong
    }
  }, []);

  // 4. Hàm Login (cập nhật state sau khi gọi service)
  const login = async (credentials) => {
    try {
      // Service sẽ gọi API và lưu vào localStorage
      const data = await authService.login(credentials);
      
      // Cập nhật state toàn cục
      setUser(data.user);
      setIsLoggedIn(true);
      
      return data;
    } catch (error) {
      throw error; // Ném lỗi ra để trang Login xử lý
    }
  };

  // 5. Hàm Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  const loginWithGoogle = async (accessToken) => {
    try {
      // Gọi service
      const data = await authService.socialLogin('google', accessToken);
      
      // Cập nhật state toàn cục
      setUser(data.user);
      setIsLoggedIn(true);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // 6. Cung cấp state và hàm cho các component con
  const value = {
    user, // <-- QUAN TRỌNG: chứa role
    isLoggedIn,
    loading,
    login,
    logout,
    loginWithGoogle
  };

  // Chỉ render app khi đã kiểm tra auth xong
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
  
};

// 7. Tạo Hook (để component con dễ dàng sử dụng)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
};