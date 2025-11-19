import React from 'react';

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex w-full overflow-hidden relative">
      
      {/* --- PHẦN TRÁI: BRADING & HÌNH ẢNH (60%) --- */}
      <div className="hidden lg:flex w-[60%] bg-cover bg-center relative" 
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80')" }}>
        
        {/* Lớp phủ Gradient Xanh Đậm sang trọng */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent"></div>
        
        <div className="relative z-10 w-full flex flex-col justify-end px-16 pb-20 text-white">
          <div className="mb-6">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Premium Residence
            </span>
          </div>
          {/* Tên Dự Án Sang Trọng */}
          <h1 className="text-6xl font-bold mb-4 leading-tight">
            Grand <br/> Horizon
          </h1>
          <p className="text-xl text-slate-200 leading-relaxed max-w-lg border-l-4 border-blue-500 pl-4">
            Biểu tượng thịnh vượng mới tại trung tâm thành phố. Nơi đẳng cấp thượng lưu hội tụ.
          </p>
        </div>

        {/* Footer nhỏ */}
        <div className="absolute bottom-6 right-8 text-slate-400 text-xs">
           © 2025 Đồ án chuyên ngành CNTT.
        </div>
      </div>

      {/* --- PHẦN PHẢI: FORM (40%) --- */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center px-8 py-12 relative bg-slate-50">
        
        {/* --- TRANG TRÍ NỀN (HỌA TIẾT LẤP ĐẦY KHOẢNG TRỐNG) --- */}
        {/* Blob 1: Xanh dương nhạt góc trên phải */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        {/* Blob 2: Tím nhạt góc dưới trái */}
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        
        {/* Form Container (Nổi lên trên nền) */}
        <div className="w-full max-w-md relative z-10">
           <div className="text-center mb-10">
             {/* Logo nhỏ cho Mobile/Form */}
             <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-200">
                <span className="text-white font-bold text-2xl">G</span>
             </div>
             <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
             {subtitle && <p className="text-slate-500">{subtitle}</p>}
           </div>
           
           {/* Nội dung Form */}
           <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
             {children}
           </div>

           {/* Footer hỗ trợ */}
           <div className="mt-8 text-center text-sm text-slate-400">
              <a href="#" className="hover:text-blue-600 transition-colors">Điều khoản sử dụng</a>
              <span className="mx-2">•</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Chính sách bảo mật</a>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;