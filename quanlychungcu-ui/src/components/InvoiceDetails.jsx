// src/components/InvoiceDetails.jsx
import React from 'react';

// "Dumb Component" - Chỉ nhận props và render
const InvoiceDetails = ({ invoice, payments, onBack }) => {

  // Không còn useState, useEffect, hay axios
  
  // Hàm tiện ích
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const formatDate = (dateString) => new Intl.DateTimeFormat('vi-VN').format(new Date(dateString));

  if (!invoice) {
      return <div className="p-4 text-center">Không tìm thấy chi tiết hóa đơn.</div>;
  }

  // Tính toán số tiền
  const totalPaid = payments.reduce((sum, p) => sum + (p.ThanhTien || 0), 0);
  const remainingAmount = (invoice.TongTien || 0) - totalPaid;

  return (
    <div className="invoice-details mt-6 p-4 border rounded-lg bg-gray-50">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Quay lại danh sách</button>
      
      <h3 className="text-2xl font-bold mb-4">Chi tiết Hóa đơn #{invoice.MaHoaDon}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div><strong>Căn hộ:</strong> {invoice.SoCanHo || `(Mã: ${invoice.MaCanHo})`}</div>
        <div><strong>Kỳ:</strong> {formatDate(invoice.KyThang)}</div>
        <div className="font-bold text-lg"><strong>Tổng cộng:</strong> {formatCurrency(invoice.TongTien)}</div>
        <div className="font-bold text-lg text-green-600"><strong>Đã thanh toán:</strong> {formatCurrency(totalPaid)}</div>
        <div className={`font-bold text-lg ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
          <strong>Còn lại:</strong> {formatCurrency(remainingAmount)}
        </div>
      </div>

      {/* --- Bảng Chi tiết Dịch vụ (Line Items) --- */}
      {/* Giả định API GET /api/hoadon/:id trả về một mảng 'ChiTietHoaDons' */}
      <h4 className="text-xl font-semibold mb-3 mt-8">Chi tiết Dịch vụ</h4>
      <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
              <tr>
                  <th className="py-2 px-4 border-b text-left">Dịch Vụ</th>
                  <th className="py-2 px-4 border-b text-right">Thành Tiền</th>
              </tr>
          </thead>
          <tbody>
              {invoice.ChiTietHoaDons && invoice.ChiTietHoaDons.map((detail) => (
                  <tr key={detail.MaCT}>
                      <td className="py-2 px-4 border-b">{detail.TenDichVu || `(Mã DV: ${detail.MaDichVu})`}</td>
                      <td className="py-2 px-4 border-b text-right">{formatCurrency(detail.ThanhTien)}</td>
                  </tr>
              ))}
          </tbody>
      </table>


      {/* --- Bảng Lịch sử Thanh toán (Từ props 'payments') --- */}
      <h4 className="text-xl font-semibold mb-3 mt-8">Lịch sử Thanh toán</h4>
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Mã TT</th>
            <th className="py-2 px-4 border-b text-left">Ngày Thanh Toán</th>
            <th className="py-2 px-4 border-b text-right">Số Tiền</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.MaThanhToan}>
              <td className="py-2 px-4 border-b">{payment.MaThanhToan}</td>
              <td className="py-2 px-4 border-b">{formatDate(payment.NgayThanhToan)}</td>
              <td className="py-2 px-4 border-b text-right font-medium">{formatCurrency(payment.ThanhTien)}</td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan="3" className="py-4 text-center text-gray-500">
                Chưa có thanh toán nào cho hóa đơn này.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceDetails;