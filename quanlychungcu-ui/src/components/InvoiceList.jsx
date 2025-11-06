// src/components/InvoiceList.jsx
import React from 'react';

// Hàm tiện ích nội bộ
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN').format(date);
};
const formatBillingPeriod = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getFullYear()}`;
};
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// "Dumb Component" nhận props từ InvoicesPage
const InvoiceList = ({ invoices, onViewDetails, onDelete }) => {

  // Không còn useState, useEffect, hay axios

  return (
    <div className="invoice-list mt-6 overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Mã HĐ</th>
            <th className="py-2 px-4 border-b text-left">Căn Hộ</th>
            <th className="py-2 px-4 border-b text-left">Kỳ Hóa Đơn</th>
            <th className="py-2 px-4 border-b text-left">Tổng Tiền</th>
            <th className="py-2 px-4 border-b text-left">Ngày Hết Hạn</th>
            <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
            <th className="py-2 px-4 border-b text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.MaHoaDon} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{invoice.MaHoaDon}</td>
              <td className="py-2 px-4 border-b font-medium">
                {invoice.SoCanHo || `(Mã CH: ${invoice.MaCanHo})`}
              </td>
              <td className="py-2 px-4 border-b">{formatBillingPeriod(invoice.KyThang)}</td>
              <td className="py-2 px-4 border-b font-semibold text-red-600">{formatCurrency(invoice.TongTien)}</td>
              <td className="py-2 px-4 border-b">{formatDate(invoice.NgayDenHan)}</td>
              <td className="py-2 px-4 border-b">
                {invoice.TenTrangThai || 'Chờ thanh toán'}
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onViewDetails(invoice.MaHoaDon)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded mr-2"
                >
                  Xem
                </button>
                {/* API của bạn (TÀI LIỆU API.txt) [cite: 3] có DELETE /api/hoadon/:id */}
                <button
                  onClick={() => onDelete(invoice.MaHoaDon)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan="7" className="py-4 text-center text-gray-500">
                🧾 Chưa có dữ liệu về Hóa đơn.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList;