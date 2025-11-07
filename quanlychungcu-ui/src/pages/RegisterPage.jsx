import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

function RegisterPage() {
  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    SoDienThoai: '',
    Password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // 1. Gọi service để đăng ký
      await authService.register(formData);
      
      // 2. Thông báo và chuyển hướng về trang đăng nhập
      alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');

    } catch (err) {
      const errorMsg = err.response?.data || err.message || 'Lỗi không xác định';
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Đăng Ký Tài Khoản</h2>
        
        <div className="form-group">
          <label htmlFor="HoTen">Họ Tên (*)</label>
          <input
            type="text" id="HoTen" name="HoTen"
            value={formData.HoTen} onChange={handleChange} required disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="Email">Email (*)</label>
          <input
            type="email" id="Email" name="Email"
            value={formData.Email} onChange={handleChange} required disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="SoDienThoai">Số Điện Thoại</label>
          <input
            type="tel" id="SoDienThoai" name="SoDienThoai"
            value={formData.SoDienThoai} onChange={handleChange} disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="Password">Mật khẩu (*)</label>
          <input
            type="password" id="Password" name="Password"
            value={formData.Password} onChange={handleChange} required disabled={loading}
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </div>
        
        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;