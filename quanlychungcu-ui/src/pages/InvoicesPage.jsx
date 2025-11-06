import React, { useState } from 'react';
import InvoiceList from '../components/InvoiceList.jsx'; 
import ServiceMeterList from '../components/ServiceMeterList.jsx';
import InvoiceDetails from '../components/InvoiceDetails.jsx'; // Import component mới

const InvoicesPage = () => {
    
  // State để lưu ID của hóa đơn đang được chọn
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const handleAction = () => {
    alert('Chức năng Lập Hóa đơn/Ghi chỉ số/Thanh toán sẽ được xây dựng sau!');
  };

  // Hàm này sẽ được truyền xuống InvoiceList
  const handleViewDetails = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
  };

  // Hàm quay lại danh sách
  const handleBackToList = () => {
    setSelectedInvoiceId(null);
  };

  return (
    <div className="invoices-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          🧾 Quản lý Hóa đơn & Ghi chỉ số
        </h1>
        {/* Nút này sẽ bị ẩn khi xem chi tiết */}
        {!selectedInvoiceId && (
            <button 
                onClick={handleAction}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
            >
                + Quản lý Thu Phí
            </button>
        )}
      </div>

      <hr className="mb-6"/>

      {/* Dùng toán tử 3 ngôi để hiển thị Danh sách HOẶC Chi tiết */}
      {selectedInvoiceId ? (
        // Chế độ xem Chi tiết
        <InvoiceDetails 
            invoiceId={selectedInvoiceId} 
            onBack={handleBackToList} 
        />
      ) : (
        // Chế độ xem Danh sách (như cũ)
        <>
          {/* Truyền prop onRowClick xuống InvoiceList */}
          <InvoiceList onRowClick={handleViewDetails} />
          <ServiceMeterList />
        </>
      )}
    </div>
  );
};

export default InvoicesPage;