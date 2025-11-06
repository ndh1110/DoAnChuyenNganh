import React, { useState, useEffect, useMemo } from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - Form dùng cho Create và Update Căn hộ.
 * - Nhận `blocks` và `floors` (TẤT CẢ) từ cha.
 * - Tự quản lý state nội bộ của form, bao gồm cả logic dropdown phụ thuộc.
 */
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
    SoCanHo: '',
    MaTrangThai: ''
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
        // Nếu là EDIT
        setFormData({
          MaTang: initialData.MaTang,
          SoCanHo: initialData.SoCanHo,
          MaTrangThai: initialData.MaTrangThai || ''
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
        setFormData({ MaTang: '', SoCanHo: '', MaTrangThai: ''});
        setSelectedBlockId('');
      }
    }
  }, [initialData, isEditMode, isOpen, allFloors]);

  // 2. Xử lý input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (isLoading || !formData.MaTang || !formData.SoCanHo) {
      alert("Vui lòng chọn Tầng và nhập Số Căn Hộ.");
      return;
    }
    // Gửi dữ liệu (đã chuẩn hóa) lên cha
    onSubmit({
      ...formData,
      MaTang: parseInt(formData.MaTang),
      // Đảm bảo các trường rỗng được gửi là NULL (nếu backend yêu cầu)
      MaTrangThai: formData.MaTrangThai ? parseInt(formData.MaTrangThai) : null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large"> {/* Thêm class "large" nếu form dài */}
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
              disabled={!selectedBlockId || isLoading} // Vô hiệu hóa khi chưa chọn block
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
            <label htmlFor="SoCanHo">Số Căn Hộ (*)</label>
            <input
              type="text"
              id="SoCanHo"
              name="SoCanHo"
              value={formData.SoCanHo}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Ví dụ: 101, A-202,..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="MaTrangThai">Trạng Thái Căn Hộ</label>
            <select
              id="MaTrangThai"
              name="MaTrangThai"
              value={formData.MaTrangThai} // Sẽ là ID (vd: 8) hoặc ""
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">-- Không xác định (NULL) --</option>
              {/* Lặp qua danh sách trạng thái đã lọc từ cha */}
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