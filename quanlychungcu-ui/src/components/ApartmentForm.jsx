// src/components/ApartmentForm.jsx
import React, { useState, useEffect, useMemo } from 'react';

// URL cơ sở của Backend để hiển thị ảnh cũ
const API_BASE_URL = 'http://localhost:5000/'; 

const apartmentTypes = [
  { type: "1 phòng ngủ", area: 51 },
  { type: "2 phòng ngủ", area: 69 },
  { type: "3 phòng ngủ", area: 108 },
  { type: "Penthouse", area: 200 }
];
const areaMap = new Map(apartmentTypes.map(t => [t.type, t.area]));

// Hàm tách số thứ tự (Giữ nguyên)
const getSoThuTu = (soCanHoStr) => {
  if (!soCanHoStr) return '';
  const parts = soCanHoStr.split('.');
  if (parts.length === 3 && !isNaN(parseInt(parts[2], 10))) {
    return parseInt(parts[2], 10).toString();
  }
  return soCanHoStr;
};

function ApartmentForm({ 
  isOpen, onClose, onSubmit, isLoading, 
  initialData, allBlocks, allFloors, apartmentStatuses 
}) {
  
  const [formData, setFormData] = useState({
    MaTang: '',
    SoThuTu: '',
    MaTrangThai: '',
    LoaiCanHo: '',
    DienTich: ''
  });
  
  const [selectedBlockId, setSelectedBlockId] = useState('');
  
  // STATE MỚI CHO ẢNH
  const [selectedImage, setSelectedImage] = useState(null); // File ảnh mới chọn
  const [previewUrl, setPreviewUrl] = useState(null);       // URL xem trước
  const [currentImageUrl, setCurrentImageUrl] = useState(null); // URL ảnh cũ từ DB

  const isEditMode = Boolean(initialData);

  const availableFloors = useMemo(() => {
    if (!selectedBlockId) return [];
    return allFloors.filter(f => f.MaBlock.toString() === selectedBlockId);
  }, [selectedBlockId, allFloors]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        const soThuTu = getSoThuTu(initialData.SoCanHo);
        setFormData({
          MaTang: initialData.MaTang,
          SoThuTu: soThuTu,
          MaTrangThai: initialData.MaTrangThai || '',
          LoaiCanHo: initialData.LoaiCanHo || '',
          DienTich: initialData.DienTich || ''
        });
        
        const floor = allFloors.find(f => f.MaTang === initialData.MaTang);
        if (floor) setSelectedBlockId(floor.MaBlock.toString());

        // Xử lý ảnh cũ
        if (initialData.HinhAnh) {
            setCurrentImageUrl(API_BASE_URL + initialData.HinhAnh);
        } else {
            setCurrentImageUrl(null);
        }

      } else {
        // Reset form tạo mới
        setFormData({ MaTang: '', SoThuTu: '', MaTrangThai: '', LoaiCanHo: '', DienTich: ''});
        setSelectedBlockId('');
        setCurrentImageUrl(null);
      }
      // Reset ảnh đã chọn
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  }, [initialData, isEditMode, isOpen, allFloors]);

  // Xử lý chọn file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setSelectedImage(file);
        // Tạo URL tạm để xem trước ảnh vừa chọn
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const defaultArea = areaMap.get(newType) || '';
    setFormData(prev => ({ ...prev, LoaiCanHo: newType, DienTich: defaultArea }));
  };

  const handleBlockChange = (e) => {
    setSelectedBlockId(e.target.value);
    setFormData(prev => ({ ...prev, MaTang: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || !formData.MaTang || !formData.SoThuTu) {
      alert("Vui lòng chọn Tầng và nhập Số Thứ Tự Căn Hộ.");
      return;
    }

    // TẠO FORM DATA ĐỂ GỬI FILE
    const submissionData = new FormData();
    submissionData.append('MaTang', formData.MaTang);
    submissionData.append('SoThuTu', formData.SoThuTu.trim()); // Bên cha sẽ dùng cái này để tạo mã
    submissionData.append('LoaiCanHo', formData.LoaiCanHo || '');
    submissionData.append('DienTich', formData.DienTich || '');
    if (formData.MaTrangThai) submissionData.append('MaTrangThai', formData.MaTrangThai);

    // Nếu có chọn ảnh mới thì gửi
    if (selectedImage) {
        submissionData.append('HinhAnh', selectedImage);
    }

    onSubmit(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <button onClick={onClose} className="modal-close-btn" disabled={isLoading}>&times;</button>
        <h2>{isEditMode ? 'Cập nhật Căn hộ' : 'Tạo Căn hộ Mới'}</h2>
        
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* CỘT TRÁI: THÔNG TIN */}
                <div style={{ flex: 1 }}>
                    <div className="form-group">
                        <label htmlFor="blockSelectForm">Chọn Block (*)</label>
                        <select id="blockSelectForm" value={selectedBlockId} onChange={handleBlockChange} required disabled={isLoading}>
                        <option value="">-- Chọn Block --</option>
                        {allBlocks.map(b => <option key={b.MaBlock} value={b.MaBlock}>{b.TenBlock}</option>)}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="MaTang">Chọn Tầng (*)</label>
                        <select id="MaTang" name="MaTang" value={formData.MaTang} onChange={handleChange} required disabled={!selectedBlockId || isLoading}>
                        <option value="">-- Chọn Tầng --</option>
                        {availableFloors.map(f => <option key={f.MaTang} value={f.MaTang}>Tầng {f.SoTang}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="SoThuTu">Số Thứ Tự (*)</label>
                        <input type="text" id="SoThuTu" name="SoThuTu" value={formData.SoThuTu} onChange={handleChange} required disabled={isLoading} placeholder="Ví dụ: 1, 2, 10..." />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="LoaiCanHo">Loại Căn Hộ</label>
                        <select id="LoaiCanHo" name="LoaiCanHo" value={formData.LoaiCanHo} onChange={handleTypeChange} disabled={isLoading}>
                        <option value="">-- Chọn loại --</option>
                        {apartmentTypes.map(t => <option key={t.type} value={t.type}>{t.type}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="DienTich">Diện Tích (m²)</label>
                        <input type="number" step="0.01" id="DienTich" name="DienTich" value={formData.DienTich} onChange={handleChange} disabled={isLoading} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="MaTrangThai">Trạng Thái</label>
                        <select id="MaTrangThai" name="MaTrangThai" value={formData.MaTrangThai} onChange={handleChange} disabled={isLoading}>
                        <option value="">-- NULL --</option>
                        {apartmentStatuses.map(s => <option key={s.MaTrangThai} value={s.MaTrangThai}>{s.Ten}</option>)}
                        </select>
                    </div>
                </div>

                {/* CỘT PHẢI: HÌNH ẢNH */}
                <div style={{ width: '300px', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                    <div className="form-group">
                        <label>Hình ảnh Căn hộ</label>
                        <input type="file" onChange={handleImageChange} accept="image/*" disabled={isLoading} />
                        
                        <div style={{ marginTop: '15px', border: '1px dashed #ccc', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                            {/* Ưu tiên hiển thị Preview (ảnh vừa chọn) -> sau đó đến ảnh cũ -> sau đó đến placeholder */}
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : currentImageUrl ? (
                                <img src={currentImageUrl} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ color: '#999' }}>Chưa có ảnh</span>
                            )}
                        </div>
                        {currentImageUrl && !previewUrl && <p style={{fontSize: '0.8em', color: '#666', textAlign: 'center'}}>Ảnh hiện tại đang lưu trên hệ thống</p>}
                    </div>
                </div>
            </div>
          
            <div className="form-actions">
                <button type="button" onClick={onClose} disabled={isLoading} className="btn-cancel">Hủy</button>
                <button type="submit" disabled={isLoading} className="btn-submit">
                {isLoading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default ApartmentForm;