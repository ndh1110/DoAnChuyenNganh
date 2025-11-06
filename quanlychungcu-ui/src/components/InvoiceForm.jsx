// src/components/InvoiceForm.jsx
import React, { useState } from 'react';

// Form "Dumb Component" cho việc Tạo Hóa đơn
const InvoiceForm = ({ onSubmit, onClose }) => {
  
  const [formData, setFormData] = useState({
    MaCanHo: '',
    KyThang: '', // Sẽ là YYYY-MM
    NgayPhatHanh: new Date().toISOString().split('T')[0], // Mặc định hôm nay
    NgayDenHan: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Chuyển đổi KyThang (YYYY-MM) sang ngày đầu tiên của tháng
    const kyThangDate = `${formData.KyThang}-01`;
    
    await onSubmit({ 
        ...formData,
        MaCanHo: parseInt(formData.MaCanHo), // Đảm bảo là số
        KyThang: kyThangDate 
    }); 
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Lập Hóa Đơn Mới</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mã Căn Hộ (MaCanHo)</label>
            <input type="number" name="MaCanHo" value={formData.MaCanHo} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Kỳ Hóa Đơn (Chọn tháng/năm)</label>
            <input type="month" name="KyThang" value={formData.KyThang} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ngày Phát Hành</label>
            <input type="date" name="NgayPhatHanh" value={formData.NgayPhatHanh} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ngày Đến Hạn</label>
            <input type="date" name="NgayDenHan" value={formData.NgayDenHan} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded">
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {isSubmitting ? 'Đang lưu...' : 'Lập Hóa Đơn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;