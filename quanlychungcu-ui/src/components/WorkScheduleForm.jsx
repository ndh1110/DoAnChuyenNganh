// src/components/WorkScheduleForm.jsx
import React, { useState, useEffect } from 'react';

const WorkScheduleForm = ({ initialData, allEmployees, onSubmit, onClose }) => {
  
  const [formData, setFormData] = useState({
    MaNhanVien: '',
    Ngay: new Date().toISOString().split('T')[0],
    Ca: 'Sáng',
    GhiChu: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        MaNhanVien: initialData.MaNhanVien,
        Ngay: new Date(initialData.Ngay).toISOString().split('T')[0],
        Ca: initialData.Ca,
        GhiChu: initialData.GhiChu || '',
      });
    } else {
      // Reset form
      setFormData({ MaNhanVien: '', Ngay: new Date().toISOString().split('T')[0], Ca: 'Sáng', GhiChu: '' });
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
        MaNhanVien: parseInt(formData.MaNhanVien)
    }); 
    setIsSubmitting(false);
  };

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Cập nhật Lịch trực' : 'Thêm Lịch trực Mới'}</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nhân Viên</label>
            <select name="MaNhanVien" value={formData.MaNhanVien} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required >
              <option value="">-- Chọn nhân viên --</option>
              {/* 'allEmployees' được truyền từ 'EmployeesPage' */}
              {allEmployees.map(emp => (
                <option key={emp.MaNhanVien} value={emp.MaNhanVien}>{emp.HoTen}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ngày Trực</label>
            <input type="date" name="Ngay" value={formData.Ngay} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ca Trực</label>
            <select name="Ca" value={formData.Ca} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required >
              <option value="Sáng">Sáng</option>
              <option value="Chiều">Chiều</option>
              <option value="Tối">Tối</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ghi Chú</label>
            <input type="text" name="GhiChu" value={formData.GhiChu} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
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

export default WorkScheduleForm;