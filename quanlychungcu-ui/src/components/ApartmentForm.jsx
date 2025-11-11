// src/components/ApartmentForm.jsx
import React, { useState, useEffect, useMemo } from 'react';

// Định nghĩa các loại căn hộ và diện tích mặc định
const apartmentTypes = [
  { type: "1 phòng ngủ", area: 51 },
  { type: "2 phòng ngủ", area: 69 },
  { type: "3 phòng ngủ", area: 108 },
  { type: "Penthouse", area: 200 }
];
const areaMap = new Map(apartmentTypes.map(t => [t.type, t.area]));

// HÀM HELPER: Tách số thứ tự từ mã căn hộ
// Ví dụ: "A.02.03" -> "3" | "B.10.12" -> "12" | "101" -> "101"
const getSoThuTu = (soCanHoStr) => {
  if (!soCanHoStr) return '';
  const parts = soCanHoStr.split('.');
  // Nếu là định dạng A.02.03
  if (parts.length === 3 && !isNaN(parseInt(parts[2], 10))) {
    return parseInt(parts[2], 10).toString(); // Trả về "3"
  }
  // Nếu là định dạng khác (ví dụ "101"), trả về chính nó
  return soCanHoStr;
};


function ApartmentForm({ 
  isOpen, onClose, onSubmit, isLoading, 
  initialData, 
  allBlocks, 
  allFloors,
  apartmentStatuses
}) {
  
  // State nội bộ của form
  const [formData, setFormData] = useState({
    MaTang: '',
    SoThuTu: '', // Đổi tên từ SoCanHo
    MaTrangThai: '',
    LoaiCanHo: '',
    DienTich: ''
  });
  
  // State cho dropdown phụ thuộc
  const [selectedBlockId, setSelectedBlockId] = useState('');

  const isEditMode = Boolean(initialData);

  // Lọc danh sách tầng dựa trên block được chọn
  const availableFloors = useMemo(() => {
    if (!selectedBlockId) return [];
    return allFloors.filter(f => f.MaBlock.toString() === selectedBlockId);
  }, [selectedBlockId, allFloors]);

  // 1. Đồng bộ props `initialData` vào state nội bộ `formData`
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // Nếu là EDIT, TÁCH SỐ THỨ TỰ
        const soThuTu = getSoThuTu(initialData.SoCanHo);
        
        setFormData({
          MaTang: initialData.MaTang,
          SoThuTu: soThuTu, // DÙNG SỐ ĐÃ TÁCH
          MaTrangThai: initialData.MaTrangThai || '',
          LoaiCanHo: initialData.LoaiCanHo || '',
          DienTich: initialData.DienTich || ''
        });
        
        // Tìm MaBlock tương ứng với MaTang của căn hộ đang sửa
        const floor = allFloors.find(f => f.MaTang === initialData.MaTang);
        if (floor) {
          setSelectedBlockId(floor.MaBlock.toString());
        } else {
          setSelectedBlockId('');
        }
      } else {
        // Nếu là CREATE, reset form
        setFormData({ MaTang: '', SoThuTu: '', MaTrangThai: '', LoaiCanHo: '', DienTich: ''});
        setSelectedBlockId('');
      }
    }
  }, [initialData, isEditMode, isOpen, allFloors]);

  // 2. Xử lý input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2b. XỬ LÝ KHI CHỌN LOẠI CĂN HỘ (Tự động điền diện tích)
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const defaultArea = areaMap.get(newType) || ''; // Lấy diện tích mặc định
    setFormData(prev => ({
      ...prev,
      LoaiCanHo: newType,
      DienTich: defaultArea // Tự điền diện tích
    }));
  };

  // 3. Xử lý khi đổi Block
  const handleBlockChange = (e) => {
    setSelectedBlockId(e.target.value);
    // Khi đổi block, reset Tầng đã chọn (vì nó không còn hợp lệ)
    setFormData(prev => ({ ...prev, MaTang: '' }));
  };

  // 4. Xử lý submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || !formData.MaTang || !formData.SoThuTu) {
      alert("Vui lòng chọn Tầng và nhập Số Thứ Tự Căn Hộ.");
      return;
    }
    // Gửi dữ liệu (đã chuẩn hóa) lên cha
    onSubmit({
      ...formData,
      MaTang: parseInt(formData.MaTang),
      SoThuTu: formData.SoThuTu.trim(), // GỬI SoThuTu LÊN
      MaTrangThai: formData.MaTrangThai ? parseInt(formData.MaTrangThai) : null,
      DienTich: formData.DienTich ? parseFloat(formData.DienTich) : null,
      LoaiCanHo: formData.LoaiCanHo || null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <button onClick={onClose} className="modal-close-btn" disabled={isLoading}>
          &times;
        </button>
        
        <h2>{isEditMode ? 'Cập nhật Căn hộ' : 'Tạo Căn hộ Mới'}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* ----- Dropdown Phụ thuộc ----- */}
          <div className="form-group">
            <label htmlFor="blockSelectForm">Chọn Block (*)</label>
            <select
              id="blockSelectForm"
              value={selectedBlockId}
              onChange={handleBlockChange}
              required
              disabled={isLoading}
            >
              <option value="">-- Chọn Block --</option>
              {allBlocks.map(block => (
                <option key={block.MaBlock} value={block.MaBlock}>
                  {block.TenBlock}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="MaTang">Chọn Tầng (*)</label>
            <select
              id="MaTang"
              name="MaTang"
              value={formData.MaTang}
              onChange={handleChange}
              required
              disabled={!selectedBlockId || isLoading}
            >
              <option value="">-- Chọn Tầng --</option>
              {availableFloors.map(floor => (
                <option key={floor.MaTang} value={floor.MaTang}>
                  Tầng số: {floor.SoTang} (ID: {floor.MaTang})
                </option>
              ))}
            </select>
          </div>
          
          {/* ----- Các trường dữ liệu khác ----- */}
          <div className="form-group">
            <label htmlFor="SoThuTu">Số Thứ Tự Căn Hộ (*)</label>
            <input
              type="text"
              id="SoThuTu"
              name="SoThuTu"
              value={formData.SoThuTu}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Ví dụ: 3 (sẽ thành .03) hoặc 10 (sẽ thành .10)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="LoaiCanHo">Loại Căn Hộ</label>
            <select
              id="LoaiCanHo"
              name="LoaiCanHo"
              value={formData.LoaiCanHo}
              onChange={handleTypeChange}
              disabled={isLoading}
            >
              <option value="">-- Chọn loại căn hộ --</option>
              {apartmentTypes.map(t => (
                <option key={t.type} value={t.type}>
                  {t.type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="DienTich">Diện Tích (m²)</label>
            <input
              type="number"
              step="0.01"
              id="DienTich"
              name="DienTich"
              value={formData.DienTich}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ví dụ: 51"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="MaTrangThai">Trạng Thái Căn Hộ</label>
            <select
              id="MaTrangThai"
              name="MaTrangThai"
              value={formData.MaTrangThai}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">-- Không xác định (NULL) --</option>
              {apartmentStatuses.map(status => (
                <option key={status.MaTrangThai} value={status.MaTrangThai}>
                  {status.Ten}
                </option>
              ))}
            </select>
          </div>
          
          {/* ----- Nút bấm ----- */}
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

export default ApartmentForm;