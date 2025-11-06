// src/components/WorkScheduleList.jsx
import React from 'react';

// "Dumb Component"
const WorkScheduleList = ({ schedules, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString));
  };

  return (
    <div className="work-schedule-list mt-8 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Lịch Trực Nhân Viên ({schedules.length})</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Nhân Viên</th>
            <th className="py-2 px-4 border-b text-left">Ngày Trực</th>
            <th className="py-2 px-4 border-b text-left">Ca Trực</th>
            <th className="py-2 px-4 border-b text-left">Ghi Chú</th>
            <th className="py-2 px-4 border-b text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((sch) => (
            <tr key={sch.MaLichTruc} className="hover:bg-gray-50">
              {/* Giả định API /api/lichtruc đã JOIN và trả về HoTen */}
              <td className="py-2 px-4 border-b font-medium">{sch.HoTen || `(Mã NV: ${sch.MaNhanVien})`}</td>
              <td className="py-2 px-4 border-b">{formatDate(sch.Ngay)}</td>
              <td className="py-2 px-4 border-b">{sch.Ca}</td>
              <td className="py-2 px-4 border-b">{sch.GhiChu}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onEdit(sch)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(sch.MaLichTruc)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {schedules.length === 0 && (
            <tr>
              <td colSpan="5" className="py-4 text-center text-gray-500">
                🗓️ Chưa có lịch trực nào được xếp.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WorkScheduleList;