// src/components/RequestForm.jsx
import React, { useState, useEffect } from 'react';

// (Giả định chúng ta sẽ truyền 'users' và 'apartments' vào để chọn)
const RequestForm = ({ initialData, users, apartments, onSubmit, onClose }) => {
  
  const [formData, setFormData] = useState({
    MaNguoiDung: '',
    MaCanHo: '',
    Loai: 'Sửa chữa',
    MoTa: '', // Cần thêm cột MoTa vào CSDL của YeuCau
    TrangThaiThanhChung: 'OPEN',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        MaNguoiDung: initialData.MaNguoiDung,
        MaCanHo: initialData.MaCanHo,
        Loai: initialData.Loai || 'Sửa chữa',
        MoTa: initialData.MoTa || '',
        TrangThaiThanhChung: initialData.TrangThaiThanhChung || 'OPEN',
      });
    } else {
      // Reset form
      setFormData({ MaNguoiDung: '', MaCanHo: '', Loai: 'Sửa chữa', MoTa: '', TrangThaiThanhChung: 'OPEN' });
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
        MaNguoiDung: parseInt(formData.MaNguoiDung),
        MaCanHo: parseInt(formData.MaCanHo),
    }); 
    setIsSubmitting(false);
  };

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Cập nhật Yêu cầu' : 'Tạo Yêu cầu Mới'}</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Người Gửi (Cư dân)</label>
            <select name="MaNguoiDung" value={formData.MaNguoiDung} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required >
              <option value="">-- Chọn người gửi --</option>
              {users.map(user => (
                <option key={user.MaNguoiDung} value={user.MaNguoiDung}>{user.HoTen}</option>
              ))}
            </select>
          </div>
          
           <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Căn Hộ Ảnh Hưởng</label>
            <select name="MaCanHo" value={formData.MaCanHo} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required >
              <option value="">-- Chọn căn hộ --</option>
              {apartments.map(apt => (
                <option key={apt.MaCanHo} value={apt.MaCanHo}>{apt.SoCanHo} (Block: {apt.TenBlock || apt.MaBlock})</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Loại Yêu Cầu</label>
            <input type="text" name="Loai" value={formData.Loai} onChange={handleChange}
              placeholder="Ví dụ: Sửa điện, Dột nước, Khiếu nại..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mô Tả Chi Tiết</label>
            <textarea name="MoTa" value={formData.MoTa} onChange={handleChange} rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Trạng Thái</label>
            <select name="TrangThaiThanhChung" value={formData.TrangThaiThanhChung} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required >
              <option value="OPEN">Mới (OPEN)</option>
              <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
              <option value="RESOLVED">Đã xử lý (RESOLVED)</option>
              <option value="CANCELED">Đã hủy (CANCELED)</option>
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

export default RequestForm;