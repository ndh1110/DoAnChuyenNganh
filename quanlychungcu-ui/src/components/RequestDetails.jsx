// src/components/RequestDetails.jsx
import React from 'react';

// "Dumb Component" - Chỉ nhận props
const RequestDetails = ({ request, logs, appointments, onBack }) => {

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));
  };

  if (!request) return null;

  return (
    <div className="request-details mt-6 p-4 border rounded-lg bg-gray-50">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Quay lại danh sách</button>
      
      <h3 className="text-2xl font-bold mb-4">Chi tiết Yêu cầu #{request.MaYeuCau}</h3>
      
      {/* Thông tin chính */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div><strong>Người gửi:</strong> {request.HoTen || 'N/A'}</div>
        <div><strong>Căn hộ:</strong> {request.SoCanHo || 'N/A'}</div>
        <div><strong>Loại:</strong> {request.Loai}</div>
        <div><strong>Trạng thái:</strong> {request.TrangThaiThanhChung}</div>
        <div className="col-span-2"><strong>Mô tả:</strong> {request.MoTa || '(Không có mô tả)'}</div>
      </div>

      {/* --- Bảng Log Xử Lý --- */}
      <h4 className="text-xl font-semibold mb-3 mt-8">Log Xử Lý</h4>
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Thời gian</th>
            <th className="py-2 px-4 border-b text-left">Ghi Chú</th>
            <th className="py-2 px-4 border-b text-left">Người xử lý</th>
          </tr>
        </thead>
        <tbody>
          {/* (Giả định 'logs' là một mảng) */}
          {logs && logs.map((log) => (
            <tr key={log.MaLog}>
              <td className="py-2 px-4 border-b">{formatDate(log.ThoiGian)}</td>
              <td className="py-2 px-4 border-b">{log.GhiChu}</td>
              <td className="py-2 px-4 border-b">{log.HoTenNguoiXuLy || `(Mã NV: ${log.NguoiXuLyId})`}</td>
            </tr>
          ))}
          {(!logs || logs.length === 0) && (
            <tr><td colSpan="3" className="py-4 text-center text-gray-500">Chưa có log xử lý.</td></tr>
          )}
        </tbody>
      </table>

      {/* --- Bảng Lịch Hẹn --- */}
      <h4 className="text-xl font-semibold mb-3 mt-8">Lịch Hẹn</h4>
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Thời gian hẹn</th>
            <th className="py-2 px-4 border-b text-left">Người liên quan</th>
            <th className="py-2 px-4 border-b text-left">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {/* (Giả định 'appointments' là một mảng) */}
          {appointments && appointments.map((app) => (
            <tr key={app.MaLichHen}>
              <td className="py-2 px-4 border-b">{formatDate(app.ThoiGian)}</td>
              <td className="py-2 px-4 border-b">{app.HoTenNguoiDung || `(Mã ND: ${app.MaNguoiDung})`}</td>
              <td className="py-2 px-4 border-b">{app.TrangThai}</td>
            </tr>
          ))}
          {(!appointments || appointments.length === 0) && (
            <tr><td colSpan="3" className="py-4 text-center text-gray-500">Chưa có lịch hẹn nào.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestDetails;