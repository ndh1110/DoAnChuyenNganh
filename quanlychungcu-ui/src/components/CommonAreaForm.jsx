// src/components/CommonAreaForm.jsx
import React, { useState, useEffect } from 'react';

const CommonAreaForm = ({ initialData, allBlocks, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    MaBlock: '',
    Ten: '',
    Loai: 'Tiện ích chung',
    MoTa: '',
    Tang: 0,
    TrangThai: 'Hoạt động',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Nếu là Sửa (initialData), điền form
    if (initialData) {
        setFormData({
            MaBlock: initialData.MaBlock || '',
            Ten: initialData.Ten || '',
            Loai: initialData.Loai || 'Tiện ích chung',
            MoTa: initialData.MoTa || '',
            Tang: initialData.Tang || 0,
            TrangThai: initialData.TrangThai || 'Hoạt động',
        });
    } else {
    // Nếu là Tạo mới, reset
      setFormData({ MaBlock: '', Ten: '', Loai: 'Tiện ích chung', MoTa: '', Tang: 0, TrangThai: 'Hoạt động' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Gửi đi payload (API POST và PUT đều nhận full object)
    await onSubmit({
        ...formData,
        MaBlock: parseInt(formData.MaBlock),
        Tang: formData.Tang ? parseInt(formData.Tang) : 0,
    });
    setIsSubmitting(false);
  };

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Cập nhật Khu Vực' : 'Tạo Khu Vực Mới'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Thuộc Block</label>
            <select name="MaBlock" value={formData.MaBlock} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required>
              <option value="">-- Chọn Block --</option>
              {allBlocks.map(block => (
                <option key={block.MaBlock} value={block.MaBlock}>{block.TenBlock}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tên Khu Vực</label>
            <input type="text" name="Ten" value={formData.Ten} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
           <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Loại</label>
            <input type="text" name="Loai" value={formData.Loai} onChange={handleChange}
              placeholder="Tiện ích chung, Kỹ thuật..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tầng (Để 0 nếu là Sảnh/Hầm)</label>
            <input type="number" name="Tang" value={formData.Tang} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mô Tả</label>
            <textarea name="MoTa" value={formData.MoTa || ''} onChange={handleChange} rows="2"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Trạng Thái</label>
            <select name="TrangThai" value={formData.TrangThai} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required >
              <option value="Hoạt động">Hoạt động</option>
              <option value="Bảo trì">Bảo trì</option>
              <option value="Đóng cửa">Đóng cửa</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded">Hủy</button>
            <button type="submit" disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {isSubmitting ? 'Đang lưu...' : 'Lưu Khu Vực'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommonAreaForm;