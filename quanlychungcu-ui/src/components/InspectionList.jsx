import React from 'react';

// Hàm helper (từ file cũ của bạn, nó rất hữu ích)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));
};

/**
 * Component "Ngốc" (Dumb Component)
 * - KHÔNG tự gọi API.
 * - Chỉ nhận props 'inspections' và 'isLoading' từ cha (CommonAreasPage).
 */
function InspectionList({ inspections, isLoading }) {

    if (isLoading) {
        return <div className="p-4 text-center text-blue-500">Đang tải lịch sử kiểm tra...</div>;
    }

    return (
        <div className="inspection-list mt-8 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Lịch sử Kiểm tra Kỹ thuật ({inspections.length})</h2>
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã KT</th>
                        <th className="py-2 px-4 border-b text-left">Khu Vực</th>
                        <th className="py-2 px-4 border-b text-left">Nhân Viên KT</th>
                        <th className="py-2 px-4 border-b text-left">Thời Gian</th>
                        <th className="py-2 px-4 border-b text-left">Đánh Giá</th>
                        <th className="py-2 px-4 border-b text-left">Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Lặp qua props 'inspections' */}
                    {inspections.map((insp) => (
                        <tr key={insp.MaKiemTraKVC} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{insp.MaKiemTraKVC}</td>
                            <td className="py-2 px-4 border-b font-medium">
                                {insp.TenKhuVuc || `(Mã KVC: ${insp.MaKhuVucChung})`}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {insp.HoTen || `(Mã NV: ${insp.MaNhanVien})`}
                            </td>
                            <td className="py-2 px-4 border-b">{formatDate(insp.ThoiGian)}</td>
                            <td className="py-2 px-4 border-b">{insp.DanhGia}</td>
                            <td className="actions">
                                <button onClick={() => alert('Xóa Kiểm tra')} className="btn-delete">
                                  Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                    {inspections.length === 0 && (
                        <tr>
                            <td colSpan="6" className="py-4 text-center text-gray-500">
                                🕵️ Chưa có hoạt động kiểm tra kỹ thuật nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InspectionList;