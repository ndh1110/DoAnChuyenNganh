import React, { useState, useEffect } from 'react';

const BlockForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  // Form luôn đầy đủ 3 trường
  const [formData, setFormData] = useState({
    TenBlock: '',
    SoTang: '',
    TongSoCanHo: '' 
  });

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        TenBlock: initialData.TenBlock,
        SoTang: initialData.SoTang,
        // Khi sửa, ta không hiện lại tổng số căn để tránh hiểu nhầm
        // vì sửa số tầng ở đây không kích hoạt lại việc sinh căn hộ
        TongSoCanHo: '' 
      });
    } else {
      // Reset form khi tạo mới
      setFormData({ TenBlock: '', SoTang: '', TongSoCanHo: '' });
    }
  }, [initialData, isOpen, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate logic chia hết chỉ áp dụng khi Tạo mới
    if (!isEditMode) {
       if (!formData.TenBlock || !formData.SoTang || !formData.TongSoCanHo) {
         alert("Vui lòng điền đầy đủ thông tin để hệ thống tạo Tầng và Căn hộ.");
         return;
       }
       const tang = parseInt(formData.SoTang);
       const can = parseInt(formData.TongSoCanHo);
       
       if (tang <= 0 || can <= 0) {
           alert("Số tầng và số căn phải lớn hơn 0.");
           return;
       }

       if (can % tang !== 0) {
         alert(`Lỗi chia đều: ${can} căn không thể chia đều cho ${tang} tầng.\nVui lòng nhập số khác (Ví dụ: ${tang * 10}, ${tang * 8}...)`);
         return;
       }
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
                {isEditMode ? '✏️ Cập nhật thông tin Block' : '🏢 Khởi tạo Block Mới'}
            </h2>
            {!isEditMode && <p className="text-xs text-slate-500 mt-1">Hệ thống sẽ tự động sinh Tầng & Căn hộ</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên Block</label>
            <input
              type="text" name="TenBlock" required
              value={formData.TenBlock} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Ví dụ: Block A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số Tầng</label>
            <input
              type="number" name="SoTang" required min="1"
              value={formData.SoTang} onChange={handleChange}
              disabled={isEditMode} // Không cho sửa số tầng khi edit để tránh lỗi logic
              className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-blue-500 focus:ring-2'}`}
              placeholder="10"
            />
            {isEditMode && <p className="text-xs text-red-400 mt-1">Không thể sửa số tầng sau khi đã tạo.</p>}
          </div>

          {/* CHỈ HIỆN KHI TẠO MỚI */}
          {!isEditMode && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <label className="block text-sm font-bold text-blue-800 mb-1">
                 Tổng số Căn hộ dự kiến
              </label>
              <input
                type="number" name="TongSoCanHo" required min="1"
                value={formData.TongSoCanHo} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                placeholder="Ví dụ: 100 (Sẽ chia 10 căn/tầng)"
              />
              <p className="text-xs text-blue-600 mt-2">
                 *Hệ thống sẽ tự động tạo {formData.SoTang && formData.TongSoCanHo ? Math.floor(formData.TongSoCanHo / formData.SoTang) : '...'} căn hộ cho mỗi tầng.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100">
              Hủy bỏ
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30">
              {isEditMode ? 'Lưu thay đổi' : 'Khởi tạo ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlockForm;