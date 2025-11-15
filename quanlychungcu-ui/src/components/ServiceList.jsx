// src/components/ServiceList.jsx
import React from 'react';

// Nhận thêm prop 'canManage' từ trang cha
const ServiceList = ({ services, onEdit, onDelete, canManage }) => {
  
  return (
    <div className="service-list mt-6 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Danh sách Dịch vụ ({services.length})</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Mã DV</th>
            <th className="py-2 px-4 border-b text-left">Tên Dịch Vụ</th>
            <th className="py-2 px-4 border-b text-left">Kiểu Tính Phí</th>
            <th className="py-2 px-4 border-b text-left">Đơn Vị Tính</th>
            
            {/* Chỉ hiện cột Hành Động nếu có quyền Quản lý */}
            {canManage && <th className="py-2 px-4 border-b text-left">Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.MaDichVu} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{service.MaDichVu}</td>
              <td className="py-2 px-4 border-b font-medium">{service.TenDichVu}</td>
              <td className="py-2 px-4 border-b">
                {service.KieuTinh === 'FIXED' ? 'Cố định' : 'Theo đồng hồ'}
              </td>
              <td className="py-2 px-4 border-b">{service.DonViMacDinh}</td>
              
              {/* Chỉ hiện nút Sửa/Xóa nếu có quyền Quản lý */}
              {canManage && (
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => onEdit(service)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(service.MaDichVu)}
                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                  >
                    Xóa
                  </button>
                </td>
              )}
            </tr>
          ))}
          {services.length === 0 && (
            <tr>
              {/* Điều chỉnh colSpan tùy theo việc có hiện cột Action hay không */}
              <td colSpan={canManage ? "5" : "4"} className="py-4 text-center text-gray-500">
                🔌 Chưa có dịch vụ nào được cấu hình.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceList;