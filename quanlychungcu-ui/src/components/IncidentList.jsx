import React from 'react';

// Hàm helper (từ file cũ của bạn, nó rất hữu ích)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
        dateStyle: 'short', 
        timeStyle: 'short' 
    }).format(date);
};

/**
 * Component "Ngốc" (Dumb Component)
 * - KHÔNG tự gọi API.
 * - Chỉ nhận props 'incidents' và 'isLoading' từ cha (CommonAreasPage).
 */
function IncidentList({ incidents, isLoading }) {

    if (isLoading) {
        return <div className="p-4 text-center text-blue-500">Đang tải danh sách Sự cố...</div>;
    }

    return (
        <div className="incident-list mt-8 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Danh sách Sự cố Kỹ thuật ({incidents.length})</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã SC</th>
                        <th className="py-2 px-4 border-b text-left">Khu Vực</th>
                        <th className="py-2 px-4 border-b text-left">Mô Tả</th>
                        <th className="py-2 px-4 border-b text-left">Mức Độ</th>
                        <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
                        <th className="py-2 px-4 border-b text-left">Thời gian Phát Hiện</th>
                        <th className="py-2 px-4 border-b text-left">Nhân viên Xử lý</th>
                        <th className="py-2 px-4 border-b text-left">Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Lặp qua props 'incidents' */}
                    {incidents.map((inc) => (
                        <tr key={inc.MaSuCo} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{inc.MaSuCo}</td>
                            <td className="py-2 px-4 border-b font-medium">
                                {inc.TenKhuVuc || `(Mã KVC: ${inc.MaKhuVucChung})`}
                            </td>
                            <td className="py-2 px-4 border-b" style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                                {inc.MoTa}
                            </td>
                            <td className="py-2 px-4 border-b">{inc.MucDo}</td>
                            <td className="py-2 px-4 border-b font-semibold">{inc.TrangThai}</td>
                            <td className="py-2 px-4 border-b">{formatDate(inc.ThoiGianPhatHien)}</td>
                            <td className="py-2 px-4 border-b">
                                {inc.TenNhanVienXuLy || (inc.MaNhanVienXuLy ? `(Mã NV: ${inc.MaNhanVienXuLy})` : 'Chưa gán')}
                            </td>
                            <td className="actions">
                                <button onClick={() => alert('Sửa Sự cố')} className="btn-edit">
                                  Sửa
                                </button>
                                <button onClick={() => alert('Xóa Sự cố')} className="btn-delete">
                                  Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                    {incidents.length === 0 && (
                        <tr>
                            <td colSpan="8" className="py-4 text-center text-gray-500">
                                🔧 Không có sự cố kỹ thuật nào được ghi nhận.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default IncidentList;