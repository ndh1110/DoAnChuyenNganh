import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

const IncidentList = () => {
    // 1. State cho Sự cố
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. useEffect gọi API
    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                // Gọi API GET /api/suco
                const response = await axios.get(`${API_BASE_URL}/suco`);
                setIncidents(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải danh sách Sự cố:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchIncidents();
    }, []); 

    // 3. Hàm tiện ích
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', { 
            dateStyle: 'short', 
            timeStyle: 'short' 
        }).format(date);
    };

    // 4. Hiển thị Loading/Error
    if (loading) {
        return <div className="p-4 text-center text-blue-500">Đang tải danh sách Sự cố...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API Sự cố: {error}.
        </div>;
    }

    // 5. Hiển thị Bảng Sự cố
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
                    </tr>
                </thead>
                <tbody>
                    {incidents.map((inc) => (
                        <tr key={inc.MaSuCo} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{inc.MaSuCo}</td>
                            
                            {/* Giả định API /api/suco đã JOIN và trả về TenKhuVuc */}
                            <td className="py-2 px-4 border-b font-medium">
                                {inc.TenKhuVuc || `(Mã KVC: ${inc.MaKhuVucChung})`}
                            </td>
                            <td className="py-2 px-4 border-b" style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                                {inc.MoTa}
                            </td>
                            <td className="py-2 px-4 border-b">{inc.MucDo}</td>
                            <td className="py-2 px-4 border-b font-semibold">{inc.TrangThai}</td>
                            <td className="py-2 px-4 border-b">{formatDate(inc.ThoiGianPhatHien)}</td>
                            
                             {/* Giả định API /api/suco đã JOIN và trả về TenNhanVienXuLy */}
                            <td className="py-2 px-4 border-b">
                                {inc.TenNhanVienXuLy || (inc.MaNhanVienXuLy ? `(Mã NV: ${inc.MaNhanVienXuLy})` : 'Chưa gán')}
                            </td>
                        </tr>
                    ))}
                    {incidents.length === 0 && (
                        <tr>
                            <td colSpan="7" className="py-4 text-center text-gray-500">
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