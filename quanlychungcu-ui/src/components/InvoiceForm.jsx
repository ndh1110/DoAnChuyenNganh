import React, { useState, useEffect } from 'react';

// Form "Dumb Component" cho việc Tạo Hóa đơn
const InvoiceForm = ({ 
  isFormOpen, onClose, onSubmit, isLoading, 
  allApartments // <-- NHẬN PROP TỪ CHA
}) => {
  
  const [formData, setFormData] = useState({
    MaCanHo: '',
    KyThang: '', // Sẽ là YYYY-MM-01
    NgayPhatHanh: '',
    NgayDenHan: '',
  });

  // 1. Đồng bộ props hoặc Reset
  useEffect(() => {
    if (isFormOpen) {
      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = today.substring(0, 8) + '01'; 

      setFormData({
        MaCanHo: '',
        KyThang: firstDayOfMonth,
        NgayPhatHanh: today,
        NgayDenHan: '',
      });
    }
  }, [isFormOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleKyThangChange = (e) => {
     const selectedDate = e.target.value;
     if (selectedDate) {
       const firstDay = selectedDate.substring(0, 8) + '01';
       setFormData(prev => ({ ...prev, KyThang: firstDay }));
     } else {
       setFormData(prev => ({ ...prev, KyThang: '' }));
     }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || !formData.MaCanHo || !formData.KyThang) {
      alert("Vui lòng chọn Căn Hộ và Kỳ Hóa Đơn.");
      return;
    }
    
    await onSubmit({ 
        ...formData,
        MaCanHo: parseInt(formData.MaCanHo),
        NgayPhatHanh: formData.NgayPhatHanh || null,
        NgayDenHan: formData.NgayDenHan || null,
    }); 
  };
  
  // (Đã xóa isSubmitting vì cha (Page) đã quản lý 'isLoading')

  if (!isFormOpen) return null;

  return (
    // (Thay thế CSS inline bằng className)
    <div className="modal-overlay"> 
      <div className="modal-content large">
        <h2 className="text-2xl font-bold mb-4">Lập Hóa Đơn Mới</h2>
        <form onSubmit={handleSubmit}>
          
          {/* --- SỬA Ở ĐÂY: Thay Input bằng Select --- */}
          <div className="form-group">
            <label htmlFor="MaCanHo">Căn Hộ (*)</label>
            <select
              id="MaCanHo"
              name="MaCanHo"
              value={formData.MaCanHo}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="">-- Chọn Căn Hộ --</option>
              {allApartments.map(apt => (
                <option key={apt.MaCanHo} value={apt.MaCanHo}>
                  {apt.SoCanHo} (Block: {apt.TenBlock})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="KyThang">Kỳ Hóa Đơn (Chọn 1 ngày bất kỳ) (*)</label>
            <input type="date" name="KyThang" value={formData.KyThang} onChange={handleKyThangChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            <small>Hệ thống sẽ tự động lưu là ngày 1 của tháng bạn chọn.</small>
          </div>

          <div className="form-group">
            <label htmlFor="NgayPhatHanh">Ngày Phát Hành</label>
            <input type="date" name="NgayPhatHanh" value={formData.NgayPhatHanh} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>

          <div className="form-group">
            <label htmlFor="NgayDenHan">Ngày Đến Hạn</label>
            <input type="date" name="NgayDenHan" value={formData.NgayDenHan} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={isLoading}
              className="btn-submit">
              {isLoading ? 'Đang lưu...' : 'Lập Hóa Đơn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;