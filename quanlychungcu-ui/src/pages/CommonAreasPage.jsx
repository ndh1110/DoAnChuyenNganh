import React from 'react';
import CommonAreaList from '../components/CommonAreaList.jsx';
import InspectionList from '../components/InspectionList.jsx';

const CommonAreasPage = () => {
    
  const handleAction = () => {
    alert('Chức năng Quản lý Kỹ thuật/Khu vực chung sẽ được xây dựng sau!');
  };

  return (
    <div className="common-areas-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          🏞️ Quản lý Kỹ thuật & Khu vực chung
        </h1>
        <button 
          onClick={handleAction}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
        >
          + Quản lý Kỹ thuật
        </button>
      </div>

      <hr className="mb-6"/>

      <CommonAreaList />
      <InspectionList />
    </div>
  );
};

export default CommonAreasPage;