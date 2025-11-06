// src/components/ServiceForm.jsx
import React, { useState, useEffect } from 'react';

const ServiceForm = ({ initialData, onSubmit, onClose }) => {
  
  const [formData, setFormData] = useState({
    TenDichVu: '',
    KieuTinh: 'FIXED', // 'FIXED' hoặc 'METERED'
    DonViMacDinh: 'tháng', // 'tháng', 'kWh', 'm³'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ TenDichVu: '', KieuTinh: 'FIXED', DonViMacDinh: 'tháng' });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData); 
    setIsSubmitting(false);
  };

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Cập nhật Dịch vụ' : 'Tạo Dịch vụ Mới'}</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tên Dịch Vụ</label>
            <input type="text" name="TenDichVu" value={formData.TenDichVu} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Kiểu Tính Phí</label>
            <select name="KieuTinh" value={formData.KieuTinh} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required >
              <option value="FIXED">Cố định (FIXED)</option>
              <option value="METERED">Theo đồng hồ (METERED)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Đơn Vị Tính</label>
            <input type="text" name="DonViMacDinh" value={formData.DonViMacDinh} onChange={handleChange}
              placeholder="Ví dụ: tháng, kWh, m³"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded">
              Hủy
            </button>
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

export default ServiceForm;