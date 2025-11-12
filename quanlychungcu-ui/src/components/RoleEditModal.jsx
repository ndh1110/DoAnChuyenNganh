import React, { useState, useEffect } from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - Quản lý state nội bộ cho các ô checkbox.
 * - Nhận props từ cha.
 */
function RoleEditModal({ 
  isOpen, onClose, onSubmit, isLoading,
  allRoles, // Danh sách tất cả vai trò (từ GET /api/vaitro)
  currentUser // User đang sửa (từ GET /api/user-roles)
}) {
  
  // State nội bộ: Dùng Set để quản lý các ID vai trò đã chọn
  const [selectedRoles, setSelectedRoles] = useState(new Set());

  // 1. Đồng bộ props `currentUser` vào state nội bộ `selectedRoles`
  useEffect(() => {
    if (isOpen && currentUser) {
      // Lấy mảng các MaVaiTro từ user (VD: [1, 4])
      const currentRoleIds = currentUser.Roles.map(role => role.MaVaiTro);
      // Đặt state nội bộ
      setSelectedRoles(new Set(currentRoleIds));
    } else {
      setSelectedRoles(new Set());
    }
  }, [currentUser, isOpen]);

  // 2. Xử lý khi check/uncheck
  const handleCheckboxChange = (roleId) => {
    // Tạo bản sao mới của Set
    const newSelectedRoles = new Set(selectedRoles);
    
    if (newSelectedRoles.has(roleId)) {
      newSelectedRoles.delete(roleId);
    } else {
      newSelectedRoles.add(roleId);
    }
    
    setSelectedRoles(newSelectedRoles);
  };

  // 3. Xử lý submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Chuyển Set thành mảng [1, 4] và gửi lên cha
    onSubmit(currentUser.MaNguoiDung, Array.from(selectedRoles));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn" disabled={isLoading}>
          &times;
        </button>
        
        <h2>Cập nhật vai trò cho: {currentUser.HoTen}</h2>
        <p>Email: {currentUser.Email}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <label>Các vai trò:</label>
            {allRoles.map(role => (
              <div key={role.MaVaiTro} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`role-${role.MaVaiTro}`}
                  checked={selectedRoles.has(role.MaVaiTro)}
                  onChange={() => handleCheckboxChange(role.MaVaiTro)}
                  disabled={isLoading}
                />
                <label htmlFor={`role-${role.MaVaiTro}`}>
                  {role.TenVaiTro}
                </label>
              </div>
            ))}
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={isLoading} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className="btn-submit">
              {isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RoleEditModal;