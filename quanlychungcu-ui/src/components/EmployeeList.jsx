// src/components/EmployeeList.jsx
import React from 'react';

// "Dumb Component" - Chỉ nhận props
const EmployeeList = ({ employees, onEdit, onDelete }) => {
  return (
    <div className="employee-list mt-6 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Danh sách Nhân viên ({employees.length})</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Mã NV</th>
            <th className="py-2 px-4 border-b text-left">Họ Tên</th>
            <th className="py-2 px-4 border-b text-left">Email</th>
            <th className="py-2 px-4 border-b text-left">Chức Vụ</th>
            <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
            <th className="py-2 px-4 border-b text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.MaNhanVien} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{emp.MaNhanVien}</td>
              {/* Giả định API /api/nhanvien đã JOIN và trả về HoTen, Email */}
              <td className="py-2 px-4 border-b font-medium">{emp.HoTen || `(Mã ND: ${emp.MaNguoiDung})`}</td>
              <td className="py-2 px-4 border-b text-sm">{emp.Email || 'N/A'}</td>
              <td className="py-2 px-4 border-b">{emp.ChucVu}</td>
              <td className="py-2 px-4 border-b">{emp.TrangThai || 'Active'}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onEdit(emp)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(emp.MaNhanVien)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr>
              <td colSpan="6" className="py-4 text-center text-gray-500">
                👷‍♂️ Chưa có nhân viên nào trong hệ thống.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;