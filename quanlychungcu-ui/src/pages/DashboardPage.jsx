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
import LocationSection from '../components/LocationSection';
import ProgressSection from '../components/ProgressSection';
import PolicySection from '../components/PolicySection'; // <-- IMPORT MỚI

// Banner Hardcode
const DashboardBanner = () => (
  <div 
    className="h-64 md:h-80 bg-cover bg-center rounded-xl shadow-lg mb-10 flex items-center justify-center p-6 relative overflow-hidden"
    style={{ 
      // Ảnh tòa nhà chọc trời chất lượng cao từ Unsplash
      backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80')`, 
      backgroundPosition: 'center 40%'
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
    <div className="relative z-10 text-center">
      <span className="inline-block py-1 px-3 rounded-full bg-blue-600/90 text-white text-xs font-bold tracking-wider mb-3 backdrop-blur-sm">
        PREMIUM RESIDENCE
      </span>
      <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-xl tracking-tight">
        Grand Horizon
      </h1>
      <p className="text-slate-200 mt-2 text-lg font-light">Nơi đẳng cấp thượng lưu hội tụ</p>
    </div>
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
          {/* Vị trí */}
          <LocationSection />
          
          {/* Lý do & Chính sách (MỚI) */}
          <PolicySection />

          {/* Tiện ích */}
          <AmenitiesSection data={amenities} />

          {/* Tiến độ */}
          <ProgressSection />

          {/* Tin tức */}
          <div className="container mx-auto px-6"><div className="h-px bg-gray-200 w-full"></div></div>
          <NewsSection data={announcements} />
        </>
      )}

      {/* --- PHẦN 3: FOOTER (Thiết kế lại theo ảnh Vinhomes) --- */}
      <footer className="bg-[#00303d] text-white pt-16 pb-8"> {/* Màu xanh đậm của Vinhomes */}
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              
              {/* Cột 1: Thông tin chung */}
              <div>
                 <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">
                   GRAND HORIZON
                 </h3>
                 <p className="mb-4 text-sm leading-relaxed max-w-sm">
                   Biểu tượng của sự thịnh vượng và đẳng cấp tại khu Đông Sài Gòn.
                 </p>
                 <p className="text-slate-300 mb-4 text-sm leading-relaxed">
                   <strong className="text-white block mb-1">Văn phòng đại diện:</strong>
                   Tầng 68, Tòa nhà Bitexco, Quận 1, TP.HCM
                 </p>
                 <p className="text-slate-300 mb-4 text-sm leading-relaxed">
                   <strong className="text-white block mb-1">Địa chỉ dự án:</strong>
                   Khu Công Nghệ Cao, Phường Long Thạnh Mỹ, TP. Thủ Đức.
                 </p>
                 <p className="text-slate-300 text-sm">
                   <strong className="text-white">Hotline:</strong> 1900 123 456
                 </p>
              </div>

              {/* Cột 2: Thông tin dự án */}
              <div>
                <h4 className="text-lg font-bold mb-6 text-white">THÔNG TIN PHÂN KHU</h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li><a href="#" className="hover:text-blue-400 transition">The Beverly Solari</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">The Opus One</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">Glory Heights</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">Khu Biệt thự Manhattan</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">Bến du thuyền Marina</a></li>
                </ul>
              </div>

              {/* Cột 3: Đăng ký (Form giả lập) */}
              <div>
                <h4 className="text-lg font-bold mb-6 text-white">ĐĂNG KÝ NHẬN THÔNG TIN</h4>
                <form className="space-y-3">
                  <input type="text" placeholder="Họ tên *" className="w-full px-4 py-2 rounded bg-[#004557] border border-[#00586e] text-white placeholder-slate-400 focus:outline-none focus:border-blue-400" />
                  <input type="text" placeholder="Số điện thoại *" className="w-full px-4 py-2 rounded bg-[#004557] border border-[#00586e] text-white placeholder-slate-400 focus:outline-none focus:border-blue-400" />
                  <textarea placeholder="Yêu cầu thêm" rows="2" className="w-full px-4 py-2 rounded bg-[#004557] border border-[#00586e] text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"></textarea>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors uppercase text-sm tracking-wider">
                    Gửi Ngay
                  </button>
                </form>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 text-center text-xs text-slate-500">
               &copy; 2025 Grand Horizon. Developed by Nhóm 2.
            </div>
         </div>
      </footer>

    </div>
  );
};

export default DashboardPage;