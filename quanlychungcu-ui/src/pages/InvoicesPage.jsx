import React from 'react';
import InvoiceList from '../components/InvoiceList'; // Thay đổi đường dẫn nếu cần

const InvoicesPage = () => {
    
  const handleAction = () => {
    alert('Chức năng Lập Hóa đơn/Thanh toán sẽ được xây dựng sau!');
  };

  return (
    <div className="invoices-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          🧾 Quản lý Hóa đơn & Thanh toán
        </h1>
        <button 
          onClick={handleAction}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
        >
          + Lập Hóa Đơn Mới
        </button>
      </div>

      <hr className="mb-6"/>

      {/* Render Component hiển thị danh sách Hóa đơn */}
      <InvoiceList />
    </div>
  );
};

export default InvoicesPage;