import React, { useState, useEffect } from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - Form dùng cho Create và Update Hợp đồng.
 * - Nhận `allResidents` và `allApartments` (đã hydrated) từ cha.
 */
function ContractForm({ 
  isOpen, onClose, onSubmit, isLoading, 
  initialData, 
  allResidents, 
  hydratedApartments // Nhận căn hộ đã "làm giàu"
}) {
  
  // State nội bộ của form
  const [formData, setFormData] = useState({
    MaCanHo: '',
    ChuHoId: '',
    Loai: 'Mua/Bán', // Giá trị mặc định
    NgayKy: '',
    NgayHetHan: '',
  });
  
  const isEditMode = Boolean(initialData);

  // Hàm helper để format ngày (YYYY-MM-DD) cho input type="date"
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  // 1. Đồng bộ props `initialData` vào state
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          MaCanHo: initialData.MaCanHo,
          ChuHoId: initialData.ChuHoId,
          Loai: initialData.Loai,
          NgayKy: formatDateForInput(initialData.NgayKy),
          NgayHetHan: formatDateForInput(initialData.NgayHetHan),
        });
      } else {
        // Reset form
        setFormData({
          MaCanHo: '',
          ChuHoId: '',
          Loai: 'Mua/Bán',
          NgayKy: '',
          NgayHetHan: '',
        });
      }
    }
  }, [initialData, isEditMode, isOpen]);

  // 2. Xử lý input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Xử lý submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || !formData.MaCanHo || !formData.ChuHoId) {
      alert("Vui lòng chọn Căn Hộ và Chủ Hộ.");
      return;
    }
    
    // Gửi dữ liệu (đã chuẩn hóa) lên cha
    onSubmit({
      ...formData,
      // Chuyển "" thành null nếu ngày không bắt buộc
      NgayKy: formData.NgayKy || null,
      NgayHetHan: formData.NgayHetHan || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <button onClick={onClose} className="modal-close-btn" disabled={isLoading}>
          &times;
        </button>
        
        <h2>{isEditMode ? 'Cập nhật Hợp đồng' : 'Tạo Hợp đồng Mới'}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* ----- Dropdown Cư Dân (Chủ Hộ) ----- */}
          <div className="form-group">
            <label htmlFor="ChuHoId">Chủ Hộ (*)</label>
            <select
              id="ChuHoId"
              name="ChuHoId"
              value={formData.ChuHoId}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="">-- Chọn Cư Dân --</option>
              {allResidents.map(res => (
                <option key={res.MaNguoiDung} value={res.MaNguoiDung}>
                  {res.HoTen} (ID: {res.MaNguoiDung})
                </option>
              ))}
            </select>
          </div>

          {/* ----- Dropdown Căn Hộ ----- */}
          <div className="form-group">
            <label htmlFor="MaCanHo">Căn Hộ (*)</label>
            <select
              id="MaCanHo"
              name="MaCanHo"
              value={formData.MaCanHo}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="">-- Chọn Căn Hộ --</option>
              {hydratedApartments.map(apt => (
                <option key={apt.MaCanHo} value={apt.MaCanHo}>
                  {apt.SoCanHo} (Block: {apt.TenBlock} - Tầng: {apt.SoTang})
                </option>
              ))}
            </select>
          </div>
          
          {/* ----- Loại Hợp Đồng ----- */}
          <div className="form-group">
            <label htmlFor="Loai">Loại Hợp Đồng</label>
            <select
              id="Loai"
              name="Loai"
              value={formData.Loai}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="Mua/Bán">Mua/Bán</option>
              <option value="Cho Thuê">Cho Thuê</option>
              <option value="Chuyển nhượng">Chuyển nhượng</option>
            </select>
          </div>

          {/* ----- Ngày Ký / Hết Hạn ----- */}
          <div className="form-group">
            <label htmlFor="NgayKy">Ngày Ký</label>
            <input
              type="date"
              id="NgayKy"
              name="NgayKy"
              value={formData.NgayKy}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="NgayHetHan">Ngày Hết Hạn</label>
            <input
              type="date"
              id="NgayHetHan"
              name="NgayHetHan"
              value={formData.NgayHetHan}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={isLoading} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className="btn-submit">
              {isLoading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContractForm;