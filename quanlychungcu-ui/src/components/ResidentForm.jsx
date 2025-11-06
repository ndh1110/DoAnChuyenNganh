// src/components/ResidentForm.jsx
import React, { useState, useEffect } from 'react';

// Đây là "Dumb Component" cho Form
// Nhận 'initialData' (để Sửa) và 2 hàm handler
const ResidentForm = ({ initialData, onSubmit, onClose }) => {
  
  // State nội bộ của Form
  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    SoDienThoai: '',
    MatKhauHash: '', // Chỉ yêu cầu khi Tạo mới
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nếu 'initialData' thay đổi (khi bấm Sửa), cập nhật state của form
  useEffect(() => {
    if (initialData) {
      setFormData({
        HoTen: initialData.HoTen || '',
        Email: initialData.Email || '',
        SoDienThoai: initialData.SoDienThoai || '',
        MatKhauHash: '', // Không bao giờ hiển thị mật khẩu cũ
      });
    } else {
      // Reset form khi Tạo mới
      setFormData({ HoTen: '', Email: '', SoDienThoai: '', MatKhauHash: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Tạo object payload
    const payload = { ...formData };
    
    // Nếu là Sửa và không nhập mật khẩu, thì không gửi trường mật khẩu
    if (initialData && !payload.MatKhauHash) {
      delete payload.MatKhauHash;
    }
    
    // Gọi hàm onSubmit từ 'pages' (handleFormSubmit)
    await onSubmit(payload); 
    
    setIsSubmitting(false);
  };

  // Xác định xem đây là form Tạo mới hay Cập nhật
  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">
          {isEditMode ? 'Cập nhật Cư dân' : 'Tạo Cư dân Mới'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Họ Tên</label>
            <input
              type="text"
              name="HoTen"
              value={formData.HoTen}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Số Điện Thoại</label>
            <input
              type="tel"
              name="SoDienThoai"
              value={formData.SoDienThoai}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu {isEditMode ? '(Để trống nếu không đổi)' : ''}
            </label>
            <input
              type="password"
              name="MatKhauHash"
              value={formData.MatKhauHash}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required={!isEditMode} // Mật khẩu là bắt buộc khi Tạo mới
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidentForm;