import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Import cả 3 service
import { announcementService } from '../services/announcementService';
import { getRecentRequests } from '../services/requestService';
import { getMyUnpaidInvoices } from '../services/invoiceService'; 

// (Component Banner giữ nguyên)
const DashboardBanner = () => (
  <div 
    className="h-48 md:h-64 bg-cover bg-center rounded-lg shadow-md mb-6 flex items-center justify-center p-4"
    style={{ 
      backgroundColor: '#334155', 
      backgroundImage: `url('/images/dashboard-banner.jpg')`, 
    }}
  >
    <h1 className="text-white text-3xl md:text-5xl font-bold text-center" 
        style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.5)' }}>
      Chào mừng đến Bảng điều khiển
    </h1>
  </div>
);

/**
 * Trang Dashboard
 */
const DashboardPage = () => {
  const { user } = useAuth();
  
  // === SỬA LOGIC VAI TRÒ ===
  const isGuest = user?.role === 'Khách';
  const isResident = user?.role === 'Resident'; // (Giả định Cư dân thật)
  const isAdmin = user?.role === 'Quản lý';
  // =========================

  // State cho dữ liệu
  const [announcements, setAnnouncements] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  
  // State cho trạng thái
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null); 

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setApiError(null); 
        
        // --- LOGIC TẢI DỮ LIỆU ĐÃ SỬA ---
        
        // 1. "Khách" và "Cư dân" đều tải Thông báo chung
        if (isGuest || isResident) {
          const announcementData = await announcementService.getCommonAnnouncements();
          setAnnouncements(announcementData);
        }

        // 2. CHỈ "Cư dân" (Resident) mới tải Hóa đơn và Yêu cầu
        if (isResident) {
          const [requestData, invoiceData] = await Promise.all([
            getRecentRequests(3), 
            getMyUnpaidInvoices() 
          ]);
          setRecentRequests(requestData.data); 
          setUnpaidInvoices(invoiceData); 
        }
        
        // (Thêm logic tải cho Admin nếu cần)

      } catch (error) {
        console.error("LỖI API DASHBOARD:", error.response || error);
        setApiError("Không thể tải dữ liệu. Vui lòng liên hệ Quản trị viên.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isGuest, isResident]); // Chạy lại nếu vai trò thay đổi

  return (
    <div className="container mx-auto p-6">
      
      <DashboardBanner />

      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Đã xảy ra lỗi! </strong>
          <span className="block sm:inline">{apiError}</span>
        </div>
      )}

      {loading ? (
         <div className="p-6 text-center text-gray-600">Đang tải dữ liệu...</div>
      ) : (
        // Đây là layout 3 cột của Tailwind (sẽ hoạt động sau Bước 1)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Widget Thông báo Chung (Hiện cho Khách & Cư dân) */}
          {(isGuest || isResident) && (
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">🔔 Thông báo Chung</h2>
              {announcements.length > 0 ? (
                <ul className="list-disc pl-5 mt-2 text-sm text-gray-600 space-y-1">
                  {announcements.slice(0, 3).map(item => (
                    <li key={item.MaThongBao}>{item.NoiDung}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Hiện không có thông báo chung nào.</p>
              )}
            </div>
          )}
          
          {/* CHỈ "Cư dân" (Resident) mới thấy 2 widget này */}
          {isResident && !apiError && (
            <>
              {/* Widget Hóa đơn */}
              <div className="bg-white p-5 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">💸 Hóa đơn của tôi</h2>
                {unpaidInvoices.length > 0 ? (
                  <p className="text-gray-700">
                    Bạn có <strong className="text-red-600 text-lg">{unpaidInvoices.length}</strong> hóa đơn
                    chưa thanh toán.
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">Bạn không có hóa đơn nào cần thanh toán.</p>
                )}
                <Link 
                  to="/resident/invoices"
                  className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md mt-4 hover:bg-blue-700 text-sm font-medium"
                >
                  Xem tất cả hóa đơn
                </Link>
              </div>
              
              {/* Widget Yêu cầu */}
              <div className="bg-white p-5 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">🔧 Yêu cầu của tôi</h2>
                {recentRequests.length > 0 ? (
                  <ul className="list-disc pl-5 mt-2 text-sm text-gray-600 space-y-1">
                    {recentRequests.map(item => (
                      <li key={item.MaYeuCau}>
                        {item.Loai} - <span className="font-medium">{item.TrangThaiThanhChung}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Bạn chưa có yêu cầu nào gần đây.</p>
                )}
                <Link 
                  to="/resident/requests"
                  className="inline-block bg-green-600 text-white py-2 px-4 rounded-md mt-4 hover:bg-green-700 text-sm font-medium"
                >
                  Tạo yêu cầu mới
                </Link>
              </div>
            </>
          )}

          {/* (Widget của Admin nếu có) */}
          
        </div>
      )}
    </div>
  );
};

export default DashboardPage;