// src/components/InspectionForm.jsx
import React, { useState } from 'react';

// Form này chỉ Tạo mới (Create-Only)
const InspectionForm = ({ allCommonAreas, allEmployees, onSubmit, onClose }) => {
  
  const [formData, setFormData] = useState({
    MaKhuVucChung: '',
    MaNhanVien: '',
    DanhGia: 'Đạt',
    GhiChu: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit({
        ...formData,
        MaKhuVucChung: parseInt(formData.MaKhuVucChung),
        MaNhanVien: parseInt(formData.MaNhanVien),
    }); 
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Ghi nhận Kiểm Tra Kỹ Thuật</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Khu Vực Chung</label>
            <select name="MaKhuVucChung" value={formData.MaKhuVucChung} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required>
              <option value="">-- Chọn khu vực đã kiểm tra --</option>
              {allCommonAreas.map(area => (
                <option key={area.MaKhuVucChung} value={area.MaKhuVucChung}>{area.Ten} (Block: {area.TenBlock || area.MaBlock})</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nhân Viên Thực Hiện</label>
            <select name="MaNhanVien" value={formData.MaNhanVien} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required>
              <option value="">-- Chọn nhân viên --</option>
              {allEmployees.map(emp => (
                <option key={emp.MaNhanVien} value={emp.MaNhanVien}>{emp.HoTen}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Đánh Giá</label>
            <select name="DanhGia" value={formData.DanhGia} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required >
              <option value="Đạt">Đạt</option>
              <option value="Không đạt">Không đạt</option>
              <option value="Cần bảo trì">Cần bảo trì</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ghi Chú (Nếu có)</label>
            <textarea name="GhiChu" value={formData.GhiChu} onChange={handleChange} rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded">Hủy</button>
            <button type="submit" disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {isSubmitting ? 'Đang lưu...' : 'Lưu Kết Quả'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InspectionForm;