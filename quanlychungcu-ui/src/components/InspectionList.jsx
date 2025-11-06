import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const InspectionList = () => {
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInspections = async () => {
            try {
                // Gọi API GET /api/kiemtra
                const response = await axios.get(`${API_BASE_URL}/kiemtrakhuvuc`);
                setInspections(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải Lịch sử Kiểm tra:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchInspections();
    }, []); 

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));
    };

    if (loading) return <div className="p-4 text-center text-blue-500">Đang tải lịch sử kiểm tra...</div>;
    if (error) return <div className="p-4 text-red-600 text-center font-semibold">❌ Lỗi API Kiểm tra: {error}.</div>;

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
                    </tr>
                </thead>
                <tbody>
                    {inspections.map((insp) => (
                        <tr key={insp.MaKiemTraKVC} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{insp.MaKiemTraKVC}</td>
                            {/* Giả định API /api/kiemtra đã JOIN và trả về TenKhuVuc, HoTen */}
                            <td className="py-2 px-4 border-b font-medium">
                                {insp.TenKhuVuc || `(Mã KVC: ${insp.MaKhuVucChung})`}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {insp.HoTen || `(Mã NV: ${insp.MaNhanVien})`}
                            </td>
                            <td className="py-2 px-4 border-b">{formatDate(insp.ThoiGian)}</td>
                            <td className="py-2 px-4 border-b">{insp.DanhGia}</td>
                        </tr>
                    ))}
                    {inspections.length === 0 && (
                        <tr>
                            <td colSpan="5" className="py-4 text-center text-gray-500">
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