import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blockService } from '../services/blockService';

const RoomActionModal = ({ isOpen, onClose, apartment }) => {
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Gọi API lấy thông tin chi tiết khi Modal mở
  useEffect(() => {
    if (isOpen && apartment) {
        const fetchInfo = async () => {
            try {
                setLoading(true);
                // Gọi API mới: /api/canho/:id/info
                const data = await blockService.getApartmentInfo(apartment.MaCanHo);
                setInfo(data);
            } catch (error) {
                console.error("Lỗi tải thông tin căn hộ:", error);
                setInfo(null);
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    } else {
        setInfo(null); // Reset khi đóng
    }
  }, [isOpen, apartment]);

  if (!isOpen || !apartment) return null;

  // Xác định trạng thái dựa trên dữ liệu trả về từ API info (hoặc fallback về logic cũ)
  // Backend trả về TrangThaiCode: "OCCUPIED" hoặc "AVAILABLE"
  const isOccupied = info?.TrangThaiCode === 'OCCUPIED' || apartment.MaTrangThai === 11;
  const headerColor = isOccupied ? '#e74c3c' : '#2ecc71';

  const handleNavigateToContract = () => {
      navigate('/contracts', { 
          state: { 
              preSelectedApartment: {
                  value: apartment.MaCanHo,
                  label: apartment.SoCanHo,
                  price: apartment.GiaTien || 0 
              },
              openCreateModal: true 
          } 
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden transform scale-100 transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: headerColor }}>
            <div>
                <h3 className="text-xl font-bold text-white">Căn hộ {apartment.SoCanHo}</h3>
                <span className="text-xs text-white/90 uppercase font-semibold tracking-wider">
                    {loading ? 'Đang tải...' : (isOccupied ? '● Đang có người ở' : '● Phòng trống')}
                </span>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="p-6">
            {loading ? (
                <div className="text-center py-8 text-gray-500">⏳ Đang lấy dữ liệu chủ hộ...</div>
            ) : isOccupied ? (
                // --- TRƯỜNG HỢP: ĐÃ CÓ NGƯỜI (Hiển thị Info từ API) ---
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl border-2 border-red-100">
                        👤
                    </div>
                    
                    {/* Hiển thị thông tin Chủ hộ lấy từ API */}
                    <h4 className="text-lg font-bold text-gray-800 mb-1">
                        {info?.TenChuHo || "Chưa cập nhật tên"}
                    </h4>
                    <p className="text-gray-500 text-sm mb-4">
                        SĐT: <span className="font-medium text-gray-700">{info?.SoDienThoai || "---"}</span>
                    </p>

                    <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm border border-gray-100">
                        <div className="flex justify-between mb-1">
                            <span className="text-gray-500">Hợp đồng:</span>
                            <span className="font-medium text-blue-600">{info?.SoHopDong || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Hết hạn:</span>
                            <span className="font-medium text-red-500">{info?.NgayHetHan ? new Date(info.NgayHetHan).toLocaleDateString('vi-VN') : "---"}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => navigate('/contracts')} // Sau này có thể navigate(`/contracts/${info.ContractId}`)
                            className="w-full py-2.5 border border-blue-200 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 font-medium transition-all"
                        >
                            Xem Chi Tiết Hợp Đồng
                        </button>
                        <button onClick={onClose} className="text-gray-400 text-sm hover:text-gray-600">
                            Đóng cửa sổ
                        </button>
                    </div>
                </div>
            ) : (
                // --- TRƯỜNG HỢP: PHÒNG TRỐNG ---
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl border-2 border-green-100">
                        ✨
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Sẵn sàng cho thuê</h4>
                    <p className="text-gray-500 text-sm mb-6">
                        Căn hộ trống. Bạn có thể lập hợp đồng mới ngay.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleNavigateToContract}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                        >
                            📝 Lập Hợp Đồng Ngay
                        </button>
                        <button onClick={onClose} className="text-gray-400 text-sm hover:text-gray-600">
                            Để sau
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RoomActionModal;