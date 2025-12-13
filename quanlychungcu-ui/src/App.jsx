import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

// 1. IMPORT AUTHPROVIDER VÀ AUTHSERVICE
import { AuthProvider, useAuth } from "./context/AuthContext"; 
import { authService } from "./services/authService";

// 2. IMPORT CÁC COMPONENT VÀ TRANG
import ProfilePage from './pages/ProfilePage';
import DashboardPage from "./pages/DashboardPage"; // <-- 2. IMPORT FILE MỚI
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

// (AppContent giữ nguyên)
function AppContent() {
  const { isLoggedIn } = useAuth();
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
            
            {/* --- 3. SỬA LỖI Ở ĐÂY --- */}
            <Route path="/" element={<DashboardPage />} /> {/* <-- ĐÃ SỬA */}
            
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