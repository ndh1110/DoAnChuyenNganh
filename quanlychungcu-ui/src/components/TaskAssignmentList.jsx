// src/components/TaskAssignmentList.jsx
import React from 'react';

// "Dumb Component"
const TaskAssignmentList = ({ tasks, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString));
  };

  return (
    <div className="task-assignment-list mt-8 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Danh Sách Phân Công ({tasks.length})</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Nhân Viên</th>
            <th className="py-2 px-4 border-b text-left">Khu Vực</th>
            <th className="py-2 px-4 border-b text-left">Ngày</th>
            <th className="py-2 px-4 border-b text-left">Ca</th>
            <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
            <th className="py-2 px-4 border-b text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.MaPhanCong} className="hover:bg-gray-50">
              {/* Giả định API /api/phancong đã JOIN và trả về HoTen, TenKhuVuc */}
              <td className="py-2 px-4 border-b font-medium">{task.HoTen || `(Mã NV: ${task.MaNhanVien})`}</td>
              <td className="py-2 px-4 border-b">{task.TenKhuVuc || `(Mã KVC: ${task.MaKhuVucChung})`}</td>
              <td className="py-2 px-4 border-b">{formatDate(task.Ngay)}</td>
              <td className="py-2 px-4 border-b">{task.Ca}</td>
              <td className="py-2 px-4 border-b font-semibold">{task.TrangThai}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onEdit(task)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(task.MaPhanCong)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan="6" className="py-4 text-center text-gray-500">
                📋 Chưa có nhiệm vụ nào được phân công.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskAssignmentList;