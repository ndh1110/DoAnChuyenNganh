import React, { useState } from 'react';

const FloorForm = ({ isOpen, onClose, onSubmit, blockName }) => {
  const [quantity, setQuantity] = useState(1); // Mặc định là 1 tầng

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(quantity); // Gửi con số ra ngoài
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Thêm Tầng Mới</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bạn muốn thêm bao nhiêu tầng vào <b>{blockName}</b>?
          </label>
          
          <div className="flex items-center gap-3">
             <input
                type="number" 
                min="1" 
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-lg"
                autoFocus
              />
              <span className="text-slate-500 font-medium">Tầng</span>
          </div>
          
          <p className="text-xs text-slate-500 mt-3 bg-blue-50 p-2 rounded border border-blue-100">
             ℹ️ Hệ thống sẽ tự động đánh số tiếp theo tầng cao nhất hiện có.
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">
               + Thêm Ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FloorForm;