import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkStyle = ({ isActive }) => ({
  padding: "10px 14px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
  border: "1px solid #e5e7eb",
  background: isActive ? "#111827" : "#fff",
  color: isActive ? "#fff" : "#111827",
  marginRight: 10,
});

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isLoggedIn) return null;

  // --- ĐỊNH NGHĨA NHÓM QUYỀN ---
  const MANAGEMENT_ROLES = ['Quản lý', 'Admin', 'Nhân viên', 'Kỹ thuật'];
  const canManage = MANAGEMENT_ROLES.includes(user?.role);
  const isAdmin = ['Quản lý', 'Admin'].includes(user?.role);

  return (
    <nav style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      gap: 8, 
      margin: "16px 0 28px", 
      flexWrap: "wrap",
      padding: "0 20px"
    }}>
      
      {/* === 1. NHÓM THÔNG TIN CHUNG (AI CŨNG CẦN XEM) === */}
      {/* Hồ sơ cá nhân */}
      <NavLink to="/profile" style={linkStyle}>Hồ sơ</NavLink>

      {/* Thông tin dự án (Cư dân/Khách cần xem để đặt lịch/tìm nhà) */}
      <NavLink to="/blocks" style={linkStyle}>Blocks</NavLink>
      <NavLink to="/floors" style={linkStyle}>Floors</NavLink>
      <NavLink to="/apartments" style={linkStyle}>Apartments</NavLink>
      <NavLink to="/showcase" style={linkStyle}>Thư viện Ảnh</NavLink>
      
      {/* Tiện ích & Dịch vụ */}
      <NavLink to="/services" style={linkStyle}>Dịch vụ</NavLink>
      <NavLink to="/common-areas" style={linkStyle}>Khu vực chung</NavLink>
      
      {/* Tương tác */}
      <NavLink to="/requests" style={linkStyle}>Phản ánh/Yêu cầu</NavLink>


      {/* === 2. NHÓM QUẢN TRỊ & NGHIỆP VỤ (Chỉ Quản lý/Nhân viên) === */}
      {/* Dữ liệu nhạy cảm hoặc nghiệp vụ nội bộ -> Cư dân KHÔNG được thấy */}
      {canManage && (
        <>
          <NavLink to="/residents" style={linkStyle}>Cư dân</NavLink>
          <NavLink to="/contracts" style={linkStyle}>Hợp đồng</NavLink>
          <NavLink to="/invoices" style={linkStyle}>Hóa đơn</NavLink>
          <NavLink to="/employees" style={linkStyle}>Nhân viên</NavLink>
        </>
      )}

      {/* === 3. NHÓM ADMIN (Phân quyền hệ thống) === */}
      {isAdmin && (
         <NavLink to="/user-management" style={linkStyle}>Phân Quyền</NavLink>
      )}

      {/* === KHUNG USER === */}
      <div className="navbar-user" style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontWeight: '500' }}>
            Chào, {user.HoTen || user.name || user.email} ({user.role})
        </span>
        <button 
            onClick={handleLogout} 
            className="btn-logout"
            style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ff4d4f",
                background: "#fff1f0",
                color: "#ff4d4f",
                cursor: "pointer",
                fontWeight: "bold"
            }}
        >
            Đăng xuất
        </button>
      </div>  
    </nav>
  );
}