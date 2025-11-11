// src/components/IncidentForm.jsx
import React, { useState, useEffect } from 'react';

const IncidentForm = ({ initialData, allCommonAreas, allEmployees, onSubmit, onClose }) => {
  
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    MaKhuVucChung: '',
    MucDo: 'Trung bình',
    MoTa: '',
    MaNhanVienXuLy: null,
    TrangThai: 'Mới',
    ThoiGianXuLy: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        MaKhuVucChung: initialData.MaKhuVucChung,
        MucDo: initialData.MucDo,
        MoTa: initialData.MoTa,
        MaNhanVienXuLy: initialData.MaNhanVienXuLy || null,
        TrangThai: initialData.TrangThai || 'Mới',
        // Định dạng datetime-local
        ThoiGianXuLy: initialData.ThoiGianXuLy ? new Date(initialData.ThoiGianXuLy).toISOString().slice(0, 16) : null,
      });
    } else {
      setFormData({ MaKhuVucChung: '', MucDo: 'Trung bình', MoTa: '', MaNhanVienXuLy: null, TrangThai: 'Mới', ThoiGianXuLy: null });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let payload;
    if (isEditMode) {
      // API Sửa (PUT /api/suco/:id) chỉ nhận 3 trường
      payload = {
        MaNhanVienXuLy: formData.MaNhanVienXuLy ? parseInt(formData.MaNhanVienXuLy) : null,
        TrangThai: formData.TrangThai,
        ThoiGianXuLy: formData.ThoiGianXuLy ? new Date(formData.ThoiGianXuLy).toISOString() : null,
      };
    } else {
      // API Tạo (POST /api/suco) nhận 3-4 trường
      payload = {
        MaKhuVucChung: parseInt(formData.MaKhuVucChung),
        MucDo: formData.MucDo,
        MoTa: formData.MoTa,
        TrangThai: formData.TrangThai,
      };
    }
    
    await onSubmit(payload); 
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Cập nhật Sự cố' : 'Báo Sự cố Mới'}</h2>
        <form onSubmit={handleSubmit}>
          
          {/* Các trường CHỈ dành cho Tạo mới (Create) */}
          {!isEditMode && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Khu Vực Chung</label>
                <select name="MaKhuVucChung" value={formData.MaKhuVucChung} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                  required={!isEditMode}
                >
                  <option value="">-- Chọn khu vực --</option>
                  {allCommonAreas.map(area => (
                    <option key={area.MaKhuVucChung} value={area.MaKhuVucChung}>{area.Ten} (Block: {area.TenBlock || area.MaBlock})</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Mô Tả Sự Cố</label>
                <textarea name="MoTa" value={formData.MoTa} onChange={handleChange} rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={!isEditMode} />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Mức Độ</label>
                <select name="MucDo" value={formData.MucDo} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                  required={!isEditMode} >
                  <option value="Thấp">Thấp</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Cao">Cao</option>
                  <option value="Khẩn cấp">Khẩn cấp</option>
                </select>
              </div>
            </>
          )}

          {/* Các trường CHỈ dành cho Sửa (Update) */}
          {isEditMode && (
            <>
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <p><strong>Khu vực:</strong> {initialData.TenKhuVuc}</p>
                <p><strong>Mô tả:</strong> {initialData.MoTa}</p>
              </div>
              <hr className="my-4" />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Gán Nhân Viên Xử Lý</label>
                <select name="MaNhanVienXuLy" value={formData.MaNhanVienXuLy || ''} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">-- Bỏ gán --</option>
                  {allEmployees.map(emp => (
                    <option key={emp.MaNhanVien} value={emp.MaNhanVien}>{emp.HoTen} ({emp.ChucVu})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Trạng Thái Xử Lý</label>
                <select name="TrangThai" value={formData.TrangThai} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required >
                  <option value="Mới">Mới</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Hủy">Hủy</option>
                </select>
              </div>
               <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Thời Gian Hoàn Thành (Nếu có)</label>
                <input type="datetime-local" name="ThoiGianXuLy" value={formData.ThoiGianXuLy || ''} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded">Hủy</button>
            <button type="submit" disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentForm;