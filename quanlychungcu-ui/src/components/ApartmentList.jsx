import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

const ApartmentList = () => {
    // 1. Khai báo state để lưu trữ danh sách Căn hộ
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Sử dụng useEffect để gọi API khi component được render
    useEffect(() => {
        const fetchApartments = async () => {
            try {
                // Gọi API GET /api/canho
                const response = await axios.get(`${API_BASE_URL}/canho`);
                
                // Cập nhật state với dữ liệu Căn hộ nhận được
                setApartments(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải danh sách Căn hộ:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchApartments();
    }, []); 

    // 3. Hiển thị trạng thái tải và lỗi
    if (loading) {
        return <div className="p-6 text-center text-blue-500">Đang tải danh sách Căn hộ...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API: {error}. Vui lòng kiểm tra Server BE (http://localhost:5000).
        </div>;
    }

    // 4. Hiển thị danh sách Căn hộ
    return (
        <div className="apartment-list mt-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Tổng số Căn hộ: {apartments.length}</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã Căn Hộ</th>
                        <th className="py-2 px-4 border-b text-left">Số Căn Hộ</th>
                        <th className="py-2 px-4 border-b text-left">Tầng</th>
                        <th className="py-2 px-4 border-b text-left">Block</th>
                        {/* Bạn có thể thêm cột "Trạng thái" sau nếu API trả về */}
                    </tr>
                </thead>
                <tbody>
                    {apartments.map((apt) => (
                        <tr key={apt.MaCanHo} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{apt.MaCanHo}</td>
                            <td className="py-2 px-4 border-b font-medium">{apt.SoCanHo}</td>
                            
                            {/* Tôi giả định API /api/canho đã JOIN và trả về SoTang và TenBlock.
                              Nếu không, API có thể chỉ trả về MaTang.
                            */}
                            <td className="py-2 px-4 border-b">
                                {apt.SoTang || `(Mã Tầng: ${apt.MaTang})`}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {apt.TenBlock || '(Không rõ Block)'}
                            </td>
                        </tr>
                    ))}
                    
                    {apartments.length === 0 && (
                        <tr>
                            <td colSpan="4" className="py-4 text-center text-gray-500">
                                🚪 Chưa có dữ liệu về Căn hộ.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ApartmentList;