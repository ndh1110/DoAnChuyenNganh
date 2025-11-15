// src/pages/HomePage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Chào mừng trở lại, {user?.HoTen || 'Cư dân'}!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Bạn đang đăng nhập với vai trò: <span className="font-bold text-orange-600">{user?.role}</span>
        </p>

        {/* Khu vực hiển thị lối tắt dựa trên vai trò (Tùy chọn) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left">
          
          {/* Tất cả mọi người đều thấy */}
          <div className="p-6 border rounded-lg hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">📩 Yêu cầu & Phản ánh</h3>
            <p className="text-gray-500 mb-4">Gửi yêu cầu sửa chữa hoặc xem lịch sử phản ánh.</p>
            <Link to={user?.role === 'Resident' ? "/my-requests" : "/requests"} className="text-blue-600 hover:underline font-bold">
              Truy cập ngay &rarr;
            </Link>
          </div>

          {/* Chỉ Quản lý/Kỹ thuật thấy */}
          {(user?.role === 'Quản lý' || user?.role === 'Kỹ thuật' || user?.role === 'Admin') && (
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">🛠️ Công việc Kỹ thuật</h3>
              <p className="text-gray-500 mb-4">Quản lý sự cố, kiểm tra định kỳ và phân công.</p>
              <Link to="/common-areas" className="text-blue-600 hover:underline font-bold">
                Quản lý ngay &rarr;
              </Link>
            </div>
          )}

          {/* Chỉ Quản lý thấy */}
          {(user?.role === 'Quản lý' || user?.role === 'Admin') && (
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">🧾 Tài chính & Hóa đơn</h3>
              <p className="text-gray-500 mb-4">Quản lý hóa đơn, thu phí và dịch vụ.</p>
              <Link to="/invoices" className="text-blue-600 hover:underline font-bold">
                Quản lý ngay &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;