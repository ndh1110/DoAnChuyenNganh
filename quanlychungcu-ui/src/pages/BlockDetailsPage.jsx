import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blockService } from '../services/blockService';

// Helper để chọn màu trạng thái căn hộ
const getStatusColor = (statusId) => {
  switch (statusId) {
    case 8: return 'bg-green-100 text-green-700 border-green-200'; // Trống
    case 1: return 'bg-blue-100 text-blue-700 border-blue-200';   // Đã bán/Có người
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getStatusName = (statusId) => {
    if(statusId === 8) return 'Trống';
    if(statusId === 1) return 'Đã ở';
    return 'Khác';
}

const BlockDetailsPage = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  
  const [blockData, setBlockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        // Gọi đúng hàm getById
        const data = await blockService.getById(id); 
        setBlockData(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin chi tiết Block. Kiểm tra lại API hoặc Console.");
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-slate-500">⏳ Đang tải sơ đồ tòa nhà...</div>;
  
  if (error) return (
    <div className="p-10 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/blocks')} className="text-blue-600 underline">Quay lại</button>
    </div>
  );

  if (!blockData) return <div className="p-10 text-center">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
            <button onClick={() => navigate('/blocks')} className="text-sm text-slate-500 hover:text-blue-600 mb-2 flex items-center gap-1 cursor-pointer">
                ← Quay lại danh sách
            </button>
            <h1 className="text-3xl font-bold text-slate-800">Sơ đồ {blockData.TenBlock}</h1>
            <p className="text-slate-500">Tổng số tầng: {blockData.Floors?.length || 0}</p>
        </div>
        {/* Chú thích màu sắc */}
        <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Trống</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Đã ở</div>
        </div>
      </div>

      {/* Danh sách Tầng & Căn hộ */}
      <div className="space-y-6">
        {/* --- SỬA LỖI SORT TẠI ĐÂY --- */}
        {blockData.Floors?.sort((a, b) => {
            const nameA = a.TenTang || ""; 
            const nameB = b.TenTang || "";
            return nameB.localeCompare(nameA, undefined, { numeric: true });
        }).map((floor) => (
            <div key={floor.MaTang} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Tên Tầng */}
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">{floor.TenTang || `Tầng (Mã: ${floor.MaTang})`}</h3>
                    <span className="text-xs text-slate-400">{floor.Apartments?.length || 0} căn hộ</span>
                </div>
                
                {/* Grid Căn hộ */}
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {floor.Apartments?.length > 0 ? floor.Apartments.map((apt) => (
                        <div 
                            key={apt.MaCanHo}
                            className={`p-3 rounded-lg border ${getStatusColor(apt.TrangThai)} flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all`}
                            title={`Trạng thái: ${getStatusName(apt.TrangThai)}`}
                        >
                            <span className="font-bold text-lg">{apt.SoCanHo}</span>
                            <span className="text-[10px] uppercase font-semibold mt-1 opacity-70">
                                {getStatusName(apt.TrangThai)}
                            </span>
                        </div>
                    )) : (
                         <p className="col-span-full text-center text-slate-400 text-sm py-2">Tầng này chưa có căn hộ</p>
                    )}
                </div>
            </div>
        ))}
        
        {(!blockData.Floors || blockData.Floors.length === 0) && (
            <div className="text-center text-gray-500 py-10">Block này chưa được Setup tầng/căn hộ.</div>
        )}
      </div>
    </div>
  );
};

export default BlockDetailsPage;