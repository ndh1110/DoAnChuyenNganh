// src/components/ContractList.jsx
import React from 'react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try { return new Date(dateString).toISOString().split('T')[0]; } catch { return 'Lỗi'; }
};

const formatCurrency = (value) => {
    if (!value) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

function ContractList({ contracts, onViewDetails, onEdit, onDelete, isLoading }) {

  if (isLoading) return <div className="p-4 text-center text-blue-500">Đang tải...</div>;
  if (contracts.length === 0) return <div className="p-4 text-center text-gray-500">Không có hợp đồng nào.</div>;

  return (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 data-table">
        <thead className="bg-gray-100">
            <tr>
            <th className="py-2 px-4 border-b text-left">Số HĐ</th>
            <th className="py-2 px-4 border-b text-left">Loại</th>
            {/* THÊM CỘT BÊN A */}
            <th className="py-2 px-4 border-b text-left">Bên A (Bán/Cho Thuê)</th>
            <th className="py-2 px-4 border-b text-left">Bên B (Mua/Thuê)</th>
            <th className="py-2 px-4 border-b text-left">Giá Trị</th>
            <th className="py-2 px-4 border-b text-left">Hành Động</th>
            </tr>
        </thead>
        <tbody>
            {contracts.map((con) => (
            <tr key={con.MaHopDong} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b font-bold text-blue-600">
                    {con.SoHopDong || `ID: ${con.MaHopDong}`}
                </td>
                <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${con.Loai === 'Mua/Bán' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {con.Loai}
                    </span>
                </td>
                
                {/* HIỂN THỊ BÊN A: Nếu null thì là CĐT */}
                <td className="py-2 px-4 border-b font-medium text-gray-700">
                    {con.TenBenA || '🏢 CHỦ ĐẦU TƯ'}
                </td>

                {/* HIỂN THỊ BÊN B */}
                <td className="py-2 px-4 border-b font-medium text-blue-800">
                    {con.TenBenB}
                </td>

                <td className="py-2 px-4 border-b text-right font-mono">
                    {formatCurrency(con.GiaTriHopDong)}
                </td>
                
                <td className="py-2 px-4 border-b actions whitespace-nowrap">
                    <button onClick={() => onViewDetails(con)} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded mr-2 shadow-sm">
                        Xem
                    </button>
                    <button onClick={() => onEdit(con)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2 shadow-sm">
                        Sửa
                    </button>
                    <button onClick={() => onDelete(con.MaHopDong)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded shadow-sm">
                        Xóa
                    </button>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
  );
}

export default ContractList;