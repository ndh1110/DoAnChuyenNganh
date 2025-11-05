import React from 'react';
import BlockList from '../components/BlockList'; // Thay đổi đường dẫn nếu cần

const BlocksPage = () => {
  
  // Xử lý khi nhấn nút Thêm Block (chức năng này sẽ được xây dựng ở bước sau)
  const handleAddNewBlock = () => {
    alert('Chức năng thêm Block mới sẽ được xây dựng tại đây!');
  };

  return (
    <div className="blocks-page container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          🏠 Quản lý Block Nhà
        </h1>
        {/* Nút Thêm Block mới - Tương ứng với chức năng trong User Story Quản lý block/căn hộ  */}
        <button 
          onClick={handleAddNewBlock}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200"
        >
          + Thêm Block Mới
        </button>
      </div>

      <hr className="mb-6"/>

      {/* Render Component hiển thị danh sách đã làm ở bước trước */}
      <BlockList />
    </div>
  );
};

export default BlocksPage;