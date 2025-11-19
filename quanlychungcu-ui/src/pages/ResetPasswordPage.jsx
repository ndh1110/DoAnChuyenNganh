import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import AuthLayout from '../components/AuthLayout'; // Import Layout mới

function ResetPasswordPage() {
  const [formData, setFormData] = useState({ newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(token, formData);
      // Thông báo alert và chuyển hướng (giữ logic cũ của bạn)
      alert("Cập nhật mật khẩu thành công! Bạn sẽ được chuyển về trang Đăng nhập.");
      navigate('/login');
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "Token không hợp lệ hoặc đã hết hạn.";
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Thiết lập Mật khẩu mới" subtitle="Vui lòng nhập mật khẩu mới của bạn">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label htmlFor="newPassword" class="block text-sm font-semibold text-slate-700 mb-1 ml-1">Mật khẩu Mới</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 focus:bg-white transition-all"
            placeholder="••••••••"
          />
          <p className="text-xs text-slate-500 mt-2 ml-1">Mật khẩu nên có ít nhất 6 ký tự.</p>
        </div>
        
        {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center animate-pulse">
               <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
               {error}
            </div>
        )}
        
        <button type="submit" disabled={loading} 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu Mật khẩu Mới'}
        </button>
        
        <div className="text-center mt-4">
            <Link to="/login" className="text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">
              Hủy bỏ
            </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ResetPasswordPage;