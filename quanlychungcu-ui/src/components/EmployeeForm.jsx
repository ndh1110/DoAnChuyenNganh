// src/components/EmployeeForm.jsx
import React, { useState, useEffect } from 'react';

const EmployeeForm = ({ initialData, allUsers, onSubmit, onClose }) => {
  
  const [formData, setFormData] = useState({
    MaNguoiDung: '',
    ChucVu: 'Kỹ thuật',
    TrangThai: 'Active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        MaNguoiDung: initialData.MaNguoiDung,
        ChucVu: initialData.ChucVu || 'Kỹ thuật',
        TrangThai: initialData.TrangThai || 'Active',
      });
    } else {
      // Reset form
      setFormData({ MaNguoiDung: '', ChucVu: 'Kỹ thuật', TrangThai: 'Active' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit({
        ...formData,
        MaNguoiDung: parseInt(formData.MaNguoiDung)
    }); 
    setIsSubmitting(false);
  };

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Cập nhật Nhân viên' : 'Thêm Nhân viên Mới'}</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Người dùng (Cư dân)</label>
            <select name="MaNguoiDung" value={formData.MaNguoiDung} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
              required 
              disabled={isEditMode} // Không cho đổi người dùng khi đang sửa
            >
              <option value="">-- Chọn người dùng để gán --</option>
              {/* 'allUsers' được truyền từ 'EmployeesPage' */}
              {allUsers.map(user => (
                <option key={user.MaNguoiDung} value={user.MaNguoiDung}>
                  {user.HoTen} (Email: {user.Email})
                </option>
              ))}
            </select>
            {isEditMode && <p className="text-xs text-gray-500 mt-1">Không thể thay đổi Người dùng sau khi đã gán.</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Chức Vụ</label>
            <input type="text" name="ChucVu" value={formData.ChucVu} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Trạng Thái</label>
            <select name="TrangThai" value={formData.TrangThai} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded">Hủy</button>
            <button type="submit" disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;