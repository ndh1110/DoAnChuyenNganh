import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/'; 

const apartmentTypes = [
  { type: "1 phòng ngủ", area: 51 },
  { type: "2 phòng ngủ", area: 69 },
  { type: "3 phòng ngủ", area: 108 },
  { type: "Penthouse", area: 200 }
];

function ApartmentForm({ 
  isOpen, onClose, onSubmit, isLoading, 
  initialData, 
  fixedMaTang = null, // [MỚI] Nếu truyền cái này, form sẽ tự hiểu là thêm vào tầng này
  initialStatus = 8   // Mặc định là Trống
}) {
  
  const [formData, setFormData] = useState({
    SoCanHo: '',
    LoaiCanHo: '',
    DienTich: '',
    MaTrangThai: initialStatus
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          SoCanHo: initialData.SoCanHo || '',
          LoaiCanHo: initialData.LoaiCanHo || '',
          DienTich: initialData.DienTich || '',
          MaTrangThai: initialData.TrangThai || initialStatus
        });
        if (initialData.HinhAnh) setCurrentImageUrl(API_BASE_URL + initialData.HinhAnh);
      } else {
        // Reset form
        setFormData({ SoCanHo: '', LoaiCanHo: '', DienTich: '', MaTrangThai: initialStatus });
        setCurrentImageUrl(null);
      }
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  }, [isOpen, isEditMode, initialData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Sử dụng FormData để gửi cả file ảnh
    const data = new FormData();
    // Nếu có fixedMaTang, dùng nó. Nếu không (edit), dùng data cũ
    if (fixedMaTang) data.append('MaTang', fixedMaTang); 
    else if (initialData?.MaTang) data.append('MaTang', initialData.MaTang);

    data.append('SoCanHo', formData.SoCanHo);
    data.append('LoaiCanHo', formData.LoaiCanHo);
    data.append('DienTich', formData.DienTich);
    data.append('TrangThai', formData.MaTrangThai);
    if (selectedImage) data.append('HinhAnh', selectedImage);

    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col md:flex-row">
        
        {/* CỘT TRÁI: FORM */}
        <div className="flex-1 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
                {isEditMode ? 'Cập nhật Căn hộ' : 'Thêm Căn hộ Mới'}
            </h3>
            
            <form id="apt-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số Căn Hộ <span className="text-red-500">*</span></label>
                    <input type="text" name="SoCanHo" value={formData.SoCanHo} onChange={handleChange} required placeholder="VD: A101"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Loại Căn</label>
                        <select name="LoaiCanHo" value={formData.LoaiCanHo} onChange={(e) => {
                             const type = e.target.value;
                             const area = apartmentTypes.find(t => t.type === type)?.area || '';
                             setFormData(prev => ({...prev, LoaiCanHo: type, DienTich: area}));
                        }} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            <option value="">-- Chọn --</option>
                            {apartmentTypes.map(t => <option key={t.type} value={t.type}>{t.type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Diện tích (m2)</label>
                        <input type="number" name="DienTich" value={formData.DienTich} onChange={handleChange} 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
            </form>
        </div>

        {/* CỘT PHẢI: ẢNH */}
        <div className="w-full md:w-72 bg-slate-50 p-6 border-l border-slate-100 flex flex-col">
            <label className="block text-sm font-medium text-slate-700 mb-2">Hình ảnh</label>
            <div className="flex-1 border-2 border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center overflow-hidden relative group">
                {previewUrl || currentImageUrl ? (
                    <img src={previewUrl || currentImageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-slate-400 text-sm">Chưa có ảnh</span>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer" title="Chọn ảnh mới" />
            </div>
            <p className="text-xs text-center text-slate-500 mt-2">Click khung trên để chọn ảnh</p>

            <div className="mt-auto flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium">Hủy</button>
                <button type="submit" form="apt-form" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-md">
                    {isLoading ? 'Lưu...' : 'Lưu'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}

export default ApartmentForm;