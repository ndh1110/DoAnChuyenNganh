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
  if (!isLoggedIn) return null; // Không hiển thị Navbar nếu chưa đăng nhập

  return (
    <nav style={{ display: "flex", justifyContent: "center", gap: 8, margin: "16px 0 28px", flexWrap: "wrap" }}>
      <NavLink to="/blocks" style={linkStyle}>Blocks</NavLink>
      <NavLink to="/floors" style={linkStyle}>Floors</NavLink>
      <NavLink to="/apartments" style={linkStyle}>Apartments</NavLink>
      <NavLink to="/residents" style={linkStyle}>Residents</NavLink>
      <NavLink to="/contracts" style={linkStyle}>Contracts</NavLink>
      <NavLink to="/invoices" style={linkStyle}>Invoices</NavLink>
      <NavLink to="/services" style={linkStyle}>Services</NavLink>
      <NavLink to="/employees" style={linkStyle}>Employees</NavLink>
      <NavLink to="/requests" style={linkStyle}>Requests</NavLink>
      <NavLink to="/common-areas" style={linkStyle}>Common-areas</NavLink>

      <div className="navbar-user">
        <span>Chào, {user.name || user.email}!</span>
      <button onClick={handleLogout} className="btn-logout">Đăng xuất</button>
      </div>  
    </nav>
  );
}
