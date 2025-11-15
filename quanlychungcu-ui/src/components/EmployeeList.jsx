import React from 'react';

// Hàm helper để format ngày (YYYY-MM-DD)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    // Cắt chuỗi 'T' (ví dụ: 2025-11-10T00:00:00.000Z)
    return dateString.split('T')[0];
  } catch (e) {
    return 'Ngày lỗi';
  }
};

/**
 * Component "Ngốc" (Dumb Component)
 * - ĐÃ THÊM cột 'NgayVaoLam' và 'MaSoThue'.
 */
function EmployeeList({ employees, onEdit, onDelete, isLoading, canManage }) {

  if (isLoading) {
    return <div>Đang tải danh sách nhân viên...</div>;
  }

  if (employees.length === 0) {
    return <div>Không có nhân viên nào.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Mã NV</th>
          <th>Họ Tên</th>
          <th>Email (Tài khoản)</th>
          <th>Ngày vào làm</th>
          <th>Mã số thuế</th>
          <th>Trạng Thái</th>
          {canManage && <th>Hành Động</th>}
        </tr>
      </thead>
      <tbody>
        {employees.map((emp) => (
          <tr key={emp.MaNhanVien}>
            <td>{emp.MaNhanVien}</td>
            <td>{emp.HoTen}</td>
            <td>{emp.Email}</td>
            <td>{formatDate(emp.NgayVaoLam)}</td> 
            <td>{emp.MaSoThue || 'N/A'}</td>
            <td>{emp.TrangThai}</td>
            
            {/* Ẩn/hiện dựa trên quyền "Quản lý" (đã có) */}
            {canManage && (
              <td className="actions">
                <button onClick={() => onEdit(emp)} className="btn-edit">
                  Sửa Hồ Sơ
                </button>
                <button onClick={() => onDelete(emp.MaNhanVien)} className="btn-delete">
                  Xóa
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default EmployeeList;