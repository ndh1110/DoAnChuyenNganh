import React from 'react';
import RequestList from '../components/RequestList.jsx';   // Component đã tạo
import IncidentList from '../components/IncidentList.jsx'; // Component mới

const RequestsPage = () => {
    
  const handleAction = () => {
    alert('Chức năng Tạo Yêu cầu/Sự cố sẽ được xây dựng sau!');
  };

  return (
    <div className="requests-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          📣 Quản lý Yêu cầu & Sự cố
        </h1>
        <button 
          onClick={handleAction}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
        >
          + Ghi Nhận Mới
        </button>
      </div>

      <hr className="mb-6"/>

      {/* 1. Danh sách Yêu cầu (Cư dân gửi) */}
      <RequestList />

      {/* 2. Danh sách Sự cố (Kỹ thuật ghi nhận) */}
      <IncidentList />
    </div>
  );
};

export default RequestsPage;