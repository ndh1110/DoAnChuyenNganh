// src/pages/ApartmentShowcasePage.jsx
import React, { useState, useEffect } from 'react';
import { apartmentService } from '../services/apartmentService';
import * as requestService from '../services/requestService';
import api from '../services/api';
import AppointmentForm from '../components/AppointmentForm';

// 1. IMPORT USEAUTH
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
const API_URL = 'http://localhost:5000/'; 

function ApartmentShowcasePage() {
  // 2. LẤY USER HIỆN TẠI
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState(null); 
  const [filterType, setFilterType] = useState('All');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // Vẫn load users để truyền vào form (để select box render đúng value), 
  // dù ta sẽ khóa select box đó lại.
  const [users, setUsers] = useState([]); 

  useEffect(() => {
    loadApartments();
    loadUsers();
  }, []);
  
  const isStaff = user && (user.role === 'Quản lý' || user.role === 'Admin' || user.role === 'Nhân viên');

  const formatCurrency = (value) => {
    if (!value) return '0 đ';
    // Chuyển đổi chuỗi thành số trước khi format, đề phòng giá trị từ DB là string
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericValue);
  };
  const loadApartments = async () => {
    try {
      const data = await apartmentService.getAll();
      setApartments(data); 
    } catch (error) {
      console.error("Lỗi tải dữ liệu căn hộ:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/nguoidung');
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách người dùng:", err);
    }
  };

  const handleOpenBooking = () => {
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const handleBookingSubmit = async (formData) => {
    // formData { MaNguoiDung, MaCanHo, ThoiGian }
    
    try {
      // BƯỚC 1: Tạo Yêu cầu 'Tham quan'
      const requestPayload = {
        MaNguoiDung: formData.MaNguoiDung,
        MaCanHo: formData.MaCanHo,
        Loai: 'Tham quan', 
        TrangThaiThanhChung: 'OPEN',
        MoTa: `Khách hàng đặt lịch xem căn hộ qua trang Thư viện.`
      };
      
      const requestRes = await requestService.createRequest(requestPayload);
      const newMaYeuCau = requestRes.data.MaYeuCau;

      // BƯỚC 2: Tạo Lịch hẹn
      const appointmentPayload = {
        MaYeuCau: newMaYeuCau,
        ThoiGian: formData.ThoiGian,
        MaNguoiDung: formData.MaNguoiDung,
        TrangThai: 'SCHEDULED',
      };

      await requestService.createAppointment(appointmentPayload);
      
      alert("🎉 Đã đặt lịch xem nhà thành công! Nhân viên sẽ sớm liên hệ lại.");
      handleCloseBooking();
      
    } catch (err) {
       console.error("Lỗi khi Đặt lịch hẹn:", err);
       alert("Lỗi đặt lịch: " + (err.response?.data || err.message));
    }
  };

  const filteredApartments = filterType === 'All' 
    ? apartments 
    : apartments.filter(apt => apt.LoaiCanHo === filterType);
  const apartmentTypes = ['All', ...new Set(apartments.map(a => a.LoaiCanHo).filter(Boolean))];

  if (loading) return <div className="page-container">Đang tải...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Thư viện Căn hộ</h2>
        <p style={{ color: '#666' }}>Khám phá không gian sống đẳng cấp</p>
      </div>

      {/* Bộ lọc */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {apartmentTypes.map(type => (
            <button key={type} onClick={() => setFilterType(type)}
                style={{
                    padding: '8px 16px', borderRadius: '20px', border: '1px solid #3498db',
                    background: filterType === type ? '#3498db' : '#fff',
                    color: filterType === type ? '#fff' : '#3498db', cursor: 'pointer'
                }}
            >
                {type === 'All' ? 'Tất cả' : type}
            </button>
        ))}
      </div>

      {/* --- MODAL FORM ĐẶT LỊCH --- */}
      {isBookingOpen && (
        <div style={{ position: 'fixed', zIndex: 9999, inset: 0 }}>
             <AppointmentForm 
                allUsers={users} 
                allApartments={apartments}
                // 3. QUAN TRỌNG: TRUYỀN ID USER VÀ CĂN HỘ VÀO ĐÂY
                initialData={{
                    // Tự động lấy ID user đang đăng nhập
                    MaNguoiDung: user?.id || user?.MaNguoiDung || user?.userId || user?.sub,
                    // Tự động lấy Căn hộ đang chọn
                    MaCanHo: selectedApartment?.MaCanHo
                }}
                onSubmit={handleBookingSubmit} 
                onClose={handleCloseBooking} 
             />
        </div>
      )}

      {/* --- HIỂN THỊ CHI TIẾT (INLINE) --- */}
      {selectedApartment && (
        <div style={styles.detailSection}>
          <button className="modal-close-btn" onClick={() => setSelectedApartment(null)} style={styles.closeDetailBtn}>&times;</button>
          
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '1.5', minWidth: '300px' }}>
               {selectedApartment.HinhAnh ? (
                  <img src={`${API_URL}${selectedApartment.HinhAnh}`} alt="Chi tiết" 
                    style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '500px' }}
                  />
               ) : (
                  <div style={{...styles.noImage, height: '400px', borderRadius: '8px'}}>Chưa có hình ảnh</div>
               )}
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '300px' }}>
              <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '20px' }}>
                  Căn hộ {selectedApartment.SoCanHo}
              </h2>
              <div style={{ lineHeight: '1.8', fontSize: '1.1em' }}>
                  <p><strong>🏢 Block:</strong> {selectedApartment.TenBlock}</p>
                  <p><strong>🆙 Tầng:</strong> {selectedApartment.SoTang}</p>
                  <p><strong>🏠 Loại căn hộ:</strong> {selectedApartment.LoaiCanHo}</p>
                  <p><strong>📐 Diện tích:</strong> {selectedApartment.DienTich} m²</p>
                  <p><strong>⚡ Trạng thái:</strong> {selectedApartment.TenTrangThai}</p>
              </div>
               {isStaff && (
                  <div style={{ marginTop: '20px', borderTop: '1px dashed #ddd', paddingTop: '15px' }}>
                      <button 
                          onClick={() => navigate(`/staff/apartments/${selectedApartment.MaCanHo}`)}
                          style={{ 
                              width: '100%', 
                              padding: '10px', 
                              background: '#f39c12', 
                              color: 'white', 
                              fontWeight: 'bold',
                              borderRadius: '6px'
                          }}
                      >
                          ⚙️ Mở Trang Quản Lý Vận Hành
                      </button>
                  </div>
              )}
    <div style={{ marginTop: '30px' }}>
                 {/* 1. TRƯỜNG HỢP CĂN HỘ CHƯA CÓ CHỦ SỞ HỮU (TRỐNG) */}
                 {selectedApartment.TenTrangThai === 'Trống' ? (
                    <button 
                        className="btn-submit" 
                        style={{ width: '100%', padding: '15px', fontSize: '1.1em' }} 
                        onClick={handleOpenBooking}
                    >
                      📅 Liên hệ đặt lịch xem nhà (Quản lý)
                    </button>
                 
                 // 2. TRƯỜNG HỢP CĂN HỘ CÓ CHỦ SỞ HỮU & ĐĂNG CHO THUÊ
                 ) : (selectedApartment.TenTrangThai !== 'Trống' && selectedApartment.IsAvailableForRent === true) ? (
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        
                        <div style={{ padding: '15px', border: '1px solid #ffcc00', borderRadius: '8px', background: '#fffbeb' }}>
                           <h4 style={{ margin: '0 0 5px 0', color: '#856404' }}>Thông tin niêm yết</h4>
                           <p style={{ margin: 0, fontWeight: 'bold' }}>💰 Giá thuê: {formatCurrency(selectedApartment.RentPrice)}</p>
                           <p style={{ margin: '5px 0 0 0', fontStyle: 'italic', fontSize: '0.9em' }}>Mô tả: {selectedApartment.ListingDescription || 'Chưa có mô tả chi tiết.'}</p>
                        </div>

                        <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                            Chủ căn hộ: {selectedApartment.TenBenB}
                        </p>
                        
                        {/* NÚT 1: GỌI ĐIỆN / HIỂN THỊ SĐT */}
                        <a 
                            href={`tel:${selectedApartment.SDTBenB}`}
                            style={styles.contactButton}
                        >
                            📞 Gọi điện ({selectedApartment.SDTBenB || 'Không rõ SĐT'})
                        </a>
                        
                        {/* NÚT 2: LIÊN HỆ QUA ZALO */}
                        <a 
                            // Giả sử SĐT đã đăng ký Zalo
                            href={`https://zalo.me/${selectedApartment.SDTBenB}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{...styles.contactButton, backgroundColor: '#0084ff'}}
                        >
                            💬 Liên hệ qua Zalo
                        </a>
                        
                    </div>

                 // 3. TRƯỜNG HỢP CĂN HỘ KHÔNG CÓ SẴN
                 ) : (
                    <button disabled style={{ width: '100%', padding: '15px', background: '#e0e0e0', cursor: 'not-allowed' }}>
                      🚫 Đã có người ở / Chưa sẵn sàng cho thuê
                    </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- GRID ẢNH --- */}
      <div style={styles.gridContainer}>
        {filteredApartments.map(apt => (
          <div key={apt.MaCanHo} style={styles.card} onClick={() => setSelectedApartment(apt)}>
             {/* ... Giữ nguyên phần hiển thị card ... */}
             <div style={styles.imageWrapper} className="image-wrapper">
              {apt.HinhAnh ? (
                <img src={`${API_URL}${apt.HinhAnh}`} alt={apt.SoCanHo} style={styles.image} onError={(e) => {e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}} />
              ) : (
                <div style={styles.noImage}><span>{apt.SoCanHo}</span><br/><small>Chưa có ảnh</small></div>
              )}
              <div className="overlay" style={styles.overlay}><span>Xem chi tiết</span></div>
            </div>
            <div style={styles.cardInfo}>
                <h4 style={{margin: '0 0 5px 0', color: '#2c3e50'}}>{apt.SoCanHo}</h4>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                     <span>{apt.DienTich} m²</span>
                     <span>{apt.TenTrangThai}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
      
      <style>{` .image-wrapper:hover .overlay { opacity: 1 !important; } `}</style>
    </div>
  );
}

// (Giữ nguyên phần styles)
const styles = {
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', padding: '20px 0' },
  card: { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #eee' },
  imageWrapper: { width: '100%', height: '200px', position: 'relative', backgroundColor: '#f5f6fa', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  noImage: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#bdc3c7', backgroundColor: '#ecf0f1' },
  cardInfo: { padding: '15px 20px' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: 0, transition: 'opacity 0.3s' },
  detailSection: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', padding: '30px', marginBottom: '40px', position: 'relative', border: '1px solid #ddd' },
  closeDetailBtn: { position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '2em', cursor: 'pointer', color: '#666' },
  contactButton: { 
    display: 'block', 
    padding: '12px', 
    textAlign: 'center', 
    borderRadius: '8px', 
    fontWeight: 'bold', 
    textDecoration: 'none',
    color: '#fff',
    backgroundColor: '#2ecc71', // Màu xanh lá cho cuộc gọi
    transition: 'background-color 0.2s'
  },
};

export default ApartmentShowcasePage;