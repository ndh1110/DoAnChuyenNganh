import React, { useState, useEffect } from 'react';

const isValidCCCD = (cccd) => /^(\d{9}|\d{12})$/.test(cccd);

const ResidentForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    HoTen: '', Email: '', SoDienThoai: '', CCCD: '', MatKhauHash: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        HoTen: initialData.HoTen || '',
        Email: initialData.Email || '',
        SoDienThoai: initialData.SoDienThoai || '',
        CCCD: initialData.CCCD || '',
        MatKhauHash: ''
      });
    } else {
      setFormData({ HoTen: '', Email: '', SoDienThoai: '', CCCD: '', MatKhauHash: '' });
    }
  }, [initialData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.CCCD && !isValidCCCD(formData.CCCD)) {
        alert("CCCD không hợp lệ (9 hoặc 12 số)."); return;
    }
    setIsSubmitting(true);
    const payload = { ...formData };
    if (isEditMode && !payload.MatKhauHash) delete payload.MatKhauHash;
    if (payload.CCCD === '') payload.CCCD = null;
    await onSubmit(payload);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">{isEditMode ? 'Cập nhật Cư dân' : 'Thêm Cư dân Mới'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và Tên <span className="text-red-500">*</span></label>
            <input type="text" name="HoTen" value={formData.HoTen} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" name="Email" value={formData.Email} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số Điện Thoại</label>
                <input type="tel" name="SoDienThoai" value={formData.SoDienThoai} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CCCD/CMND</label>
            <input type="text" name="CCCD" value={formData.CCCD} onChange={handleChange} placeholder="9 hoặc 12 số" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu {isEditMode && <span className="text-xs font-normal text-slate-500">(Để trống nếu không đổi)</span>}</label>
            <input type="password" name="MatKhauHash" value={formData.MatKhauHash} onChange={handleChange} required={!isEditMode} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 mt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-md transition-all">
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidentForm;