import React, { useState, useEffect } from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - Form này dùng cho cả Create và Update.
 * - Nó quản lý state nội bộ của form (controlled component).
 * - Nó nhận `initialData` để biết đang edit hay create.
 * - Khi submit, nó gọi hàm `onSubmit` từ props.
 */
function BlockForm({ isOpen, onClose, onSubmit, initialData, isLoading }) {
  // State nội bộ của form
  const [formData, setFormData] = useState({ TenBlock: '', SoTang: '' });

  // Xác định xem đây là form Sửa (true) hay Tạo mới (false)
  const isEditMode = Boolean(initialData);

  // 1. Đồng bộ props `initialData` vào state nội bộ `formData`
  useEffect(() => {
    if (isEditMode) {
      // Nếu là edit, điền dữ liệu cũ vào form
      setFormData({
        TenBlock: initialData.TenBlock,
        SoTang: initialData.SoTang,
      });
    } else {
      // Nếu là create, reset form
      setFormData({ TenBlock: '', SoTang: '' });
    }
  }, [initialData, isOpen]); // Chạy lại khi mở modal hoặc khi data edit thay đổi

  // 2. Xử lý input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Xử lý submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return; // Không cho submit nếu đang tải
    
    // Gọi hàm submit từ props (truyền data lên cho cha là BlocksPage)
    onSubmit(formData);
  };

  // 4. Nếu modal không mở, không render gì cả
  if (!isOpen) {
    return null;
  }

  // 5. Render UI
  return (
    // Lớp overlay che mờ
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Nút đóng modal */}
        <button onClick={onClose} className="modal-close-btn" disabled={isLoading}>
          &times;
        </button>
        
        <h2>{isEditMode ? 'Cập nhật Block' : 'Tạo Block Mới'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="TenBlock">Tên Block</label>
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
            <label htmlFor="SoTang">Số Tầng</label>
            <input
              type="number"
              id="SoTang"
              name="SoTang"
              value={formData.SoTang}
              onChange={handleChange}
              min="1"
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

export default BlockForm;