import React, { useState, useEffect } from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - Form này chỉ dùng cho Create.
 */
function FloorForm({ isOpen, onClose, onSubmit, isLoading, blockName }) {
  // State nội bộ của form
  const [soTang, setSoTang] = useState('');

  // Reset form khi modal được mở
  useEffect(() => {
    if (isOpen) {
      setSoTang('');
    }
  }, [isOpen]);

  // Xử lý submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || !soTang) return;
    
    // Gọi hàm submit từ props (truyền data lên cho cha là FloorsPage)
    // Cha sẽ tự biết MaBlock là gì
    onSubmit({ SoTang: parseInt(soTang) });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn" disabled={isLoading}>
          &times;
        </button>
        
        <h2>Thêm Tầng Mới cho: {blockName}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="SoTang">Số Tầng (ví dụ: 1, 2, hoặc 12A)</label>
            <input
              type="number" // Hoặc type="text" nếu bạn cho phép '12A', 'G'
              id="SoTang"
              name="SoTang"
              value={soTang}
              onChange={(e) => setSoTang(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Nhập số tầng..."
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={isLoading} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className="btn-submit">
              {isLoading ? 'Đang lưu...' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FloorForm;