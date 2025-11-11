// src/components/InvoiceDetails.jsx
import React from 'react';
import '../styles/InvoicePrint.css'; 

const InvoiceDetails = ({ invoice, payments, onBack }) => {

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const formatDate = (dateString) => new Intl.DateTimeFormat('vi-VN').format(new Date(dateString));
  const today = formatDate(new Date());

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) {
      return <div className="p-4 text-center">Không tìm thấy chi tiết hóa đơn.</div>;
  }

  const totalPaid = payments.reduce((sum, p) => sum + (p.ThanhTien || 0), 0);
  const remainingAmount = (invoice.TongTien || 0) - totalPaid;

  return (
    <div className="invoice-details-wrapper mt-6 p-4">
      <div className="invoice-controls no-print mb-4 flex justify-between">
        <button onClick={onBack} className="text-blue-600 hover:underline">
          &larr; Quay lại danh sách
        </button>
        <button 
          onClick={handlePrint} 
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded shadow-md"
        >
          🖨️ In Hóa Đơn
        </button>
      </div>

      <div id="invoice-document" className="bg-white p-8 rounded-lg shadow-lg">
        <div className="invoice-header mb-8 flex justify-between items-center">
          <h1 className="text-5xl font-bold text-teal-700">HÓA ĐƠN</h1>
          <p className="text-lg text-gray-600">Ngày lập: {today}</p>
        </div>

        <div className="invoice-info mb-10 grid grid-cols-2 gap-y-2">
          <div>
            <p className="text-gray-700">Hóa đơn cho:</p>
            <p className="font-semibold text-lg">{invoice.TenChuHo || 'Chủ hộ'}</p>
            
            {/* --- SỬA Ở ĐÂY: Hiển thị cả Số căn hộ và Mã căn hộ --- */}
            <p className="text-gray-600">
              Căn hộ: <span className="font-medium text-black">{invoice.SoCanHo}</span> (Mã: {invoice.MaCanHo})
            </p>
            
            <p className="text-gray-600">Kỳ: {formatDate(invoice.KyThang)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-700">Thanh toán cho:</p>
            <p className="font-semibold text-lg">Ban Quản lý An Nam</p>
            <p className="text-gray-600">Hotline: +84 912 345 678</p>
            <p className="text-gray-600">Email: bql@chungcuannam.vn</p>
          </div>
        </div>

        <div className="invoice-items mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-700 text-white">
                <th className="py-3 px-4 text-left rounded-tl-lg">Mô tả</th>
                <th className="py-3 px-4 text-center">Số lượng</th>
                <th className="py-3 px-4 text-right">Đơn giá</th>
                <th className="py-3 px-4 text-right rounded-tr-lg">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoice.ChiTietHoaDons && invoice.ChiTietHoaDons.map((detail, index) => (
                <tr key={detail.MaCT || index} className="border-b border-gray-200">
                  <td className="py-3 px-4 text-left">{detail.TenDichVu || `(Mã DV: ${detail.MaDichVu})`}</td>
                  <td className="py-3 px-4 text-center">{detail.SoLuong || 1}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(detail.DonGia || detail.ThanhTien)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(detail.ThanhTien)}</td>
                </tr>
              ))}
              {(invoice.ChiTietHoaDons?.length === 0) && (
                 <tr><td colSpan="4" className="py-4 text-center text-gray-500">Chưa có chi tiết dịch vụ.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="invoice-total text-right bg-gray-100 p-4 rounded-b-lg">
          <p className="text-2xl font-bold text-teal-700">Tổng cộng: {formatCurrency(invoice.TongTien)}</p>
        </div>

        <div className="invoice-footer mt-10 p-6 bg-teal-700 text-white rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-4xl mr-3">⚗️</span> 
            <div>
              <p className="font-bold text-xl">An Nam</p>
              <p className="text-sm">Chữa lành bắt đầu từ đây.</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p>An Nam, 123 Đường ABC, Thành phố DEF</p>
            <p>+84 912 345 678</p>
            <p>bql@chungcuannam.vn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;