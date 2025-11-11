// src/components/InspectionList.jsx
import React from 'react';

// "Dumb Component" (Không có nút "Sửa" vì API không hỗ trợ PUT)
const InspectionList = ({ inspections, onDelete, isLoading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));
  };

  if (isLoading) {
    return <div className="p-4 text-center text-blue-500">Đang tải Lịch sử Kiểm tra...</div>;
  }

  return (
    <div className="inspection-list mt-8 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Lịch sử Kiểm tra Kỹ thuật ({inspections.length})</h2>
      <table className="min-w-full bg-white border border-gray-200 data-table">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Mã KT</th>
            <th className="py-2 px-4 border-b text-left">Khu Vực</th>
            <th className="py-2 px-4 border-b text-left">Nhân Viên KT</th>
            <th className="py-2 px-4 border-b text-left">Thời Gian</th>
            <th className="py-2 px-4 border-b text-left">Đánh Giá</th>
            <th className="py-2 px-4 border-b text-left">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {inspections.map((insp) => (
            <tr key={insp.MaKiemTraKVC} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{insp.MaKiemTraKVC}</td>
              <td className="py-2 px-4 border-b font-medium">{insp.TenKhuVuc}</td>
              <td className="py-2 px-4 border-b">{insp.TenNhanVien || 'N/A'}</td>
              <td className="py-2 px-4 border-b">{formatDate(insp.ThoiGian)}</td>
              <td className="py-2 px-4 border-b">{insp.DanhGia}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onDelete(insp.MaKiemTraKVC)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded btn-delete"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {inspections.length === 0 && (
            <tr>
              <td colSpan="6" className="py-4 text-center text-gray-500">
                🕵️ Chưa có hoạt động kiểm tra kỹ thuật nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InspectionList;