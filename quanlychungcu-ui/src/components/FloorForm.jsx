import React, { useState, useEffect } from 'react';

function FloorForm({ isOpen, onClose, onSubmit, isLoading, blockName }) {
  const [tenTang, setTenTang] = useState('');

  useEffect(() => {
    if (isOpen) setTenTang('');
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tenTang.trim()) return;
    // Gửi data về: Backend cần { TenTang: "..." }
    onSubmit({ TenTang: tenTang });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 transform transition-all scale-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Thêm Tầng Mới</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">
                Tên Tầng (cho {blockName}) <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={tenTang}
              onChange={(e) => setTenTang(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Ví dụ: Tầng 12A, Tầng Thượng..."
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
              {isLoading ? 'Đang lưu...' : 'Thêm Tầng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FloorForm;