import React, { useState, useEffect } from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - Chỉ quản lý state của file đang chọn.
 * - Gọi onSubmit(file) khi người dùng nhấn "Import".
 */
function ImportExcelModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');

  // Reset state khi modal được mở
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setFileName('');
    }
  }, [isOpen]);

  // Xử lý khi người dùng chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  // Xử lý khi nhấn nút Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Vui lòng chọn một file Excel.');
      return;
    }
    if (isLoading) return;
    
    // Gửi file object lên cho cha (InvoicesPage) xử lý
    onSubmit(selectedFile); 
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn" disabled={isLoading}>
          &times;
        </button>
        
        <h2>Tải Lên File Excel Hóa Đơn</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="excelFile">Chọn file (.xlsx, .xls)</label>
            <input
              type="file"
              id="excelFile"
              name="excelFile" // Tên này phải khớp với backend
              accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              required
              disabled={isLoading}
            />
            {fileName && <p>Đã chọn: {fileName}</p>}
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={isLoading} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={isLoading || !selectedFile} className="btn-submit">
              {isLoading ? 'Đang tải lên...' : 'Bắt đầu Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ImportExcelModal;