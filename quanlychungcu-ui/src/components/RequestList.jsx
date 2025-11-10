// src/components/RequestList.jsx
import React from 'react';

// "Dumb Component" - Chỉ nhận props
// --- THAY ĐỔI 1: Thêm 'onViewDetails', 'onEdit', 'onDelete' vào props ---
const RequestList = ({ requests, onViewDetails, onEdit, onDelete }) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date);
  };

  // File RequestList.jsx cũ của bạn không có isLoading, 
  // nhưng logic ở RequestsPage đã xử lý loading rồi nên chúng ta không cần ở đây.

  return (
    <div className="request-list mt-6 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Danh sách Yêu cầu/Phản ánh ({requests.length})</h2>
      
      <table className="min-w-full bg-white border border-gray-200 data-table">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Mã YC</th>
            <th className="py-2 px-4 border-b text-left">Người Gửi</th>
            <th className="py-2 px-4 border-b text-left">Căn Hộ</th>
            <th className="py-2 px-4 border-b text-left">Loại Yêu Cầu</th>
            <th className="py-2 px-4 border-b text-left">Ngày Gửi</th>
            <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
            <th className="py-2 px-4 border-b text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.MaYeuCau} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{req.MaYeuCau}</td>
              {/* Giả định API /api/yeucau đã JOIN (theo file yeuCauController.js) */}
              <td className="py-2 px-4 border-b font-medium">{req.TenNguoiGui || `(Mã ND: ${req.MaNguoiDung})`}</td>
              <td className="py-2 px-4 border-b">{req.SoCanHo || `(Mã CH: ${req.MaCanHo})`}</td>
              <td className="py-2 px-4 border-b">{req.Loai}</td>
              <td className="py-2 px-4 border-b">{formatDate(req.NgayTao)}</td>
              <td className="py-2 px-4 border-b font-semibold">{req.TrangThaiThanhChung || 'Mới'}</td>
              
              {/* --- THAY ĐỔI 2: Sửa lại toàn bộ các nút --- */}
              <td className="py-2 px-4 border-b actions">
                <button
                  onClick={() => onViewDetails(req.MaYeuCau)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded mr-2 btn-view"
                >
                  Xem
                </button>
                <button
                  onClick={() => onEdit(req)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2 btn-edit"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(req.MaYeuCau)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded btn-delete"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan="7" className="py-4 text-center text-gray-500">
                📣 Chưa có yêu cầu hoặc phản ánh nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestList;