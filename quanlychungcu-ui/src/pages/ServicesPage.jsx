// src/pages/ServicesPage.jsx (FIX LỖI 500 & HIỂN THỊ ĐVT)
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as serviceService from '../services/serviceService';
import ServiceForm from '../components/ServiceForm.jsx';
import PriceForm from '../components/PriceForm.jsx';
import toast, { Toaster } from 'react-hot-toast';

// Icon minh họa
const ServiceIcon = ({ name }) => {
    const n = (name || "").toLowerCase();
    let icon = "🔌"; 
    if (n.includes("nước")) icon = "💧";
    if (n.includes("xe")) icon = "🛵";
    if (n.includes("net") || n.includes("mạng")) icon = "🌐";
    if (n.includes("quản lý")) icon = "🛡️";
    if (n.includes("vệ sinh")) icon = "🧹";
    return <div className="text-4xl mb-2">{icon}</div>;
};

const ServicesPage = () => {
  const { user } = useAuth();
  const canManage = ['Quản lý', 'Admin'].includes(user?.role);

  const [activeTab, setActiveTab] = useState('SERVICES'); 
  const [services, setServices] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formState, setFormState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [servicesRes, pricesRes] = await Promise.all([
        serviceService.getAllServices(),
        serviceService.getAllPrices()
      ]);
      setServices(servicesRes.data);
      setPrices(pricesRes.data);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- HELPER FORMAT CURRENCY (Đã fix lỗi NaN) ---
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 đ';
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericValue);
  };

  // --- HELPER FORMAT DATE CHO API (Fix lỗi 500) ---
  const toApiDate = (dateString) => {
      if (!dateString) return null;
      try {
          // Chuyển về YYYY-MM-DD
          return new Date(dateString).toISOString().split('T')[0];
      } catch (e) {
          return dateString; // Fallback
      }
  };

  const openForm = (type, data = null) => setFormState({ isOpen: true, type, data });
  const closeForm = () => setFormState({ isOpen: false, type: null, data: null });

  // --- XỬ LÝ LƯU DỊCH VỤ ---
  const handleServiceSubmit = async (formData) => {
    try {
        if (formState.data) await serviceService.updateService(formState.data.MaDichVu, formData);
        else await serviceService.createService(formData);
        toast.success("Lưu dịch vụ thành công!");
        closeForm(); fetchData();
    } catch (err) { toast.error(err.message); }
  };

  // --- XỬ LÝ LƯU BẢNG GIÁ (ĐÃ FIX LOGIC) ---
  const handlePriceSubmit = async (formData) => {
    try {
        console.log("Dữ liệu từ Form:", formData); // Debug

        // 1. Tìm trường giá tiền (Chấp nhận nhiều tên biến khác nhau)
        // Tìm DonGia, donGia, Gia, Price...
        const rawPrice = formData.DonGia !== undefined ? formData.DonGia : 
                         formData.donGia !== undefined ? formData.donGia :
                         formData.Gia !== undefined ? formData.Gia : 0;

        // 2. Xử lý giá tiền an toàn (Chuyển chuỗi "3.500" hoặc "3,500" về số chuẩn)
        // Loại bỏ mọi ký tự không phải số (trừ dấu chấm thập phân nếu cần)
        // Ví dụ: "3.500" -> "3500", "120,000" -> "120000"
        let finalPrice = 0;
        if (typeof rawPrice === 'string') {
            // Xóa dấu chấm, dấu phẩy, chữ cái... chỉ giữ lại số
            const cleanString = rawPrice.replace(/[^0-9]/g, ''); 
            finalPrice = parseFloat(cleanString);
        } else {
            finalPrice = parseFloat(rawPrice);
        }

        // 3. Chuẩn hóa Payload
        const payload = {
            ...formData,
            // Ưu tiên lấy MaBangGia từ data cũ nếu đang sửa
            MaBangGia: formState.data?.MaBangGia, 
            // Đảm bảo MaDichVu luôn tồn tại
            MaDichVu: formData.MaDichVu || formState.data?.MaDichVu || formData.maDichVu,
            // Gán giá tiền đã xử lý
            DonGia: isNaN(finalPrice) ? 0 : finalPrice,
            // Chuẩn hóa ngày tháng
            HieuLucTu: toApiDate(formData.HieuLucTu),
            HieuLucDen: toApiDate(formData.HieuLucDen)
        };

        console.log("Payload gửi đi:", payload); // Debug xem gửi gì

        if (formState.data) {
            await serviceService.updatePrice(formState.data.MaBangGia, payload);
        } else {
            await serviceService.createPrice(payload);
        }
        
        toast.success("Lưu bảng giá thành công!");
        closeForm(); 
        
        // Gọi fetch lại ngay lập tức
        fetchData();
    } catch (err) { 
        console.error(err);
        toast.error("Lỗi lưu giá: " + (err.response?.data?.message || err.message)); 
    }
  };

  const handleDelete = async (type, id) => {
      if(!window.confirm("Bạn chắc chắn muốn xóa?")) return;
      try {
          if (type === 'service') await serviceService.deleteService(id);
          if (type === 'price') await serviceService.deletePrice(id);
          toast.success("Đã xóa thành công");
          fetchData();
      } catch(err) { toast.error("Lỗi xóa: " + err.message); }
  }

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Tiện ích & Dịch vụ</h1>
            <p className="text-slate-500 mt-1">Quản lý danh mục dịch vụ và bảng giá niêm yết</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            <button 
                onClick={() => setActiveTab('SERVICES')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'SERVICES' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                📦 Danh mục Dịch vụ
            </button>
            <button 
                onClick={() => setActiveTab('PRICES')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'PRICES' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                💰 Bảng giá hiện hành
            </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? <div className="text-center py-10 text-gray-400">⏳ Đang tải dữ liệu...</div> : (
        <>
            {/* TAB 1: DANH MỤC DỊCH VỤ */}
            {activeTab === 'SERVICES' && (
                <div>
                    {canManage && (
                        <div className="mb-6 flex justify-end">
                            <button onClick={() => openForm('service')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md font-medium transition-transform transform hover:scale-105">
                                + Thêm Dịch Vụ Mới
                            </button>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {services.map(svc => (
                            <div key={svc.MaDichVu} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {canManage && (
                                        <div className="flex gap-2">
                                            <button onClick={() => openForm('service', svc)} className="text-blue-500 bg-blue-50 p-2 rounded-full hover:bg-blue-100">✏️</button>
                                            <button onClick={() => handleDelete('service', svc.MaDichVu)} className="text-red-500 bg-red-50 p-2 rounded-full hover:bg-red-100">🗑️</button>
                                        </div>
                                    )}
                                </div>
                                
                                <ServiceIcon name={svc.TenDichVu} />
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{svc.TenDichVu}</h3>
                                <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                                    {/* FIX HIỂN THỊ ĐVT: Thử nhiều trường hợp */}
                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                        ĐVT: {svc.DonViTinh || svc.DVT || svc.donViTinh || '--'}
                                    </span>
                                    <span className={`font-medium ${svc.KieuTinhPhi === 'Cố định' ? 'text-purple-600' : 'text-orange-600'}`}>
                                        {svc.KieuTinhPhi}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: BẢNG GIÁ */}
            {activeTab === 'PRICES' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">Chi tiết đơn giá</h3>
                        {canManage && (
                            <button onClick={() => openForm('price')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md font-medium text-sm">
                                + Áp dụng giá mới
                            </button>
                        )}
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="p-4">Tên Dịch vụ</th>
                                <th className="p-4">Đơn giá</th>
                                <th className="p-4">Hiệu lực từ</th>
                                <th className="p-4">Đến ngày</th>
                                {canManage && <th className="p-4 text-right">Hành động</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {prices.map(price => (
                                <tr key={price.MaBangGia} className="hover:bg-blue-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800">{price.TenDichVu}</td>
                                    {/* Format giá tiền */}
                                    <td className="p-4 text-lg font-bold text-green-600">{formatCurrency(price.donGia)}</td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(price.HieuLucTu).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {price.HieuLucDen ? new Date(price.HieuLucDen).toLocaleDateString('vi-VN') : <span className="text-green-600 font-medium">Vô thời hạn</span>}
                                    </td>
                                    {canManage && (
                                        <td className="p-4 text-right space-x-2">
                                            <button onClick={() => openForm('price', price)} className="text-blue-600 hover:underline text-sm">Sửa</button>
                                            <span className="text-gray-300">|</span>
                                            <button onClick={() => handleDelete('price', price.MaBangGia)} className="text-red-600 hover:underline text-sm">Xóa</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
      )}

      {/* FORMS */}
      {canManage && formState.isOpen && formState.type === 'service' && (
        <ServiceForm initialData={formState.data} onSubmit={handleServiceSubmit} onClose={closeForm} />
      )}
      {canManage && formState.isOpen && formState.type === 'price' && (
        <PriceForm initialData={formState.data} services={services} onSubmit={handlePriceSubmit} onClose={closeForm} />
      )}
    </div>
  );
};

export default ServicesPage;