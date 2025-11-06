import React from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - Hiển thị danh sách Yêu Cầu (từ Cư dân).
 */
function RequestList({ requests, onEdit, onDelete, isLoading }) {

  if (isLoading) {
    return <div className="p-4 text-center">Đang tải danh sách Yêu cầu...</div>;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Danh sách Yêu cầu (Cư dân gửi)</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã YC</th>
            <th>Loại Yêu Cầu</th>
            <th>Trạng Thái</th>
            <th>Người Gửi (ID)</th>
            <th>Căn Hộ (ID)</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {/* Sửa 'residents.map' thành 'requests.map' */}
          {requests.map((req) => (
            <tr key={req.MaYeuCau}>
              <td>{req.MaYeuCau}</td>
              <td>{req.Loai}</td>
              <td>{req.TrangThaiThanhChung}</td>
              <td>{req.MaNguoiDung}</td>
              <td>{req.MaCanHo || 'N/A'}</td>
              <td className="actions">
                <button onClick={() => alert('Sửa Yêu cầu (chưa làm)')} className="btn-edit">
                  Sửa
                </button>
                <button onClick={() => alert('Xóa Yêu cầu (chưa làm)')} className="btn-delete">
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          
          {requests.length === 0 && (
            <tr>
              <td colSpan="6" className="py-4 text-center text-gray-500">
                Không có yêu cầu nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RequestList;