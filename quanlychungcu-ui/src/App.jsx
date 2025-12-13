// src/App.jsx (PHIÊN BẢN HOÀN CHỈNH: PHÂN QUYỀN, BONG BÓNG CHAT VÀ ĐĂNG NHẬP)

import React, { useEffect, useState } from "react"; 
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

// 1. IMPORT AUTHPROVIDER VÀ AUTHSERVICE
import { AuthProvider, useAuth } from "./context/AuthContext"; 
import { authService } from "./services/authService";

// ⭐ IMPORT CHATBOX AI ⭐
import AIChatbox from "./components/AIChatbox"; 

// 2. IMPORT CÁC COMPONENT VÀ TRANG (Giữ nguyên)
import ApartmentDetailPage from "./pages/ApartmentDetailPage";
import MyApartmentPage from "./pages/MyApartmentPage";
import ProfilePage from './pages/ProfilePage';
import DashboardPage from "./pages/DashboardPage"; 
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; 
import ResetPasswordPage from "./pages/ResetPasswordPage"; 
import ProtectedRoute from "./components/ProtectedRoute";
import BlocksPage from "./pages/BlocksPage";
import BlockDetailsPage from "./pages/BlockDetailsPage";
import ResidentsPage from "./pages/ResidentsPage";
import ContractsPage from "./pages/ContractsPage";
import InvoicesPage from "./pages/InvoicesPage";
import ServicesPage from "./pages/ServicesPage";
import EmployeesPage from "./pages/EmployeesPage";
import RequestsPage from "./pages/RequestsPage"; 
import CommonAreasPage from "./pages/CommonAreasPage";
import NotFound from "./pages/NotFound";
import UserManagementPage from "./pages/UserManagementPage";

// (AuthGuardEventBridge giữ nguyên)
function AuthGuardEventBridge() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  useEffect(() => {
    const handler = () => {
      logout();
      navigate("/login");
    };
    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, [navigate, logout]);
  return null;
}

function AppContent() {
  // ⭐ LẤY isLoggedIn VÀ user (chứa VaiTro) ⭐
  const { isLoggedIn, user } = useAuth();
  
  // State quản lý ẩn/hiện AIChatbox
  const [isChatOpen, setIsChatOpen] = useState(false);

  // ⭐ TRÍCH XUẤT VAI TRÒ CHÍNH XÁC ⭐
  // Nếu user tồn tại, lấy VaiTro, nếu không mặc định là 'Khách' (Public)
  const userRole = user?.VaiTro || user?.vaiTro || user?.role || 'Khách';

  return (
    <div className="App">
      <Navbar /> 
      <main>
        <AuthGuardEventBridge />
        <Routes>
          {/* === Routes Công khai (Public) === */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* === Routes Bảo vệ (Protected) === */}
          <Route element={<ProtectedRoute />}>
            
            <Route path="/" element={<DashboardPage />} /> 
            
            <Route path="/staff/apartments/:id" element={<ApartmentDetailPage />} />
            <Route path="/my-apartment" element={<MyApartmentPage />} />
            <Route path="/blocks" element={<BlocksPage />} />
            <Route path="/blocks/:id" element={<BlockDetailsPage />} />
            <Route path="/residents" element={<ResidentsPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/common-areas" element={<CommonAreasPage />} />
            <Route path="/user-management" element={<UserManagementPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* ⭐ LOGIC RENDER CHATBOX VÀ NÚT BẤM (CHỈ KHI ĐÃ ĐĂNG NHẬP) ⭐ */}
      {isLoggedIn && (
          <>
            {/* 1. RENDER CHATBOX KHI ĐANG MỞ */}
            {isChatOpen && (
                <AIChatbox 
                    onClose={() => setIsChatOpen(false)} 
                    userRole={userRole} // ⭐ TRUYỀN VAI TRÒ ĐỂ PHÂN QUYỀN ⭐
                />
            )}

            {/* 2. RENDER NÚT KÍCH HOẠT KHI CHATBOX ĐANG ĐÓNG */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl z-50 transition-transform transform hover:scale-105"
                    title="Mở Công cụ Tra cứu"
                >
                    {/* Icon chat (hoặc biểu tượng AI) */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M3 20l1.3-3.9A9 9 0 1119 12a9 9 0 01-7 8.1v0z" />
                    </svg>
                </button>
            )}
          </>
      )}
    </div>
  );
}

// (App component chính giữ nguyên)
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;