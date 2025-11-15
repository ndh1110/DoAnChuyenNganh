// src/components/IncidentList.jsx
import React from 'react';

// Nhận thêm prop 'canManage'
const IncidentList = ({ incidents, onEdit, onDelete, isLoading, canManage }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));
  };

  if (isLoading) {
    return <div className="p-4 text-center text-blue-500">Đang tải Sự cố...</div>;
  }

  return (
    <div className="incident-list mt-8 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Danh sách Sự cố Kỹ thuật ({incidents.length})</h2>
      <table className="min-w-full bg-white border border-gray-200 data-table">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Mã SC</th>
            <th className="py-2 px-4 border-b text-left">Khu Vực</th>
            <th className="py-2 px-4 border-b text-left">Mô Tả</th>
            <th className="py-2 px-4 border-b text-left">Mức Độ</th>
            <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
            <th className="py-2 px-4 border-b text-left">NV Xử lý</th>
            
            {/* Ẩn cột Hành động nếu không có quyền */}
            {canManage && <th className="py-2 px-4 border-b text-left">Hành Động</th>}
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr key={inc.MaSuCo} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{inc.MaSuCo}</td>
              <td className="py-2 px-4 border-b font-medium">{inc.TenKhuVuc}</td>
              <td className="py-2 px-4 border-b" style={{ minWidth: '200px' }}>{inc.MoTa}</td>
              <td className="py-2 px-4 border-b">
                <span className={`badge badge-${inc.MucDo}`}>{inc.MucDo}</span>
              </td>
              <td className="py-2 px-4 border-b font-semibold">{inc.TrangThai}</td>
              <td className="py-2 px-4 border-b">{inc.TenNhanVienXuLy || 'Chưa gán'}</td>
              
              {/* Chỉ hiện nút nếu có quyền */}
              {canManage && (
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => onEdit(inc)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2 btn-edit"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(inc.MaSuCo)}
                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded btn-delete"
                  >
                    Xóa
                  </button>
                </td>
              )}
            </tr>
          ))}
          {incidents.length === 0 && (
            <tr>
              <td colSpan={canManage ? "7" : "6"} className="py-4 text-center text-gray-500">
                🔧 Không có sự cố kỹ thuật nào được ghi nhận.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default IncidentList;