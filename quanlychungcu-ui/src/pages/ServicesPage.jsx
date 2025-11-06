import React from 'react';
import ServiceList from '../components/ServiceList.jsx'; // Component đã tạo
import PriceList from '../components/PriceList.jsx';   // Component mới

const ServicesPage = () => {
    
  const handleAction = () => {
    alert('Chức năng Thêm/Quản lý Dịch vụ & Bảng giá sẽ được xây dựng sau!');
  };

  return (
    <div className="services-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          🔌 Quản lý Dịch vụ & Bảng giá
        </h1>
        <button 
          onClick={handleAction}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
        >
          + Quản lý Chung
        </button>
      </div>

      <hr className="mb-6"/>

      {/* Render Component hiển thị danh sách Dịch vụ */}
      <ServiceList />

      {/* Render Component hiển thị Bảng giá */}
      <PriceList />
    </div>
  );
};

export default ServicesPage;