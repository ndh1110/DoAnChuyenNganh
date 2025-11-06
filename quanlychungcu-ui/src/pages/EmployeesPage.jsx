import React from 'react';
import EmployeeList from '../components/EmployeeList.jsx'; 
import WorkScheduleList from '../components/WorkScheduleList.jsx'; // 1. Import
import TaskAssignmentList from '../components/TaskAssignmentList.jsx'; // 2. Import

const EmployeesPage = () => {
    
  const handleAction = () => {
    alert('Chức năng Thêm/Phân công/Xếp lịch sẽ được xây dựng sau!');
  };

  return (
    <div className="employees-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          👷‍♂️ Quản lý Nhân sự
        </h1>
        <button 
          onClick={handleAction}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
        >
          + Quản lý Chung
        </button>
      </div>

      <hr className="mb-6"/>

      {/* 3. Hiển thị cả 3 component */}
      <EmployeeList />
      <WorkScheduleList />
      <TaskAssignmentList />
    </div>
  );
};

export default EmployeesPage;