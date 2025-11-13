import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth

function LoginPage() {
  const [formData, setFormData] = useState({ Email: '', Password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { login } = useAuth(); // 2. Lấy hàm login từ Context

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // 3. Gọi hàm login TỪ CONTEXT
      // (Nó sẽ tự cập nhật state toàn cục VÀ gọi authService)
      await login(formData);
      
      // 4. Chuyển hướng
      // (Không cần reload, Context sẽ lo việc cập nhật UI)
      navigate('/', { replace: true });

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || 'Email hoặc Mật khẩu không đúng';
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Đăng Nhập</h2>
        
        <div className="form-group">
          <label htmlFor="Email">Email</label>
          <input
            type="email"
            id="Email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="Password">Mật khẩu</label>
          <input
            type="password"
            id="Password"
            name="Password"
            value={formData.Password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </div>
        
        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;