import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode'; // Cài đặt: npm install jwt-decode

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider (Component "Cha" bọc App)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Thêm state loading

  // 3. Kiểm tra token khi app tải lần đầu
  useEffect(() => {
    try {
      const token = authService.getCurrentToken();
      if (token) {
        // Giải mã token để lấy thông tin user (ví dụ: { id, email, name })
        const decodedUser = jwtDecode(token);
        
        // (Tùy chọn) Kiểm tra xem token đã hết hạn chưa
        // const isExpired = decodedUser.exp * 1000 < Date.now();
        // if (isExpired) throw new Error("Token expired");

        setUser(decodedUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Token không hợp lệ hoặc đã hết hạn:", error);
      authService.logout(); // Dọn dẹp token hỏng (nếu có)
    } finally {
      setLoading(false); // Dừng loading sau khi kiểm tra xong
    }
  }, []);

  // 4. Hàm Login (cập nhật state sau khi gọi service)
  const login = async (credentials) => {
    try {
      // Service vẫn làm nhiệm vụ gọi API và lưu token
      const data = await authService.login(credentials);
      
      // Giải mã token mới
      const decodedUser = jwtDecode(data.token);
      setUser(decodedUser);
      setIsLoggedIn(true);
      
      return data; // Trả về data cho trang Login (nếu cần)
    } catch (error) {
      throw error; // Ném lỗi ra để trang Login xử lý
    }
  };

  // 5. Hàm Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
    // Chuyển hướng sẽ được xử lý ở component
  };

  // 6. Cung cấp state và hàm cho các component con
  const value = {
    user,
    isLoggedIn,
    loading, // Cung cấp state loading
    login,
    logout,
  };

  // Chỉ render children khi đã kiểm tra auth xong
  // (Tránh trường hợp Navbar hiển thị "Login" rồi nhảy sang "Logout")
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