// src/components/PriceList.jsx
import React from 'react';

const formatDate = (dateString) => {
    if (!dateString) return 'Vô thời hạn';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN').format(date);
};
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Nhận thêm prop 'canManage'
const PriceList = ({ prices, onEdit, onDelete, canManage }) => {
  
  return (
    <div className="price-list mt-8 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Bảng Giá Dịch Vụ ({prices.length})</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Tên Dịch Vụ</th>
            <th className="py-2 px-4 border-b text-left">Đơn Giá (VND)</th>
            <th className="py-2 px-4 border-b text-left">Hiệu lực Từ</th>
            <th className="py-2 px-4 border-b text-left">Hiệu lực Đến</th>
            
            {/* Chỉ hiện cột Hành Động nếu có quyền Quản lý */}
            {canManage && <th className="py-2 px-4 border-b text-left">Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {prices.map((price) => (
            <tr key={price.MaBangGia} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b font-medium">
                {price.TenDichVu || `(Mã DV: ${price.MaDichVu})`}
              </td>
              <td className="py-2 px-4 border-b font-semibold text-blue-700">
                {formatCurrency(price.DonGiaBien)}
              </td>
              <td className="py-2 px-4 border-b">{formatDate(price.HieuLucTu)}</td>
              <td className="py-2 px-4 border-b">{formatDate(price.HieuLucDen)}</td>
              
              {/* Chỉ hiện nút Sửa/Xóa nếu có quyền Quản lý */}
              {canManage && (
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => onEdit(price)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(price.MaBangGia)}
                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                  >
                    Xóa
                  </button>
                </td>
              )}
            </tr>
          ))}
          {prices.length === 0 && (
            <tr>
              <td colSpan={canManage ? "5" : "4"} className="py-4 text-center text-gray-500">
                💰 Chưa có Bảng giá nào được cấu hình.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PriceList;