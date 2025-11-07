import React from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - KHÔNG tự gọi API, KHÔNG dùng useState/useEffect.
 * - Chỉ nhận props 'areas' và 'isLoading' từ cha (CommonAreasPage).
 */
function CommonAreaList({ areas, isLoading, onEdit, onDelete }) {

    if (isLoading) {
        return <div className="p-4 text-center text-blue-500">Đang tải danh sách khu vực chung...</div>;
    }

    return (
        <div className="common-area-list mt-6 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Danh sách Khu vực chung ({areas.length})</h2>
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã KVC</th>
                        <th className="py-2 px-4 border-b text-left">Tên Khu Vực</th>
                        <th className="py-2 px-4 border-b text-left">Thuộc Block</th>
                        <th className="py-2 px-4 border-b text-left">Loại</th>
                        <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
                        <th className="py-2 px-4 border-b text-left">Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Lặp qua props 'areas' */}
                    {areas.map((area) => (
                        <tr key={area.MaKhuVucChung} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{area.MaKhuVucChung}</td>
                            <td className="py-2 px-4 border-b font-medium">{area.Ten}</td>
                            <td className="py-2 px-4 border-b">
                                {area.TenBlock || `(Mã Block: ${area.MaBlock})`}
                            </td>
                            <td className="py-2 px-4 border-b">{area.Loai}</td>
                            <td className="py-2 px-4 border-b">{area.TrangThai}</td>
                            <td className="actions">
                                {/* (Chúng ta sẽ thêm logic cho các nút này sau) */}
                                <button onClick={() => alert('Sửa KVC')} className="btn-edit">
                                  Sửa
                                </button>
                                <button onClick={() => alert('Xóa KVC')} className="btn-delete">
                                  Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                    {areas.length === 0 && (
                        <tr>
                            <td colSpan="6" className="py-4 text-center text-gray-500">
                                🏞️ Chưa có khu vực chung nào được thiết lập.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CommonAreaList;