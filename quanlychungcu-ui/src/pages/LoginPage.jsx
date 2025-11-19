import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';

function LoginPage() {
  const [formData, setFormData] = useState({ Email: '', Password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [facebookLoading, setFacebookLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        // Lấy access_token từ Google trả về
        const accessToken = tokenResponse.access_token;
        
        // Gửi về Backend thông qua Context
        await loginWithGoogle(accessToken);
        
        // Thành công -> Về Dashboard
        navigate('/', { replace: true });
      } catch (err) {
        console.error("Google Login Error:", err);
        setError(err.response?.data?.message || 'Đăng nhập Google thất bại');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Không thể kết nối đến Google');
      setLoading(false);
    }
  });

  const handleFacebookLogin = async ({ accessToken, status }) => {
    if (status === 'unknown') {
        setError('Đăng nhập Facebook bị hủy hoặc thất bại.');
        return;
    }
    if (accessToken) {
        setFacebookLoading(true);
        setError(null);
        try {
            // Gọi hàm login đã có trong Context (cùng endpoint social-login)
            await loginWithGoogle('facebook', accessToken); 
            navigate('/', { replace: true });
        } catch (err) {
            console.error("Facebook Login Error:", err);
            setError(err.response?.data?.message || 'Đăng nhập Facebook thất bại');
        } finally {
            setFacebookLoading(false);
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(formData);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc Mật khẩu không đúng');
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Xin chào!" subtitle="Đăng nhập để truy cập vào hệ thống Grand Horizon">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
          <input
            type="email" name="Email" required
            value={formData.Email} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800"
            placeholder="cu.dan@grandhorizon.vn"
          />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center ml-1">
             <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
             <Link to="/forgot-password" class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
               Quên mật khẩu?
             </Link>
          </div>
          <input
            type="password" name="Password" required
            value={formData.Password} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center animate-pulse">
             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
             {error}
          </div>
        )}
        
        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>

        {/* --- PHẦN FILLER: MẠNG XÃ HỘI (Để đỡ trống) --- */}
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">Hoặc tiếp tục với</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {/* Nút Google đã được gắn hàm handleGoogleClick */}
            <button 
                type="button"
                onClick={() => handleGoogleClick()} 
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 text-sm font-medium disabled:opacity-50"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Google
            </button>
            
            <FacebookLogin
                appId="668766522983691" // <-- DÁN ID ỨNG DỤNG FACEBOOK Ở ĐÂY
                onSuccess={handleFacebookLogin} // Gắn hàm xử lý thành công
                autoLoad={false}
                fields="name,email,picture"
                render={renderProps => (
                  <button 
                    onClick={renderProps.onClick}
                    disabled={loading || facebookLoading}
                    className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 text-sm font-medium disabled:opacity-50"
                  >
                     <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
                     Facebook
                  </button>
                )}
            />
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Bạn chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Tạo tài khoản mới</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;