import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

const ResidentList = () => {
    // 1. Khai báo state để lưu trữ danh sách Cư dân và trạng thái tải dữ liệu
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Sử dụng useEffect để gọi API khi component được render
    useEffect(() => {
        const fetchResidents = async () => {
            try {
                // Gọi API GET /api/nguoidung
                const response = await axios.get(`${API_BASE_URL}/nguoidung`);
                
                // Cập nhật state với dữ liệu cư dân (NguoiDung) nhận được
                setResidents(response.data); 
                
                // Đánh dấu đã tải xong
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải danh sách Cư dân:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchResidents();
    }, []); 

    // 3. Hiển thị trạng thái tải và lỗi
    if (loading) {
        return <div className="p-6 text-center text-blue-500">Đang tải danh sách Cư dân...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API: {error}. Vui lòng kiểm tra Server BE (http://localhost:5000).
        </div>;
    }

    // 4. Hiển thị danh sách Cư dân dưới dạng Bảng
    return (
        <div className="resident-list mt-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Tổng số Cư dân: {residents.length}</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã ND</th>
                        <th className="py-2 px-4 border-b text-left">Họ Tên</th>
                        <th className="py-2 px-4 border-b text-left">Email</th>
                        <th className="py-2 px-4 border-b text-left">SĐT</th>
                        <th className="py-2 px-4 border-b text-left">Vai Trò</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Lặp qua danh sách cư dân để hiển thị */}
                    {residents.map((resident) => (
                        <tr key={resident.MaNguoiDung} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{resident.MaNguoiDung}</td>
                            <td className="py-2 px-4 border-b font-medium">{resident.HoTen}</td>
                            <td className="py-2 px-4 border-b text-sm">{resident.Email}</td>
                            <td className="py-2 px-4 border-b">{resident.SoDienThoai || 'N/A'}</td>
                            {/* Giả định trường VaiTro (từ file Cập nhật và sửa lần 2: N'Resident') được trả về */}
                            <td className="py-2 px-4 border-b text-sm">
                                {resident.VaiTro || 'Resident/User'}
                            </td> 
                        </tr>
                    ))}
                    
                    {residents.length === 0 && (
                        <tr>
                            <td colSpan="5" className="py-4 text-center text-gray-500">
                                🔑 Chưa có cư dân nào trong hệ thống.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ResidentList;