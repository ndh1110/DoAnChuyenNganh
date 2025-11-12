import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

// 1. IMPORT AUTHPROVIDER VÀ AUTHSERVICE
import { AuthProvider, useAuth } from "./context/AuthContext";

// 2. IMPORT CÁC COMPONENT VÀ TRANG
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import BlocksPage from "./pages/BlocksPage";
import ResidentsPage from "./pages/ResidentsPage";
import FloorsPage from "./pages/FloorsPage";
import ApartmentsPage from "./pages/ApartmentsPage";
import ContractsPage from "./pages/ContractsPage";
import InvoicesPage from "./pages/InvoicesPage";
import ServicesPage from "./pages/ServicesPage";
import EmployeesPage from "./pages/EmployeesPage";
import RequestsPage from "./pages/RequestsPage"; 
import CommonAreasPage from "./pages/CommonAreasPage";
import NotFound from "./pages/NotFound";
import UserManagementPage from "./pages/UserManagementPage";

// AuthGuardEventBridge (Đã đúng, chỉ cần đảm bảo nó nằm trong AuthProvider)
function AuthGuardEventBridge() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Lấy hàm logout từ context

  useEffect(() => {
    const handler = () => {
      logout(); // Gọi logout từ context (xóa state và localStorage)
      navigate("/login");
      // KHÔNG CẦN reload, context sẽ tự cập nhật UI
    };
    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, [navigate, logout]);
  return null;
}

// Component AppContent (Tách ra để có thể dùng useAuth)
function AppContent() {
  const { isLoggedIn } = useAuth(); // Dùng state để quyết định hiển thị Navbar

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hệ Thống Quản lý Chung cư và Dịch vụ Cư dân</h1>
      </header>

      {/* Navbar giờ sẽ tự ẩn/hiện nhờ logic trong Navbar.jsx */}
      <Navbar /> 

      <main>
        <AuthGuardEventBridge />
        <Routes>
          {/* === Routes Công khai (Public) === */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* === Routes Bảo vệ (Protected) === */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/blocks" replace />} />
            <Route path="/blocks" element={<BlocksPage />} />
            <Route path="/floors" element={<FloorsPage />} />
            <Route path="/apartments" element={<ApartmentsPage />} />
            <Route path="/residents" element={<ResidentsPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/common-areas" element={<CommonAreasPage />} />
            <Route path="/user-management" element={<UserManagementPage />} />
          </Route>

          {/* Route cho 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer>
        <p>Đồ án tốt nghiệp - 2025</p>
      </footer>
    </div>
  );
}

// App component chính: Chỉ bọc Router và Provider
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