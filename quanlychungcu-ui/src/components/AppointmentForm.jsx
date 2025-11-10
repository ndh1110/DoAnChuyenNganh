// src/components/AppointmentForm.jsx
import React, { useState } from 'react';

/**
 * Form "Dumb Component" để Đặt Lịch Hẹn Tham Quan.
 * Nhận 'allUsers' và 'allApartments'
 */
const AppointmentForm = ({ allUsers, allApartments, onSubmit, onClose }) => {
  
  const [formData, setFormData] = useState({
    // Bước 1 (Tạo YeuCau): MaNguoiDung (Khách), MaCanHo (Muốn xem)
    MaNguoiDung: '', // Người đặt (Khách hàng)
    MaCanHo: '',     // Căn hộ muốn xem
    
    // Bước 2 (Tạo LichHen): ThoiGian
    ThoiGian: new Date().toISOString().slice(0, 16), // Mặc định 'datetime-local'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Gửi formData (MaNguoiDung, MaCanHo, ThoiGian) lên Page
    await onSubmit({ 
        ...formData,
        MaNguoiDung: parseInt(formData.MaNguoiDung),
        MaCanHo: parseInt(formData.MaCanHo),
        ThoiGian: new Date(formData.ThoiGian).toISOString(),
    }); 
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Đặt Lịch Hẹn Tham Quan</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Người Đặt Lịch (Khách hàng)</label>
            <select name="MaNguoiDung" value={formData.MaNguoiDung} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required>
              <option value="">-- Chọn tài khoản của bạn --</option>
              {/* Lọc chỉ hiển thị Cư dân/Khách, ẩn Admin/Nhân viên (nếu cần) */}
              {allUsers.map(user => (
                <option key={user.MaNguoiDung} value={user.MaNguoiDung}>{user.HoTen}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Căn Hộ Muốn Tham Quan</label>
            <select name="MaCanHo" value={formData.MaCanHo} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required>
              <option value="">-- Chọn căn hộ --</option>
              {allApartments.map(apt => (
                <option key={apt.MaCanHo} value={apt.MaCanHo}>{apt.SoCanHo} (Block: {apt.TenBlock || apt.MaBlock})</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Thời Gian Hẹn</label>
            <input type="datetime-local" name="ThoiGian" value={formData.ThoiGian} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded">Hủy</button>
            <button type="submit" disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {isSubmitting ? 'Đang gửi...' : 'Xác Nhận Đặt Lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;