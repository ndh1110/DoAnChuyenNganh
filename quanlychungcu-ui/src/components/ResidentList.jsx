// src/components/ResidentList.jsx
import React from 'react';

const ResidentList = ({ residents, onViewDetails, onEdit, onDelete }) => {

  // --- THÊM 2 DÒNG NÀY ---
  // Nếu residents chưa có dữ liệu (undefined) hoặc không phải là mảng,
  // thì hiển thị null (hoặc loading) thay vì bị crash.
  if (!Array.isArray(residents)) {
    return <div>Đang tải danh sách...</div>; // Hoặc return null;
  }
  // -------------------------

  return (
    <div className="resident-list mt-6 overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Mã ND</th>
            <th className="py-2 px-4 border-b text-left">Họ Tên</th>
            <th className="py-2 px-4 border-b text-left">Email</th>
            <th className="py-2 px-4 border-b text-left">SĐT</th>
            <th className="py-2 px-4 border-b text-left">CCCD/CMND</th>
            <th className="py-2 px-4 border-b text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {/* Dòng này (trước đó là 21) giờ đã an toàn */}
          {residents.map((resident) => (
            <tr key={resident.MaNguoiDung} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{resident.MaNguoiDung}</td>
              <td className="py-2 px-4 border-b font-medium">{resident.HoTen}</td>
              <td className="py-2 px-4 border-b text-sm">{resident.Email}</td>
              <td className="py-2 px-4 border-b">{resident.SoDienThoai || 'N/A'}</td>
              <td className="py-2 px-4 border-b">{resident.CCCD || 'N/A'}</td>
              <td className="py-2 px-4 border-b">
                
                <button
                  onClick={() => onViewDetails(resident.MaNguoiDung)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded mr-2"
                >
                  Xem
                </button>
                <button
                  onClick={() => onEdit(resident)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(resident.MaNguoiDung)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}

          {residents.length === 0 && (
            <tr>
              <td colSpan="6" className="py-4 text-center text-gray-500">
                🔑 Chưa có cư dân nào trong hệ thống.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResidentList;