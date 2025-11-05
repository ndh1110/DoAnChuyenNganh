import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import BlocksPage from "./pages/BlocksPage";
import ResidentsPage from "./pages/ResidentsPage";
import FloorsPage from "./pages/FloorsPage";
import ApartmentsPage from "./pages/ApartmentsPage";
import ContractsPage from "./pages/ContractsPage";
import InvoicesPage from "./pages/InvoicesPage";
import ServicesPage from "./pages/ServicesPage";
import EmployeesPage from "./pages/EmployeesPage";
import NotFound from "./pages/NotFound";

// (Tùy chọn) Nghe sự kiện hết hạn đăng nhập do interceptor phát ra
function AuthGuardEventBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = () => navigate("/login"); // hoặc navigate("/blocks");
    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, [navigate]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>Hệ Thống Quản lý Chung cư và Dịch vụ Cư dân</h1>
        </header>

        <Navbar />

        <main>
          <AuthGuardEventBridge />
          <Routes>
            <Route path="/" element={<Navigate to="/blocks" replace />} />
            <Route path="/blocks" element={<BlocksPage />} />
            <Route path="/floors" element={<FloorsPage />} />
            <Route path="/apartments" element={<ApartmentsPage />} />
            <Route path="/residents" element={<ResidentsPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer>
          <p>Đồ án tốt nghiệp - 2025</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
