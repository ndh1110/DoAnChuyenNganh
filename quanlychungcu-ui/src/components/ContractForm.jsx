// src/components/ContractForm.jsx
import React, { useState, useEffect } from 'react';

// Hàm kiểm tra CCCD (Cơ bản)
const isValidCCCD = (cccd) => {
  if (!cccd) return false;
  if (!/^\d{12}$/.test(cccd)) return false;
  return true;
};

function ContractForm({ 
  isOpen, onClose, onSubmit, isLoading, 
  initialData, 
  allResidents, 
  hydratedApartments 
}) {
  
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    SoHopDong: '',
    MaCanHo: '',
    BenA_Id: '', 
    BenB_Id: '', // Khách hàng (Bên Mua/Thuê)
    Loai: 'Mua/Bán',
    GiaTriHopDong: '',
    SoTienCoc: '',
    NgayKy: '',
    NgayHetHan: '',
    CCCD: '' 
  });

  // State quản lý điều khoản (chỉ dùng khi tạo mới)
  const [terms, setTerms] = useState([]); 
  const [currentTerm, setCurrentTerm] = useState('');
  
  // State quản lý trạng thái khóa ô CCCD
  const [isCCCDDisabled, setIsCCCDDisabled] = useState(false);
  
  const isEditMode = Boolean(initialData);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try { return new Date(dateString).toISOString().split('T')[0]; } catch (e) { return ''; }
  };

  // 1. Tự động sinh Số Hợp Đồng (Chỉ khi Tạo mới)
  useEffect(() => {
      if (!isEditMode && formData.MaCanHo && formData.Loai) {
          const apt = hydratedApartments.find(a => a.MaCanHo == formData.MaCanHo);
          const typeCode = formData.Loai === 'Mua/Bán' ? 'MB' : 'TH';
          const year = new Date().getFullYear();
          // VD: HĐMB/2025/A101
          const autoCode = `HĐ${typeCode}/${year}/${apt?.SoCanHo || 'XX'}`;
          setFormData(prev => ({...prev, SoHopDong: autoCode}));
      }
  }, [formData.MaCanHo, formData.Loai, hydratedApartments, isEditMode]);

  // 2. Load dữ liệu (Khi Sửa hoặc Reset khi Tạo)
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        // --- CHẾ ĐỘ SỬA: Load dữ liệu cũ ---
        const benBId = initialData.BenB_Id || initialData.ChuHoId; // Hỗ trợ cả tên biến cũ/mới
        const resident = allResidents.find(r => String(r.MaNguoiDung) === String(benBId));
        
        setFormData({
          SoHopDong: initialData.SoHopDong || '',
          MaCanHo: initialData.MaCanHo,
          BenA_Id: initialData.BenA_Id || '',
          BenB_Id: benBId,
          Loai: initialData.Loai,
          GiaTriHopDong: initialData.GiaTriHopDong || '',
          SoTienCoc: initialData.SoTienCoc || '',
          NgayKy: formatDateForInput(initialData.NgayKy),
          NgayHetHan: formatDateForInput(initialData.NgayHetHan),
          CCCD: resident ? resident.CCCD : ''
        });
        
        // Khi sửa: Khóa CCCD nếu đã có
        setIsCCCDDisabled(!!(resident && resident.CCCD));
        setTerms([]); // Không load điều khoản vào form sửa nhanh
      } else {
        // --- CHẾ ĐỘ TẠO MỚI: Reset form ---
        setFormData({
            SoHopDong: '', MaCanHo: '', BenA_Id: '', BenB_Id: '', 
            Loai: 'Mua/Bán', GiaTriHopDong: '', SoTienCoc: '', 
            NgayKy: '', NgayHetHan: '', CCCD: ''
        });
        // Gợi ý điều khoản mẫu
        setTerms([
            "Bên B cam kết thanh toán đúng thời hạn quy định.",
            "Tuân thủ nghiêm ngặt nội quy quản lý vận hành chung cư.",
            "Không được tự ý cải tạo căn hộ khi chưa có sự đồng ý bằng văn bản."
        ]);
        setIsCCCDDisabled(false);
      }
    }
  }, [initialData, isEditMode, isOpen, allResidents]);

  // --- Handlers Điều khoản ---
  const handleAddTermUI = () => {
      if (currentTerm.trim()) { setTerms([...terms, currentTerm.trim()]); setCurrentTerm(''); }
  };
  const handleRemoveTermUI = (idx) => {
      const newTerms = [...terms]; newTerms.splice(idx, 1); setTerms(newTerms);
  };

  // --- Handlers Form ---
  const handleBenBChange = (e) => {
    const selectedId = e.target.value;
    const resident = allResidents.find(r => String(r.MaNguoiDung) === String(selectedId));
    setFormData(prev => ({ ...prev, BenB_Id: selectedId, CCCD: resident?.CCCD || '' }));
    setIsCCCDDisabled(!!resident?.CCCD); 
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation
    if (!formData.BenB_Id || !formData.MaCanHo) { alert("Vui lòng chọn Căn Hộ và Khách Hàng."); return; }
    if (!formData.CCCD) { alert("Vui lòng nhập CCCD."); return; }
    if (!isValidCCCD(formData.CCCD)) { alert("CCCD không hợp lệ (Phải là 12 chữ số)."); return; }

    // Chuẩn bị dữ liệu gửi đi
    // Map lại tên biến BenB_Id -> ChuHoId để khớp với Controller backend hiện tại
    const submitData = {
        ...formData,
        ChuHoId: formData.BenB_Id, 
        DieuKhoans: terms // Gửi kèm mảng điều khoản
    };

    onSubmit(submitData, !isCCCDDisabled);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large" style={{width: '950px', maxHeight: '90vh', overflowY: 'auto'}}>
        <button onClick={onClose} className="modal-close-btn" disabled={isLoading}>&times;</button>
        <h2>{isEditMode ? 'Cập nhật Hợp đồng' : 'Tạo Hợp đồng Mới'}</h2>
        
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* --- CỘT TRÁI: THÔNG TIN ĐỊNH DANH --- */}
                <div>
                    <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'8px', marginBottom:'15px', color:'#2c3e50', fontWeight:'bold'}}>
                        1. Thông tin Định danh
                    </h3>
                    
                    {/* Căn Hộ & Loại Hợp Đồng */}
                    <div className="flex gap-3 mb-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Căn Hộ (*)</label>
                            <select name="MaCanHo" value={formData.MaCanHo} onChange={handleChange} 
                                    required disabled={isEditMode} 
                                    className="w-full p-2 border border-gray-300 rounded bg-white disabled:bg-gray-100">
                                <option value="">-- Chọn --</option>
                                {hydratedApartments.map(apt => (
                                    <option key={apt.MaCanHo} value={apt.MaCanHo}>{apt.SoCanHo} ({apt.TenBlock})</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-1/2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Loại HĐ</label>
                             <select name="Loai" value={formData.Loai} onChange={handleChange} 
                                     disabled={isEditMode}
                                     className="w-full p-2 border border-gray-300 rounded bg-white disabled:bg-gray-100">
                                <option value="Mua/Bán">Mua Bán (CĐT)</option>
                                <option value="Cho Thuê">Cho Thuê</option>
                             </select>
                        </div>
                    </div>

                    {/* Số Hợp Đồng */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số Hợp Đồng (*)</label>
                        <input type="text" name="SoHopDong" value={formData.SoHopDong} onChange={handleChange} 
                               required disabled={isEditMode} 
                               className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100" />
                    </div>

                    {/* Bên A */}
                    {formData.Loai === 'Cho Thuê' ? (
                         <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-100">
                            <label className="block text-sm font-medium text-blue-800 mb-1">Bên A (Chủ Nhà) (*)</label>
                            <select name="BenA_Id" value={formData.BenA_Id} onChange={handleChange} 
                                    required disabled={isEditMode}
                                    className="w-full p-2 border border-blue-300 rounded bg-white disabled:bg-gray-100">
                                <option value="">-- Chọn Chủ Nhà --</option>
                                {allResidents.map(res => (
                                    <option key={res.MaNguoiDung} value={res.MaNguoiDung}>{res.HoTen} - {res.Email}</option>
                                ))}
                            </select>
                         </div>
                    ) : (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bên A (Bên Bán)</label>
                            <input type="text" value="CHỦ ĐẦU TƯ (CÔNG TY)" disabled 
                                   className="w-full p-2 border border-gray-300 rounded bg-gray-100 font-bold text-gray-600" />
                        </div>
                    )}

                    {/* Bên B */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bên B ({formData.Loai === 'Mua/Bán' ? 'Khách Mua' : 'Khách Thuê'}) (*)
                        </label>
                        <select name="BenB_Id" value={formData.BenB_Id} onChange={handleBenBChange} 
                                required disabled={isEditMode}
                                className="w-full p-2 border border-gray-300 rounded bg-white disabled:bg-gray-100">
                            <option value="">-- Chọn Khách Hàng --</option>
                            {allResidents.map(res => (
                                <option key={res.MaNguoiDung} value={res.MaNguoiDung}>{res.HoTen} - {res.Email}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">CCCD Bên B (*)</label>
                        <input type="text" name="CCCD" value={formData.CCCD} onChange={handleChange} 
                               disabled={isCCCDDisabled || isEditMode} required 
                               className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100" placeholder="12 số..." />
                    </div>
                </div>

                {/* --- CỘT PHẢI: TÀI CHÍNH & THỜI GIAN --- */}
                <div>
                    <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'8px', marginBottom:'15px', color:'#2c3e50', fontWeight:'bold'}}>
                        2. Tài chính & Thời hạn
                    </h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá Trị Hợp Đồng (VNĐ)</label>
                        <input 
                            type="number" name="GiaTriHopDong" value={formData.GiaTriHopDong} onChange={handleChange} 
                            placeholder="0"
                            disabled={isEditMode} // <--- KHÓA KHI SỬA
                            className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100" 
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số Tiền Cọc (VNĐ)</label>
                        <input 
                            type="number" name="SoTienCoc" value={formData.SoTienCoc} onChange={handleChange} 
                            placeholder="0"
                            disabled={isEditMode} // <--- KHÓA KHI SỬA
                            className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100" 
                        />
                    </div>

                    <div className="flex gap-3 mb-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Ký</label>
                            <input type="date" name="NgayKy" value={formData.NgayKy} onChange={handleChange} 
                                   disabled={isEditMode} // <--- KHÓA KHI SỬA
                                   className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100" />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Hết Hạn</label>
                            {/* Ngày Hết Hạn vẫn MỞ để gia hạn */}
                            <input type="date" name="NgayHetHan" value={formData.NgayHetHan} onChange={handleChange} 
                                   disabled={isLoading}
                                   className="w-full p-2 border border-gray-300 rounded" />
                        </div>
                    </div>

                    {/* --- THÔNG BÁO KHI Ở CHẾ ĐỘ SỬA --- */}
                    {isEditMode ? (
                         <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                             <strong>⚠️ Chế độ Chỉnh sửa hạn chế:</strong>
                             <ul className="list-disc list-inside mt-2 space-y-1">
                                 <li>Các thông tin về <strong>Tiền, Căn hộ, và Các bên tham gia</strong> đã được khóa để đảm bảo tính pháp lý.</li>
                                 <li>Bạn chỉ có thể gia hạn hợp đồng bằng cách sửa <strong>Ngày Hết Hạn</strong>.</li>
                                 <li>Để sửa điều khoản chi tiết, vui lòng dùng chức năng <strong>"Xem"</strong> ngoài danh sách.</li>
                             </ul>
                         </div>
                    ) : (
                        // --- FORM ĐIỀU KHOẢN (Chỉ hiện khi Tạo Mới) ---
                         <div className="mt-6 border border-gray-200 p-4 rounded bg-gray-50">
                            <label className="block font-bold text-gray-700 mb-2">Soạn thảo Điều khoản kèm theo:</label>
                            
                            <div className="flex gap-2 mb-3">
                                <input type="text" value={currentTerm} onChange={(e)=>setCurrentTerm(e.target.value)} 
                                       placeholder="Nhập nội dung điều khoản..." 
                                       className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTermUI())}
                                />
                                <button type="button" onClick={handleAddTermUI} 
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold">
                                    +
                                </button>
                            </div>

                            <ul className="max-h-48 overflow-y-auto bg-white border border-gray-200 rounded list-none p-0">
                                {terms.map((t, idx) => (
                                    <li key={idx} className="p-2 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50">
                                        <span className="text-sm text-gray-800">- {t}</span>
                                        <span onClick={()=>handleRemoveTermUI(idx)} 
                                              className="text-red-500 cursor-pointer font-bold px-2 hover:bg-red-50 rounded" title="Xóa">
                                            &times;
                                        </span>
                                    </li>
                                ))}
                                {terms.length === 0 && <li className="p-4 text-center text-gray-400 text-sm italic">Chưa có điều khoản nào</li>}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button type="button" onClick={onClose} disabled={isLoading} 
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                    Hủy bỏ
                </button>
                <button type="submit" disabled={isLoading} 
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors shadow-sm">
                    {isLoading ? 'Đang xử lý...' : (isEditMode ? 'Lưu Cập Nhật' : 'Tạo Hợp Đồng')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default ContractForm;