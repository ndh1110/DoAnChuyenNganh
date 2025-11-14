import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // <-- State cho thông báo

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Gọi service
      const response = await authService.forgotPassword({ Email: email });
      
      // 2. Hiển thị thông báo thành công (theo yêu cầu)
      setSuccessMessage(response.message || "Đã gửi yêu cầu, vui lòng kiểm tra email của bạn.");
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "Lỗi không xác định. Email có thể không tồn tại.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Quên Mật khẩu</h2>

        {/* --- Hiển thị Form HOẶC Thông báo thành công --- */}
        {successMessage ? (
          <div className="success-message" style={{color: 'white', textAlign: 'center'}}>
            <p>{successMessage}</p>
            <Link to="/login" style={{marginTop: '15px', display: 'inline-block'}}>
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <>
            <p style={{marginBottom: '15px'}}>
              Nhập email của bạn. Nếu email tồn tại, chúng tôi sẽ gửi một link để reset mật khẩu.
            </p>
            <div className="form-group">
              <label htmlFor="Email">Email</label>
              <input
                type="email"
                id="Email"
                name="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
            <p className="auth-switch">
              <Link to="/login">Hủy</Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}

export default ForgotPasswordPage;