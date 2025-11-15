// src/components/CommonAreaList.jsx
import React from 'react';

// Nhận thêm prop 'canManage'
const CommonAreaList = ({ areas, onEdit, onDelete, isLoading, canManage }) => {

    if (isLoading) {
      return <div className="p-4 text-center text-blue-500">Đang tải Khu vực chung...</div>;
    }

    return (
        <div className="common-area-list mt-6 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Danh sách Khu vực chung ({areas.length})</h2>
            <table className="min-w-full bg-white border border-gray-200 data-table">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã KVC</th>
                        <th className="py-2 px-4 border-b text-left">Tên Khu Vực</th>
                        <th className="py-2 px-4 border-b text-left">Thuộc Block</th>
                        <th className="py-2 px-4 border-b text-left">Loại</th>
                        <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
                        {/* Chỉ hiện cột Hành động nếu có quyền */}
                        {canManage && <th className="py-2 px-4 border-b text-left">Hành Động</th>}
                    </tr>
                </thead>
                <tbody>
                    {areas.map((area) => (
                        <tr key={area.MaKhuVucChung} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{area.MaKhuVucChung}</td>
                            <td className="py-2 px-4 border-b font-medium">{area.Ten}</td>
                            <td className="py-2 px-4 border-b">{area.TenBlock}</td>
                            <td className="py-2 px-4 border-b">{area.Loai}</td>
                            <td className="py-2 px-4 border-b">{area.TrangThai}</td>
                            
                            {/* Chỉ hiện nút Sửa/Xóa nếu có quyền */}
                            {canManage && (
                                <td className="py-2 px-4 border-b actions">
                                    <button onClick={() => onEdit(area)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2 btn-edit">
                                    Sửa
                                    </button>
                                    <button onClick={() => onDelete(area.MaKhuVucChung)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded btn-delete">
                                    Xóa
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {/* ... (phần empty state giữ nguyên, chỉnh colSpan nếu cần) ... */}
                </tbody>
            </table>
        </div>
    );
};

export default CommonAreaList;