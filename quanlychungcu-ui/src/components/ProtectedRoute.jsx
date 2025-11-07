import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth();

  if(loading) {
    // Có thể hiển thị spinner hoặc placeholder trong khi kiểm tra trạng thái đăng nhập
    return <div>Đang tải, vui lòng đợi...</div>;
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
}


  // Nếu có token, cho phép render các route con (Nested Routes)
  return <Outlet />;
}

export default ProtectedRoute;