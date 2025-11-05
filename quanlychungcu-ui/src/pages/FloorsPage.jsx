import React from 'react';
import FloorList from '../components/FloorList'; // Thay đổi đường dẫn nếu cần

const FloorsPage = () => {
    
  const handleAction = () => {
    alert('Chức năng Thêm/Quản lý Tầng sẽ được xây dựng sau!');
  };

  return (
    <div className="floors-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          🏢 Quản lý Tầng
        </h1>
        <button 
          onClick={handleAction}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
        >
          + Thêm Tầng Mới
        </button>
      </div>

      <hr className="mb-6"/>

      {/* Render Component hiển thị danh sách Tầng */}
      <FloorList />
    </div>
  );
};

export default FloorsPage;