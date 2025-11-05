import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

const FloorList = () => {
    // 1. Khai báo state để lưu trữ danh sách Tầng
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Sử dụng useEffect để gọi API khi component được render
    useEffect(() => {
        const fetchFloors = async () => {
            try {
                // Gọi API GET /api/tang 
                const response = await axios.get(`${API_BASE_URL}/tang`);
                
                // Cập nhật state với dữ liệu Tầng nhận được
                setFloors(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải danh sách Tầng:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchFloors();
    }, []); 

    // 3. Hiển thị trạng thái tải và lỗi
    if (loading) {
        return <div className="p-6 text-center text-blue-500">Đang tải danh sách Tầng...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API: {error}. Vui lòng kiểm tra Server BE (http://localhost:5000).
        </div>;
    }

    // 4. Hiển thị danh sách Tầng
    return (
        <div className="floor-list mt-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Tổng số Tầng: {floors.length}</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã Tầng (MaTang)</th>
                        <th className="py-2 px-4 border-b text-left">Tên Block</th>
                        <th className="py-2 px-4 border-b text-left">Số Tầng (SoTang)</th>
                    </tr>
                </thead>
                <tbody>
                    {floors.map((floor) => (
                        <tr key={floor.MaTang} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{floor.MaTang}</td>
                            
                            {/* Dựa trên CSDL[cite: 6, 7], chúng ta cần hiển thị TenBlock.
                              Tôi giả định API /api/tang đã JOIN và trả về TenBlock.
                              Nếu API chỉ trả về MaBlock, bạn có thể thay 'floor.TenBlock' thành 'floor.MaBlock'.
                            */}
                            <td className="py-2 px-4 border-b font-medium">
                                {floor.TenBlock || `Block (ID: ${floor.MaBlock})`}
                            </td>
                            
                            <td className="py-2 px-4 border-b">{floor.SoTang}</td>
                        </tr>
                    ))}
                    
                    {floors.length === 0 && (
                        <tr>
                            <td colSpan="3" className="py-4 text-center text-gray-500">
                                🏢 Chưa có dữ liệu về Tầng.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default FloorList;