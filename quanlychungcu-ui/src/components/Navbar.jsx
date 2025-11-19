import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Component Menu Item đơn
const NavItem = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
      }`
    }
  >
    {label}
  </NavLink>
);

// Component Dropdown Menu (Sửa logic Click)
const DropdownMenu = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Dùng ref để phát hiện click outside

  // Toggle menu khi click
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown} // <-- SỬA THÀNH CLICK
        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isOpen ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
        }`}
      >
        {title}
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-down">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)} // Đóng menu khi chọn item
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm transition-colors ${
                  isActive ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isLoggedIn) return null;

  const MANAGEMENT_ROLES = ['Quản lý', 'Admin', 'Nhân viên', 'Kỹ thuật'];
  const canManage = MANAGEMENT_ROLES.includes(user?.role);
  const isAdmin = ['Quản lý', 'Admin'].includes(user?.role);

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">B</div>
           <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 hidden md:block">
             Building Care
           </span>
        </div>

        {/* MENU CHÍNH */}
        <div className="hidden md:flex items-center gap-1">
          
          <DropdownMenu 
            title="Dự án" 
            items={[
              { to: '/blocks', label: 'Khu tòa nhà (Blocks)' },
              { to: '/floors', label: 'Danh sách Tầng' },
              { to: '/apartments', label: 'Tra cứu Căn hộ' },
              { to: '/showcase', label: 'Thư viện Ảnh' },
            ]} 
          />

          <DropdownMenu 
            title="Dịch vụ" 
            items={[
              { to: '/services', label: 'Dịch vụ cung cấp' },
              { to: '/common-areas', label: 'Khu vực chung' },
            ]} 
          />

          <NavItem to="/requests" label="Gửi Yêu cầu" />

          {canManage && (
            <DropdownMenu 
              title="Quản trị" 
              items={[
                { to: '/residents', label: 'Quản lý Cư dân' },
                { to: '/contracts', label: 'Hợp đồng' },
                { to: '/invoices', label: 'Hóa đơn' },
                { to: '/employees', label: 'Nhân sự' },
                ...(isAdmin ? [{ to: '/user-management', label: 'Phân quyền hệ thống' }] : [])
              ]} 
            />
          )}
        </div>

        {/* USER & LOGOUT */}
        <div className="flex items-center gap-3">
          <NavLink 
            to="/profile" 
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
              {(user.HoTen || user.name || user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-right leading-tight">
               <div className="font-bold text-xs text-gray-900">
                  {user.HoTen || user.name || user.email || "Người dùng"}
                </div>
               <div className="text-[10px] text-gray-500 uppercase tracking-wider">{user.role}</div>
            </div>
          </NavLink>

          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
            title="Đăng xuất"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

      </div>
    </nav>
  );
}