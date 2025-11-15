// src/components/AppointmentForm.jsx
import React, { useState, useEffect } from 'react';

const AppointmentForm = ({ initialData, allUsers, allApartments, onSubmit, onClose }) => {
  
  const [formData, setFormData] = useState({
    MaNguoiDung: '',
    MaCanHo: '',
    ThoiGian: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        MaNguoiDung: initialData.MaNguoiDung || '',
        MaCanHo: initialData.MaCanHo || '',
        ThoiGian: initialData.ThoiGian || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  const isEditMode = !!initialData?.MaLichHen; // Nếu có mã lịch hẹn thì là mode Sửa (nếu dùng chung)

  // Logic khóa ô input: Nếu initialData đã có giá trị đó -> Disable ô nhập liệu
  const isUserFixed = !!initialData?.MaNguoiDung;
  const isApartmentFixed = !!initialData?.MaCanHo;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000}}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg" style={{backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px'}}>
        <h2 className="text-2xl font-bold mb-4" style={{fontSize: '1.5em', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
            📅 Đặt Lịch Hẹn Xem Nhà
        </h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* --- CHỌN NGƯỜI DÙNG --- */}
          <div className="mb-4" style={{marginBottom: '15px'}}>
            <label className="block text-sm font-medium text-gray-700" style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>
                Người Đặt Lịch
            </label>
            <select 
                name="MaNguoiDung" 
                value={formData.MaNguoiDung} 
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: isUserFixed ? '#f0f0f0' : '#fff'}} 
                required 
                disabled={isUserFixed} // KHÓA NẾU ĐÃ CÓ NGƯỜI DÙNG
            >
              <option value="">-- Chọn người --</option>
              {allUsers.map(user => (
                <option key={user.MaNguoiDung} value={user.MaNguoiDung}>
                    {user.HoTen || user.Email}
                </option>
              ))}
            </select>
            {isUserFixed && <p style={{fontSize: '0.8em', color: '#666', marginTop: '3px'}}>* Tự động chọn tài khoản của bạn</p>}
          </div>
          
          {/* --- CHỌN CĂN HỘ --- */}
           <div className="mb-4" style={{marginBottom: '15px'}}>
            <label className="block text-sm font-medium text-gray-700" style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>
                Căn Hộ Quan Tâm
            </label>
            <select 
                name="MaCanHo" 
                value={formData.MaCanHo} 
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: isApartmentFixed ? '#f0f0f0' : '#fff'}} 
                required 
                disabled={isApartmentFixed} // KHÓA NẾU ĐÃ CÓ CĂN HỘ
            >
              <option value="">-- Chọn căn hộ --</option>
              {allApartments.map(apt => (
                <option key={apt.MaCanHo} value={apt.MaCanHo}>
                    {apt.SoCanHo} (Block: {apt.TenBlock})
                </option>
              ))}
            </select>
             {isApartmentFixed && <p style={{fontSize: '0.8em', color: '#666', marginTop: '3px'}}>* Đang đặt lịch cho căn hộ này</p>}
          </div>

          {/* --- CHỌN THỜI GIAN --- */}
          <div className="mb-4" style={{marginBottom: '15px'}}>
            <label className="block text-sm font-medium text-gray-700" style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>
                Thời Gian Mong Muốn
            </label>
            <input 
                type="datetime-local" 
                name="ThoiGian" 
                value={formData.ThoiGian} 
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}} 
                required 
            />
          </div>

          <div className="flex justify-end gap-3 mt-6" style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
            <button type="button" onClick={onClose} disabled={isSubmitting}
              style={{padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer'}}>
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting}
              style={{padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#3498db', color: '#fff', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1}}>
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Đặt Lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;