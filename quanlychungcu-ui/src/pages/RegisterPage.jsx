import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import AuthLayout from '../components/AuthLayout';

function RegisterPage() {
  const [formData, setFormData] = useState({ HoTen: '', Email: '', SoDienThoai: '', Password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await authService.register(formData);
      alert("Đăng ký thành công!");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Lỗi đăng ký');
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Tạo tài khoản" subtitle="Đăng ký để trải nghiệm dịch vụ 5 sao tại Grand Horizon">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 gap-4">
           <div>
             <label className="text-sm font-semibold text-slate-700 ml-1">Họ và Tên</label>
             <input type="text" name="HoTen" required value={formData.HoTen} onChange={handleChange}
               className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 focus:bg-white transition-all" 
               placeholder="Nguyễn Văn A" />
           </div>
           
           <div>
             <label className="text-sm font-semibold text-slate-700 ml-1">Số Điện Thoại</label>
             <input type="tel" name="SoDienThoai" value={formData.SoDienThoai} onChange={handleChange}
               className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 focus:bg-white transition-all" 
               placeholder="090xxxxxxx" />
           </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
          <input type="email" name="Email" required value={formData.Email} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 focus:bg-white transition-all" 
            placeholder="email@grandhorizon.vn" />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 ml-1">Mật khẩu</label>
          <input type="password" name="Password" required value={formData.Password} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 focus:bg-white transition-all" 
            placeholder="Tối thiểu 6 ký tự" />
        </div>

        {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg text-center">{error}</div>}

        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 mt-2"
        >
          {loading ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
        </button>

        <p className="text-center text-slate-500 text-sm mt-4">
          Bạn đã có tài khoản? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Đăng nhập</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;