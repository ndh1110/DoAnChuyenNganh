import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth

function ProtectedRoute() {
  // 2. Lấy state từ Context (bao gồm cả 'loading')
  const { isLoggedIn, loading } = useAuth();

  // 3. Thêm kiểm tra loading
  if (loading) {
    // Hiển thị loading trong khi Context đang kiểm tra token
    return <div>Đang tải, vui lòng đợi...</div>;
  }

  if (!isLoggedIn) {
    // 4. Nếu không đăng nhập, chuyển hướng
    return <Navigate to="/login" replace />;
  }

  // 5. Nếu đăng nhập, cho phép render
  return <Outlet />;
}

export default ProtectedRoute;