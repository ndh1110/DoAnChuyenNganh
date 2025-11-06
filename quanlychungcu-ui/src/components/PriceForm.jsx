// src/components/PriceForm.jsx
import React, { useState, useEffect } from 'react';

const PriceForm = ({ initialData, services, onSubmit, onClose }) => {
  
  const [formData, setFormData] = useState({
    MaDichVu: '',
    DonGiaBien: '',
    HieuLucTu: new Date().toISOString().split('T')[0],
    HieuLucDen: null, 
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialData) {
        setFormData({
            MaDichVu: initialData.MaDichVu,
            DonGiaBien: initialData.DonGiaBien,
            HieuLucTu: initialData.HieuLucTu ? new Date(initialData.HieuLucTu).toISOString().split('T')[0] : '',
            HieuLucDen: initialData.HieuLucDen ? new Date(initialData.HieuLucDen).toISOString().split('T')[0] : '',
        });
    } else {
      // Reset form
      setFormData({ MaDichVu: '', DonGiaBien: '', HieuLucTu: new Date().toISOString().split('T')[0], HieuLucDen: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value })); // Gửi null nếu rỗng
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
        ...formData,
        MaDichVu: parseInt(formData.MaDichVu),
        DonGiaBien: parseFloat(formData.DonGiaBien),
    }
    await onSubmit(payload); 
    setIsSubmitting(false);
  };

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Cập nhật Giá' : 'Thêm Giá Dịch Vụ Mới'}</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Dịch Vụ</label>
            <select name="MaDichVu" value={formData.MaDichVu} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required >
              <option value="">-- Chọn dịch vụ --</option>
              {services.map(s => (
                <option key={s.MaDichVu} value={s.MaDichVu}>{s.TenDichVu}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Đơn Giá (VND)</label>
            <input type="number" name="DonGiaBien" value={formData.DonGiaBien || ''} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Hiệu lực Từ</label>
            <input type="date" name="HieuLucTu" value={formData.HieuLucTu || ''} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          
           <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Hiệu lực Đến (để trống nếu vô hạn)</label>
            <input type="date" name="HieuLucDen" value={formData.HieuLucDen || ''} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
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

export default PriceForm;