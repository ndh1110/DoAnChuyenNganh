import { NavLink } from "react-router-dom";
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
    </nav>
  );
}
