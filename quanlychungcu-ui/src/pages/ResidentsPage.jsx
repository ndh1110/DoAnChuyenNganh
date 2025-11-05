import React from 'react';
import ResidentList from '../components/ResidentList'; // Thay đổi đường dẫn nếu cần

const ResidentsPage = () => {
    
  // Chúng ta sẽ thêm logic Thêm/Sửa/Xóa sau, bây giờ chỉ tập trung vào hiển thị
  const handleAction = () => {
    alert('Các chức năng Thêm/Sửa/Xóa Cư dân sẽ được xây dựng sau!');
  };

  return (
    <div className="residents-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          👥 Quản lý Cư dân
        </h1>
        {/* Nút Thêm Cư dân mới */}
        <button 
          onClick={handleAction}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
        >
          + Thêm Cư Dân Mới
        </button>
      </div>

      <hr className="mb-6"/>

      {/* Render Component hiển thị danh sách Cư dân */}
      <ResidentList />
    </div>
  );
};

export default ResidentsPage;