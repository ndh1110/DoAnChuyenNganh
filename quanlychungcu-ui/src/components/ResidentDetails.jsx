// src/components/ResidentDetails.jsx
import React from 'react';

// "Dumb Component" - Chỉ nhận props và render
const ResidentDetails = ({ resident, onBack }) => {

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString));
  };

  if (!resident) {
    return <div className="p-4 text-center">Không tìm thấy dữ liệu chi tiết.</div>;
  }

  return (
    <div className="resident-details mt-6 p-6 border rounded-lg bg-gray-50 shadow-md">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Quay lại danh sách</button>
      
      <h3 className="text-2xl font-bold mb-6">Chi tiết Cư dân: {resident.HoTen}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="border-b pb-2">
          <span className="text-sm font-medium text-gray-500">Mã Cư dân (ID)</span>
          <p className="text-lg font-semibold">{resident.MaNguoiDung}</p>
        </div>
        <div className="border-b pb-2">
          <span className="text-sm font-medium text-gray-500">Họ và Tên</span>
          <p className="text-lg">{resident.HoTen}</p>
        </div>
        <div className="border-b pb-2">
          <span className="text-sm font-medium text-gray-500">Email</span>
          <p className="text-lg">{resident.Email}</p>
        </div>
        <div className="border-b pb-2">
          <span className="text-sm font-medium text-gray-500">Số Điện Thoại</span>
          <p className="text-lg">{resident.SoDienThoai || 'N/A'}</p>
        </div>
        
        {/* --- THÊM MỚI --- */}
        <div className="border-b pb-2">
          <span className="text-sm font-medium text-gray-500">CCCD/CMND</span>
          <p className="text-lg">{resident.CCCD || 'N/A'}</p>
        </div>
        {/* --- KẾT THÚC THÊM MỚI --- */}

      </div>

      {/* (Chúng ta sẽ thêm Lịch sử cư trú /api/lichsucutru vào đây ở bước sau) */}
      <div className="mt-8">
        <h4 className="text-xl font-semibold mb-3">Lịch sử Cư trú</h4>
        <div className="p-4 bg-gray-100 rounded text-center text-gray-600">
          (Chức năng xem Lịch sử Cư trú sẽ được thêm sau)
        </div>
      </div>
    </div>
  );
};

export default ResidentDetails;