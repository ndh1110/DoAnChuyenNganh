import React from 'react';
import ApartmentList from '../components/ApartmentList'; // Thay đổi đường dẫn nếu cần

const ApartmentsPage = () => {
    
  const handleAction = () => {
    alert('Chức năng Thêm/Quản lý Căn hộ sẽ được xây dựng sau!');
  };

  return (
    <div className="apartments-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          🚪 Quản lý Căn hộ
        </h1>
        <button 
          onClick={handleAction}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
        >
          + Thêm Căn Hộ Mới
        </button>
      </div>

      <hr className="mb-6"/>

      {/* Render Component hiển thị danh sách Căn hộ */}
      <ApartmentList />
    </div>
  );
};

export default ApartmentsPage;