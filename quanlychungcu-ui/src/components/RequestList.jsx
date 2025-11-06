import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

const RequestList = () => {
    // 1. State cho Yêu cầu
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. useEffect gọi API
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                // Gọi API GET /api/yeucau
                const response = await axios.get(`${API_BASE_URL}/yeucau`);
                setRequests(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải danh sách Yêu cầu:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchRequests();
    }, []); 

    // 3. Hàm tiện ích
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        // Định dạng bao gồm cả ngày và giờ
        return new Intl.DateTimeFormat('vi-VN', { 
            dateStyle: 'short', 
            timeStyle: 'short' 
        }).format(date);
    };

    // 4. Hiển thị Loading/Error
    if (loading) {
        return <div className="p-4 text-center text-blue-500">Đang tải danh sách Yêu cầu/Phản ánh...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API Yêu cầu: {error}.
        </div>;
    }

    // 5. Hiển thị Bảng Yêu cầu
    return (
        <div className="request-list mt-6 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Danh sách Yêu cầu/Phản ánh ({requests.length})</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã YC</th>
                        <th className="py-2 px-4 border-b text-left">Người Gửi</th>
                        <th className="py-2 px-4 border-b text-left">Căn Hộ</th>
                        <th className="py-2 px-4 border-b text-left">Loại Yêu Cầu</th>
                        <th className="py-2 px-4 border-b text-left">Ngày Gửi</th>
                        <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req.MaYeuCau} className="hover:bg-gray-50 cursor-pointer">
                            <td className="py-2 px-4 border-b">{req.MaYeuCau}</td>
                            
                            {/* Giả định API /api/yeucau đã JOIN và trả về HoTen (từ NguoiDung) */}
                            <td className="py-2 px-4 border-b font-medium">
                                {req.HoTen || `(Mã ND: ${req.MaNguoiDung})`}
                            </td>
                            {/* Giả định API /api/yeucau đã JOIN và trả về SoCanHo (từ CanHo) */}
                            <td className="py-2 px-4 border-b">
                                {req.SoCanHo || `(Mã CH: ${req.MaCanHo})`}
                            </td>
                            
                            <td className="py-2 px-4 border-b">{req.Loai}</td>
                            <td className="py-2 px-4 border-b">{formatDate(req.NgayTao)}</td>
                            {/* TrangThaiThanhChung [cite: 95] */}
                            <td className="py-2 px-4 border-b font-semibold">
                                {req.TrangThaiThanhChung || 'Mới'}
                            </td>
                        </tr>
                    ))}
                    {requests.length === 0 && (
                        <tr>
                            <td colSpan="6" className="py-4 text-center text-gray-500">
                                📣 Chưa có yêu cầu hoặc phản ánh nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RequestList;