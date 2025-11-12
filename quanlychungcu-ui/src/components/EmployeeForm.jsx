import React, { useState, useEffect, useMemo } from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - Form dùng cho Create/Update Hồ sơ Nhân viên (Employee Profile).
 * - ĐÃ THÊM 'NgayVaoLam', 'MaSoThue'.
 */
function EmployeeForm({ 
  isOpen, onClose, onSubmit, isLoading, 
  initialData, // Dữ liệu nhân viên đang sửa
  allUsers,    // Danh sách Người dùng (để tạo NV mới)
  allRoles     // Danh sách Vai trò (để gán vai trò)
}) {
  
  // Hàm helper để format ngày (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  // State nội bộ của form
  const [formData, setFormData] = useState({
    MaNguoiDung: '', // Chỉ dùng khi Tạo mới
    TrangThai: 'Active',
    NgayVaoLam: formatDateForInput(new Date()), // Mặc định hôm nay
    MaSoThue: '',
    // --- State MỚI cho Phân quyền ---
    roleIds: [] // Mảng các MaVaiTro, VD: [2, 3]
  });
  
  const isEditMode = Boolean(initialData);

  // 1. Đồng bộ props `initialData` vào state
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // Chế độ SỬA
        setFormData({
          MaNguoiDung: initialData.MaNguoiDung, // Không thể sửa
          TrangThai: initialData.TrangThai,
          NgayVaoLam: formatDateForInput(initialData.NgayVaoLam),
          MaSoThue: initialData.MaSoThue || '',
          // Lấy vai trò hiện tại của user
          roleIds: initialData.Roles.map(r => r.MaVaiTro)
        });
      } else {
        // Chế độ TẠO MỚI
        setFormData({
          MaNguoiDung: '',
          TrangThai: 'Active',
          NgayVaoLam: formatDateForInput(new Date()),
          MaSoThue: '',
          roleIds: [] // Mặc định chưa có vai trò
        });
      }
    }
  }, [initialData, isEditMode, isOpen]);

  // 2. Xử lý input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Xử lý Checkbox Vai trò
  const handleRoleChange = (roleId) => {
    setFormData(prev => {
      const newRoles = new Set(prev.roleIds);
      if (newRoles.has(roleId)) {
        newRoles.delete(roleId);
      } else {
        newRoles.add(roleId);
      }
      return { ...prev, roleIds: Array.from(newRoles) };
    });
  };

  // 4. Xử lý submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Khi tạo mới, bắt buộc phải chọn Người dùng
    if (!isEditMode && !formData.MaNguoiDung) {
      alert("Vui lòng chọn một người dùng để tạo hồ sơ nhân viên.");
      return;
    }
    
    // Gửi dữ liệu (đã chuẩn hóa) lên cha
    onSubmit(formData);
  };

  // Lọc danh sách user (chỉ hiện user CHƯA LÀ nhân viên)
  // (Giữ nguyên từ code cũ của bạn)
  const availableUsers = useMemo(() => {
    return allUsers.filter(user => !user.MaNhanVien);
  }, [allUsers]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <button onClick={onClose} className="modal-close-btn" disabled={isLoading}>
          &times;
        </button>
        
        <h2>{isEditMode ? 'Cập nhật Hồ sơ Nhân viên' : 'Tạo Nhân viên Mới'}</h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* ----- Dropdown Chọn Người Dùng (Chỉ khi TẠO MỚI) ----- */}
          {!isEditMode && (
            <div className="form-group">
              <label htmlFor="MaNguoiDung">Chọn Người Dùng (*)</label>
              <select
                id="MaNguoiDung"
                name="MaNguoiDung"
                value={formData.MaNguoiDung}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">-- Chọn từ danh sách Người dùng --</option>
                {availableUsers.map(user => (
                  <option key={user.MaNguoiDung} value={user.MaNguoiDung}>
                    {user.HoTen} (Email: {user.Email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ----- Các trường Hồ sơ Nhân viên ----- */}
          <div className="form-group">
            <label htmlFor="NgayVaoLam">Ngày vào làm</label>
            <input
              type="date"
              id="NgayVaoLam"
              name="NgayVaoLam"
              value={formData.NgayVaoLam}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="MaSoThue">Mã số thuế</label>
            <input
              type="text"
              id="MaSoThue"
              name="MaSoThue"
              value={formData.MaSoThue}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="TrangThai">Trạng Thái</label>
            <select
              id="TrangThai"
              name="TrangThai"
              value={formData.TrangThai}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="Active">Active (Đang làm)</option>
              <option value="Inactive">Inactive (Đã nghỉ)</option>
            </select>
          </div>
          
          {/* ----- THAY BẰNG CHECKBOX VAI TRÒ ----- */}
          <div className="form-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <label>Phân Quyền (Vai trò)</label>
            {allRoles.map(role => (
              <div key={role.MaVaiTro} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`role-emp-${role.MaVaiTro}`}
                  checked={formData.roleIds.includes(role.MaVaiTro)}
                  onChange={() => handleRoleChange(role.MaVaiTro)}
                  disabled={isLoading}
                />
                <label htmlFor={`role-emp-${role.MaVaiTro}`}>
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
              {isLoading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeForm;