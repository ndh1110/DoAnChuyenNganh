import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import AuthLayout from '../components/AuthLayout'; // Import Layout mới

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authService.forgotPassword({ Email: email });
      setSuccessMessage(response.message || "Đã gửi yêu cầu, vui lòng kiểm tra email của bạn.");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "Lỗi không xác định. Email có thể không tồn tại.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Quên Mật Khẩu" subtitle="Đừng lo, chúng tôi sẽ giúp bạn lấy lại mật khẩu">
      
      {/* --- Hiển thị Thông báo thành công --- */}
      {successMessage ? (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Đã gửi Email!</h3>
          <p className="text-gray-600">
            {successMessage}
          </p>
          <Link to="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-center">
            Quay lại Đăng nhập
          </Link>
        </div>
      ) : (
        
        /* --- Hiển thị Form --- */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              Nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi một đường dẫn để bạn thiết lập lại mật khẩu mới.
            </p>
          </div>

          <div>
            <label htmlFor="Email" className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Email</label>
            <input
              type="email"
              id="Email"
              name="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 focus:bg-white transition-all"
              placeholder="name@example.com"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center animate-pulse">
               <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
               {error}
            </div>
          )}
          
          <button type="submit" disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
          
          <div className="text-center mt-6">
            <Link to="/login" className="text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">
              ← Quay lại Đăng nhập
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;