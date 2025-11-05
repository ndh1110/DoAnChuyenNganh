import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h2>404 — Không tìm thấy trang</h2>
      <p><Link to="/blocks">Về danh sách Blocks</Link></p>
    </div>
  );
}
