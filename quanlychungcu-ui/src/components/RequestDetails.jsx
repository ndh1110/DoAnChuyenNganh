// src/components/RequestDetails.jsx
import React from 'react';

// --- THAY ĐỔI 1: Thêm props 'onAddLog' và 'onAddAppointment' ---
const RequestDetails = ({ request, onBack, onAddLog, onAddAppointment }) => {

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));
  };

  if (!request) return null;

  // --- THAY ĐỔI 2: Lấy 'Logs' và 'LichHen' trực tiếp từ prop 'request' ---
  // (Dựa theo API GET /api/yeucau/:id)
  const logs = request.Logs || [];
  const appointments = request.LichHen || [];

  return (
    <div className="request-details mt-6 p-4 border rounded-lg bg-gray-50">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Quay lại danh sách</button>
      
      <h3 className="text-2xl font-bold mb-4">Chi tiết Yêu cầu #{request.MaYeuCau}</h3>
      
      {/* Thông tin chính (Đọc từ API) */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div><strong>Người gửi:</strong> {request.TenNguoiGui || 'N/A'}</div>
        <div><strong>Căn hộ:</strong> {request.SoCanHo || 'N/A'}</div>
        <div><strong>Loại:</strong> {request.Loai}</div>
        <div><strong>Trạng thái:</strong> {request.TrangThaiThanhChung}</div>
        <div className="col-span-2"><strong>Mô tả:</strong> {request.MoTa || '(Không có mô tả)'}</div>
      </div>

      {/* --- THAY ĐỔI 3: Thêm các nút hành động --- */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={onAddAppointment}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          + Đặt Lịch Hẹn Mới
        </button>
        <button
          onClick={onAddLog}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
        >
          + Thêm Log Xử Lý
        </button>
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
          {logs.map((log) => (
            <tr key={log.MaLog}>
              <td className="py-2 px-4 border-b">{formatDate(log.ThoiGian)}</td>
              <td className="py-2 px-4 border-b">{log.GhiChu}</td>
              {/* API trả về 'TenNguoiXuLy' */}
              <td className="py-2 px-4 border-b">{log.TenNguoiXuLy || `(Mã NV: ${log.NguoiXuLyId})`}</td>
            </tr>
          ))}
          {logs.length === 0 && (
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
          {appointments.map((app) => (
            <tr key={app.MaLichHen}>
              <td className="py-2 px-4 border-b">{formatDate(app.ThoiGian)}</td>
              {/* API trả về 'TenNguoiHen' */}
              <td className="py-2 px-4 border-b">{app.TenNguoiHen || `(Mã ND: ${app.MaNguoiDung})`}</td>
              <td className="py-2 px-4 border-b">{app.TrangThai}</td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr><td colSpan="3" className="py-4 text-center text-gray-500">Chưa có lịch hẹn nào.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestDetails;