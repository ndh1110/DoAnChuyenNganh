import React from 'react';

const ResidentList = ({ residents, onViewDetails, onEdit, onDelete }) => {
  if (!Array.isArray(residents)) return <div className="p-8 text-center text-slate-500">Đang tải danh sách...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <th className="p-4 pl-6">Mã Cư Dân</th>
              <th className="p-4">Họ và Tên</th>
              <th className="p-4">Liên hệ</th>
              <th className="p-4">CCCD/CMND</th>
              <th className="p-4 text-right pr-6">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {residents.map((resident) => (
              <tr key={resident.MaNguoiDung} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 pl-6 font-medium text-slate-900">#{resident.MaNguoiDung}</td>
                
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {resident.HoTen.charAt(0).toUpperCase()}
                    </div>
                    <div className="font-medium text-slate-800">{resident.HoTen}</div>
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex flex-col text-sm">
                    <span className="text-slate-700">{resident.Email}</span>
                    <span className="text-slate-500 text-xs">{resident.SoDienThoai || '---'}</span>
                  </div>
                </td>

                <td className="p-4 text-sm text-slate-600">
                  {resident.CCCD || <span className="italic text-slate-400">Chưa cập nhật</span>}
                </td>

                <td className="p-4 pr-6 text-right">
                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onViewDetails(resident.MaNguoiDung)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all" title="Xem chi tiết">
                      👁️
                    </button>
                    <button onClick={() => onEdit(resident)} className="p-1.5 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-all" title="Chỉnh sửa">
                      ✏️
                    </button>
                    <button onClick={() => onDelete(resident.MaNguoiDung)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all" title="Xóa">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {residents.length === 0 && (
              <tr><td colSpan="5" className="p-12 text-center text-slate-400 italic">Chưa có dữ liệu cư dân.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResidentList;