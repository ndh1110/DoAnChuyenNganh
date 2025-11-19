import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Services
import { announcementService } from '../services/announcementService';
import { getRecentRequests } from '../services/requestService';
import { getMyUnpaidInvoices } from '../services/invoiceService'; 
import { commonAreaService } from '../services/commonAreaService'; // <-- Import đúng file bạn gửi

// Components
import AmenitiesSection from '../components/AmenitiesSection';
import NewsSection from '../components/NewsSection';

// Banner Hardcode
const DashboardBanner = () => (
  <div 
    className="h-48 md:h-64 bg-cover bg-center rounded-lg shadow-md mb-8 flex items-center justify-center p-4 relative overflow-hidden"
    style={{ 
      backgroundColor: '#1e293b', 
      backgroundImage: `url('/images/dashboard-banner.jpg')`, 
    }}
  >
    <div className="absolute inset-0 bg-black/30"></div>
    <h1 className="text-white text-3xl md:text-5xl font-bold text-center relative z-10 drop-shadow-lg">
      Chào mừng đến Bảng điều khiển
    </h1>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  
  const isGuest = user?.role === 'Khách';
  const isResident = user?.role === 'Resident'; 
  const isAdmin = user?.role === 'Quản lý';

  // State
  const [announcements, setAnnouncements] = useState([]);
  const [amenities, setAmenities] = useState([]); 
  const [recentRequests, setRecentRequests] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Gọi API Chung cho TẤT CẢ User (Kể cả Khách)
        // - Lấy Thông báo (để lọc Tin tức)
        // - Lấy Khu vực chung (để lọc Tiện ích)
        const [announcementData, amenityData] = await Promise.all([
          announcementService.getCommonAnnouncements(),
          commonAreaService.getAll() // <-- Hàm này có trong file bạn gửi
        ]);

        setAnnouncements(announcementData);
        setAmenities(amenityData);

        // 2. CHỈ Cư dân mới tải Hóa đơn & Yêu cầu cá nhân
        if (isResident) {
          const [requestData, invoiceData] = await Promise.all([
            getRecentRequests(3), 
            getMyUnpaidInvoices() 
          ]);
          setRecentRequests(requestData.data || []); 
          setUnpaidInvoices(invoiceData || []); 
        }
        
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isGuest, isResident, isAdmin]); 

  return (
    <div className="min-h-screen bg-white">
      
      {/* PHẦN 1: BANNER & WIDGETS CHỨC NĂNG */}
      <div className="bg-gray-50 pb-16">
        <div className="container mx-auto p-6">
          <DashboardBanner />

          {loading ? (
             <div className="p-12 text-center text-gray-500 text-lg">⏳ Đang tải dữ liệu...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Widget 1: Thông báo Vận Hành (Lọc những cái KHÔNG PHẢI là NEWS) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">📢</span>
                  <h2 className="text-xl font-bold text-gray-800">Thông báo Vận hành</h2>
                </div>
                {announcements.length > 0 ? (
                  <ul className="space-y-3">
                    {/* Chỉ hiện thông báo thường, ẩn tin tức NEWS */}
                    {announcements
                      .filter(a => a.MaTemplate !== 'NEWS') 
                      .slice(0, 3)
                      .map(item => (
                      <li key={item.MaThongBao} className="text-gray-600 text-sm pb-2 border-b border-gray-50 last:border-0">
                        • {item.NoiDung}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic text-sm">Không có thông báo vận hành mới.</p>
                )}
              </div>

              {/* Widget Cư dân */}
              {isResident && (
                <>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">💸</span>
                      <h2 className="text-xl font-bold text-gray-800">Hóa đơn</h2>
                    </div>
                    <div className="text-center py-4">
                      <p className="text-3xl font-bold text-red-500 mb-1">{unpaidInvoices.length}</p>
                      <p className="text-gray-500 text-sm mb-4">Cần thanh toán</p>
                      <Link to="/resident/invoices" className="text-blue-600 font-semibold hover:underline">Xem chi tiết &rarr;</Link>
                    </div>
                  </div>

                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">🔧</span>
                      <h2 className="text-xl font-bold text-gray-800">Yêu cầu</h2>
                    </div>
                    <div className="text-center py-4">
                      <Link to="/resident/requests" className="inline-block w-full py-2 bg-green-50 text-green-600 font-semibold rounded-lg hover:bg-green-100 transition-colors">
                        + Gửi yêu cầu mới
                      </Link>
                    </div>
                  </div>
                </>
              )}
              
               {/* Widget Quản lý (Admin) */}
               {isAdmin && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                     <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">⚙️</span>
                        <h2 className="text-xl font-bold text-gray-800">Quản trị</h2>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <Link to="/residents" className="text-blue-600 hover:underline">Cư dân</Link>
                       <Link to="/invoices" className="text-blue-600 hover:underline">Hóa đơn</Link>
                     </div>
                  </div>
               )}

            </div>
          )}
        </div>
      </div>

      {/* PHẦN 2: NỘI DUNG ĐỘNG (TIỆN ÍCH & TIN TỨC) */}
      {/* Dữ liệu được truyền xuống từ State đã fetch ở trên */}
      {!loading && (
        <>
          <AmenitiesSection data={amenities} />
          <div className="container mx-auto px-6"><div className="h-px bg-gray-200 w-full"></div></div>
          <NewsSection data={announcements} />
        </>
      )}

      {/* PHẦN 3: FOOTER */}
      <footer className="bg-slate-800 text-white py-12 mt-auto">
         <div className="container mx-auto px-6 text-center">
            <h3 className="text-xl font-bold mb-4">Ban Quản Lý Chung Cư Building Care</h3>
            <p className="text-slate-400 mb-2">📍 Địa chỉ: Khu Công Nghệ Cao, TP. Thủ Đức, TP.HCM</p>
            <p className="text-slate-400 mb-6">📞 Hotline: 1900 123 456</p>
            <div className="border-t border-slate-700 pt-6 mt-6 text-sm text-slate-500">
               &copy; 2025 Đồ án tốt nghiệp.
            </div>
         </div>
      </footer>

    </div>
  );
};

export default DashboardPage;