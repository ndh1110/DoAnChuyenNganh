// src/components/BlockForm.jsx
import React, { useState, useEffect } from 'react';

/**
 * Component "Ngốc" (Dumb Component) - ĐÃ NÂNG CẤP
 * - Form này dùng cho cả Create, Update (mode='crud') VÀ Setup (mode='setup').
 */
function BlockForm({ isOpen, onClose, onSubmit, initialData, isLoading, mode = 'crud' }) {
  
  // State nội bộ của form (chứa tất cả các trường có thể có)
  const [formData, setFormData] = useState({
    TenBlock: '',
    SoTang: '',
    TongSoCanHo: '' // Thêm trường mới
  });

  // Xác định các chế độ
  const isSetupMode = mode === 'setup';
  const isEditMode = !isSetupMode && Boolean(initialData);

  // 1. Đồng bộ props `initialData` hoặc reset form
  useEffect(() => {
    if (isEditMode) {
      // Nếu là Sửa 'crud', điền dữ liệu cũ (bỏ qua TongSoCanHo)
      setFormData({
        TenBlock: initialData.TenBlock,
        SoTang: initialData.SoTang,
        TongSoCanHo: '' // Đảm bảo trường setup được reset
      });
    } else {
      // Nếu là Tạo mới 'crud' HOẶC là 'setup', reset toàn bộ form
      setFormData({ TenBlock: '', SoTang: '', TongSoCanHo: '' });
    }
  }, [initialData, isOpen, mode]);

  // 2. Xử lý input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Xử lý submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Validation riêng cho mode 'setup'
    if (isSetupMode) {
      if (!formData.TenBlock || !formData.SoTang || !formData.TongSoCanHo) {
         alert("Vui lòng điền đầy đủ thông tin.");
         return;
      }
      if (parseInt(formData.TongSoCanHo) % parseInt(formData.SoTang) !== 0) {
        alert("Lỗi: Tổng số căn hộ phải chia hết cho số tầng.");
        return;
      }
    }
    
    // Gọi hàm submit từ props
    onSubmit(formData);
  };

  // 4. Nếu modal không mở, không render gì cả
  if (!isOpen) {
    return null;
  }
  
  // 5. Xác định tiêu đề và nút bấm động
  let title = '';
  let submitText = '';
  
  if (isSetupMode) {
    title = 'Tạo Block Nâng Cao (Setup)';
    submitText = 'Bắt đầu Setup';
  } else if (isEditMode) {
    title = 'Cập nhật Block';
    submitText = 'Cập nhật';
  } else {
    title = 'Tạo Block Mới';
    submitText = 'Tạo mới';
  }

  // 6. Render UI
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn" disabled={isLoading}>
          &times;
        </button>
        
        <h2>{title}</h2>
        {isSetupMode && <p>Tự động sinh Tầng và Căn hộ theo quy tắc.</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="TenBlock">Tên Block {isSetupMode && "(Ví dụ: 'D')"}</label>
            <input
              type="text"
              id="TenBlock"
              name="TenBlock"
              value={formData.TenBlock}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="SoTang">{isSetupMode ? 'Tổng Số Tầng' : 'Số Tầng'}</label>
            <input
              type="number"
              id="SoTang"
              name="SoTang"
              value={formData.SoTang}
              onChange={handleChange}
              min="1"
              required // Yêu cầu ở cả 2 chế độ
              disabled={isLoading}
            />
          </div>
          
          {/* TRƯỜNG MỚI: Chỉ hiển thị ở mode 'setup' */}
          {isSetupMode && (
            <div className="form-group">
              <label htmlFor="TongSoCanHo">Tổng Số Căn Hộ (Cả Block)</label>
              <input
                type="number"
                id="TongSoCanHo"
                name="TongSoCanHo"
                value={formData.TongSoCanHo}
                onChange={handleChange}
                min="1"
                required // Yêu cầu bắt buộc khi setup
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={isLoading} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className="btn-submit">
              {isLoading ? 'Đang lưu...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BlockForm;