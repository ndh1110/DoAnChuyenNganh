import React, { useState, useEffect } from 'react';

// Component BlockForm (Đã khôi phục logic Setup + UI Tailwind)
const BlockForm = ({ isOpen, onClose, onSubmit, initialData, mode = 'crud' }) => {
  // State chứa cả trường Setup
  const [formData, setFormData] = useState({
    TenBlock: '',
    SoTang: '',
    TongSoCanHo: '' // Dành cho Setup Mode
  });

  const isSetupMode = mode === 'setup';
  const isEditMode = !isSetupMode && Boolean(initialData);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        TenBlock: initialData.TenBlock,
        SoTang: initialData.SoTang,
        TongSoCanHo: ''
      });
    } else {
      // Reset form cho Create hoặc Setup
      setFormData({ TenBlock: '', SoTang: '', TongSoCanHo: '' });
    }
  }, [initialData, isOpen, mode, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic cũ của bạn
    if (isSetupMode) {
       if (!formData.TenBlock || !formData.SoTang || !formData.TongSoCanHo) {
         alert("Vui lòng điền đầy đủ thông tin.");
         return;
       }
       if (parseInt(formData.TongSoCanHo) % parseInt(formData.SoTang) !== 0) {
         alert("Lỗi: Tổng số căn hộ phải chia hết cho số tầng.");
         return;
       }
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  // Xác định tiêu đề động
  let title = '✨ Thêm Block Mới';
  let btnText = 'Tạo mới';
  if (isSetupMode) {
      title = '⚙️ Cấu hình Block Nâng cao';
      btnText = 'Bắt đầu Setup';
  } else if (isEditMode) {
      title = '✏️ Cập nhật Block';
      btnText = 'Lưu thay đổi';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            {isSetupMode && <p className="text-xs text-slate-500 mt-1">Tự động tạo Tầng & Căn hộ</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên Block {isSetupMode && <span className="text-xs font-normal text-slate-500">(Ví dụ: 'Block A')</span>}
            </label>
            <input
              type="text" name="TenBlock" required
              value={formData.TenBlock} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Block A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isSetupMode ? 'Tổng số Tầng' : 'Số Tầng'}
            </label>
            <input
              type="number" name="SoTang" required min="1"
              value={formData.SoTang} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="10"
            />
          </div>

          {/* TRƯỜNG ĐẶC BIỆT CHO SETUP MODE */}
          {isSetupMode && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <label className="block text-sm font-bold text-blue-800 mb-1">
                 Tổng số Căn hộ (Toàn Block)
              </label>
              <input
                type="number" name="TongSoCanHo" required min="1"
                value={formData.TongSoCanHo} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
                placeholder="100"
              />
              <p className="text-xs text-blue-600 mt-2">
                 *Hệ thống sẽ chia đều số căn hộ cho mỗi tầng.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors">
              Hủy bỏ
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
              {btnText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlockForm;