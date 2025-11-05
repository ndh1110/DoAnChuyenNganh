import React from 'react';
import EmployeeList from '../components/EmployeeList'; // Thay đổi đường dẫn nếu cần

const EmployeesPage = () => {
    
  const handleAction = () => {
    alert('Chức năng Thêm/Phân công/Lịch trực Nhân viên sẽ được xây dựng sau!');
  };

  return (
    <div className="employees-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          👷‍♂️ Quản lý Nhân viên
        </h1>
        <button 
          onClick={handleAction}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
        >
          + Thêm Nhân Viên Mới
        </button>
      </div>

      <hr className="mb-6"/>

      {/* Render Component hiển thị danh sách Nhân viên */}
      <EmployeeList />
    </div>
  );
};

export default EmployeesPage;