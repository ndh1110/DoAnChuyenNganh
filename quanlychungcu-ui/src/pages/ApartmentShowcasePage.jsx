// src/pages/ApartmentShowcasePage.jsx (PHIÊN BẢN PREMIUM UI)

import React, { useState, useEffect } from 'react';
import { blockService } from '../services/blockService';  
import * as requestService from '../services/requestService';
import api from '../services/api';
import AppointmentForm from '../components/AppointmentForm';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Dùng toast cho đẹp

const API_URL = 'http://localhost:5000/'; 

function ApartmentShowcasePage() {
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All'); // All, Available, Occupied

  // State Modal
  const [selectedApartment, setSelectedApartment] = useState(null); 
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [users, setUsers] = useState([]); 

  useEffect(() => {
    loadApartments();
    loadUsers();
  }, []);
  
  const isStaff = user && ['Quản lý', 'Admin', 'Nhân viên'].includes(user.role);

  const formatCurrency = (value) => {
    if (!value) return 'Liên hệ';
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue) || numericValue === 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericValue);
  };

  const loadApartments = async () => {
    try {
      const data = await blockService.getAllApartments();
      setApartments(data); 
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/nguoidung');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleBookingSubmit = async (formData) => {
    const toastId = toast.loading("Đang xử lý đặt lịch...");
    try {
      const requestPayload = {
        MaNguoiDung: formData.MaNguoiDung,
        MaCanHo: formData.MaCanHo,
        Loai: 'Tham quan', 
        TrangThaiThanhChung: 'OPEN',
        MoTa: `Khách đặt lịch xem căn hộ ${selectedApartment?.SoCanHo}`
      };
      
      const requestRes = await requestService.createRequest(requestPayload);
      const newMaYeuCau = requestRes.data.MaYeuCau;

      await requestService.createAppointment({
        MaYeuCau: newMaYeuCau,
        ThoiGian: formData.ThoiGian,
        MaNguoiDung: formData.MaNguoiDung,
        TrangThai: 'SCHEDULED',
      });
      
      toast.success("Đặt lịch thành công! Nhân viên sẽ liên hệ sớm.", { id: toastId });
      setIsBookingOpen(false);
    } catch (err) {
       toast.error("Lỗi đặt lịch: " + (err.response?.data || err.message), { id: toastId });
    }
  };

  // --- LOGIC LỌC NÂNG CAO ---
  const filteredApartments = apartments.filter(apt => {
      const matchSearch = apt.SoCanHo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBlock = filterBlock === 'All' || apt.TenBlock === filterBlock;
      const matchType = filterType === 'All' || apt.LoaiCanHo === filterType;
      
      let matchStatus = true;
      if (filterStatus === 'Available') matchStatus = apt.MaTrangThai === 8; // Trống
      if (filterStatus === 'Occupied') matchStatus = apt.MaTrangThai !== 8;

      return matchSearch && matchBlock && matchType && matchStatus;
  });

  // Lấy danh sách Block và Loại để đưa vào dropdown
  const uniqueBlocks = ['All', ...new Set(apartments.map(a => a.TenBlock).filter(Boolean))];
  const uniqueTypes = ['All', ...new Set(apartments.map(a => a.LoaiCanHo).filter(Boolean))];

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">⏳ Đang tải thư viện căn hộ...</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
      
      {/* HEADER & FILTER BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6">
              <div>
                  <h2 className="text-3xl font-bold text-slate-800">Tra cứu Căn hộ</h2>
                  <p className="text-slate-500 mt-1">Tìm kiếm không gian sống lý tưởng tại Grand Horizon</p>
              </div>
              <div className="text-right hidden md:block">
                  <span className="text-2xl font-bold text-blue-600">{filteredApartments.length}</span>
                  <span className="text-gray-500 text-sm ml-2">căn hộ phù hợp</span>
              </div>
          </div>

          {/* THANH CÔNG CỤ TÌM KIẾM */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 1. Tìm kiếm */}
              <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
                  <input 
                      type="text" 
                      placeholder="Tìm số phòng (VD: 101)..." 
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>

              {/* 2. Chọn Block */}
              <select 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={filterBlock}
                  onChange={(e) => setFilterBlock(e.target.value)}
              >
                  <option value="All">🏢 Tất cả các Block</option>
                  {uniqueBlocks.filter(b => b !== 'All').map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              {/* 3. Chọn Loại */}
              <select 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
              >
                  <option value="All">🏠 Tất cả loại căn</option>
                  {uniqueTypes.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {/* 4. Chọn Trạng thái */}
              <select 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
              >
                  <option value="All">⚡ Tất cả trạng thái</option>
                  <option value="Available">🟢 Chỉ hiện phòng Trống</option>
                  <option value="Occupied">🔴 Đã có người ở</option>
              </select>
          </div>
      </div>

      {/* GRID DANH SÁCH CĂN HỘ */}
      {filteredApartments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
              <p className="text-gray-400 text-lg">Không tìm thấy căn hộ nào phù hợp.</p>
              <button onClick={() => {setSearchTerm(''); setFilterBlock('All');}} className="mt-4 text-blue-600 hover:underline">Xóa bộ lọc</button>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredApartments.map(apt => (
              <div 
                  key={apt.MaCanHo} 
                  onClick={() => setSelectedApartment(apt)}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-gray-100 group"
              >
                {/* Ảnh cover */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {apt.HinhAnh ? (
                    <img src={`${API_URL}${apt.HinhAnh}`} alt={apt.SoCanHo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-slate-50">
                        <span className="text-4xl">🏢</span>
                        <span className="text-xs mt-2">No Image</span>
                    </div>
                  )}
                  
                  {/* Badge Trạng thái */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${apt.MaTrangThai === 8 ? 'bg-green-500 text-white' : 'bg-gray-800 text-white opacity-80'}`}>
                      {apt.TenTrangThai}
                  </div>
                  
                  {/* Badge Giá (Nếu có cho thuê) */}
                  {apt.IsAvailableForRent && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                          <span className="text-yellow-400 font-bold text-lg">{formatCurrency(apt.RentPrice)}</span>
                          <span className="text-white text-xs"> /tháng</span>
                      </div>
                  )}
                </div>

                {/* Thông tin tóm tắt */}
                <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xl font-bold text-slate-800">{apt.SoCanHo}</h4>
                        <span className="text-xs text-gray-500 border px-2 py-0.5 rounded">{apt.TenBlock}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">📐 {apt.DienTich} m²</span>
                        <span className="flex items-center gap-1">🚪 {apt.LoaiCanHo || 'Standard'}</span>
                    </div>
                </div>
              </div>
            ))}
          </div>
      )}

      {/* --- MODAL CHI TIẾT CĂN HỘ (PREMIUM DESIGN) --- */}
      {selectedApartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           {/* Backdrop làm mờ */}
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedApartment(null)}></div>
           
           {/* Hộp nội dung Modal */}
           <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
               
               {/* Nút đóng */}
               <button 
                  onClick={() => setSelectedApartment(null)} 
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all text-gray-600 hover:text-red-500 font-bold"
               >
                  ✕
               </button>

               {/* CỘT TRÁI: HÌNH ẢNH */}
               <div className="w-full md:w-1/2 bg-gray-100 min-h-[300px] md:min-h-full relative">
                   {selectedApartment.HinhAnh ? (
                       <img src={`${API_URL}${selectedApartment.HinhAnh}`} alt="Detail" className="w-full h-full object-cover" />
                   ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                           <span className="text-6xl mb-4">📷</span>
                           <span>Chưa cập nhật hình ảnh thực tế</span>
                       </div>
                   )}
                   {/* Overlay thông tin trên ảnh */}
                   <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                       <h2 className="text-4xl font-bold text-white mb-1">{selectedApartment.SoCanHo}</h2>
                       <p className="text-gray-300 text-lg">{selectedApartment.TenBlock} • Tầng {selectedApartment.SoTang}</p>
                   </div>
               </div>

               {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
               <div className="w-full md:w-1/2 p-8 flex flex-col">
                   
                   <div className="flex-1">
                       <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Thông tin chi tiết</h3>
                       
                       <div className="grid grid-cols-2 gap-6 mb-8">
                           <div>
                               <p className="text-gray-500 text-sm">Diện tích</p>
                               <p className="text-xl font-bold text-slate-800">{selectedApartment.DienTich} <span className="text-sm font-normal">m²</span></p>
                           </div>
                           <div>
                               <p className="text-gray-500 text-sm">Loại căn hộ</p>
                               <p className="text-xl font-bold text-slate-800">{selectedApartment.LoaiCanHo || 'Standard'}</p>
                           </div>
                           <div>
                               <p className="text-gray-500 text-sm">Trạng thái</p>
                               <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${selectedApartment.MaTrangThai === 8 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                   {selectedApartment.TenTrangThai}
                               </span>
                           </div>
                           <div>
                               <p className="text-gray-500 text-sm">Hướng view</p>
                               <p className="text-slate-800 font-medium">Đang cập nhật...</p>
                           </div>
                       </div>

                       {/* Phần dành cho thuê (Nếu có) */}
                       {selectedApartment.IsAvailableForRent ? (
                           <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
                               <div className="flex justify-between items-start mb-2">
                                   <div>
                                       <p className="text-yellow-800 font-bold text-lg">Cho thuê dài hạn</p>
                                       <p className="text-yellow-600 text-sm mt-1">{selectedApartment.ListingDescription}</p>
                                   </div>
                                   <div className="text-right">
                                       <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedApartment.RentPrice)}</p>
                                       <p className="text-xs text-gray-500">/tháng</p>
                                   </div>
                               </div>
                               <div className="mt-4 pt-4 border-t border-yellow-200 flex gap-3">
                                   <a href={`tel:${selectedApartment.SDTBenB}`} className="flex-1 bg-white border border-yellow-300 text-yellow-700 py-2 rounded-lg text-center font-bold hover:bg-yellow-100 transition-colors">
                                       📞 Gọi Chủ nhà
                                   </a>
                                   <button 
                                        onClick={() => setIsBookingOpen(true)}
                                        className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600 shadow-md transition-colors"
                                   >
                                       📅 Đặt lịch xem
                                   </button>
                               </div>
                           </div>
                       ) : (
                           selectedApartment.MaTrangThai === 8 && (
                               <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 text-center">
                                   <p className="text-blue-800 mb-3">Căn hộ này đang trống và sẵn sàng bàn giao.</p>
                                   <button 
                                       onClick={() => setIsBookingOpen(true)}
                                       className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-transform transform hover:scale-[1.02]"
                                   >
                                       📅 Đăng ký Tham quan ngay
                                   </button>
                               </div>
                           )
                       )}

                       {/* Dành cho Quản lý */}
                       {isStaff && (
                           <div className="mt-6 pt-6 border-t border-gray-100">
                               <button 
                                   onClick={() => navigate(`/staff/apartments/${selectedApartment.MaCanHo}`)}
                                   className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 transition-colors py-2"
                               >
                                   ⚙️ Truy cập trang Quản lý Vận hành
                               </button>
                           </div>
                       )}
                   </div>
               </div>
           </div>
        </div>
      )}

      {/* --- MODAL BOOKING FORM (GIỮ NGUYÊN) --- */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
             <div className='bg-white rounded-xl shadow-2xl p-1 max-w-lg w-full m-4'>
                 <AppointmentForm 
                    allUsers={users} 
                    allApartments={apartments}
                    initialData={{
                        MaNguoiDung: user?.id || user?.MaNguoiDung,
                        MaCanHo: selectedApartment?.MaCanHo
                    }}
                    onSubmit={handleBookingSubmit} 
                    onClose={() => setIsBookingOpen(false)} 
                 />
             </div>
        </div>
      )}

    </div>
  );
}

export default ApartmentShowcasePage;