import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

function ResetPasswordPage() {
  const [formData, setFormData] = useState({ newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const { token } = useParams(); // <-- Lấy token từ URL
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Gọi service (sử dụng hàm mới)
      const response = await authService.resetPassword(token, formData);
      
      // 2. Hiển thị thành công và chuẩn bị chuyển hướng
      setSuccessMessage(response.message || "Cập nhật mật khẩu thành công!");
      alert("Cập nhật mật khẩu thành công! Bạn sẽ được chuyển về trang Đăng nhập.");
      navigate('/login');
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "Token không hợp lệ hoặc đã hết hạn.";
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Tạo Mật khẩu Mới</h2>

        {successMessage ? (
          <div className="success-message">
            <p>{successMessage}</p>
            <Link to="/login">Đi đến Đăng nhập</Link>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu Mới</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Nhập mật khẩu mới..."
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? 'Đang lưu...' : 'Lưu Mật khẩu'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default ResetPasswordPage;