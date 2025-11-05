import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

const ContractList = () => {
    // 1. Khai báo state để lưu trữ danh sách Hợp đồng
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Sử dụng useEffect để gọi API khi component được render
    useEffect(() => {
        const fetchContracts = async () => {
            try {
                // Gọi API GET /api/hopdong
                const response = await axios.get(`${API_BASE_URL}/hopdong`);
                
                // Cập nhật state với dữ liệu Hợp đồng nhận được
                setContracts(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải danh sách Hợp đồng:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchContracts();
    }, []); 

    // Hàm tiện ích để định dạng ngày (ví dụ: 2025-10-30T00:00:00.000Z -> 30/10/2025)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('vi-VN').format(date);
        } catch (error) {
            console.error("Lỗi định dạng ngày:", dateString, error);
            return 'Ngày lỗi';
        }
    };

    // 3. Hiển thị trạng thái tải và lỗi
    if (loading) {
        return <div className="p-6 text-center text-blue-500">Đang tải danh sách Hợp đồng...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API: {error}. Vui lòng kiểm tra Server BE (http://localhost:5000).
        </div>;
    }

    // 4. Hiển thị danh sách Hợp đồng
    return (
        <div className="contract-list mt-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Tổng số Hợp đồng: {contracts.length}</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã HĐ</th>
                        <th className="py-2 px-4 border-b text-left">Loại Hợp Đồng</th>
                        <th className="py-2 px-4 border-b text-left">Chủ Hộ</th>
                        <th className="py-2 px-4 border-b text-left">Căn Hộ</th>
                        <th className="py-2 px-4 border-b text-left">Ngày Ký</th>
                        <th className="py-2 px-4 border-b text-left">Ngày Hết Hạn</th>
                    </tr>
                </thead>
                <tbody>
                    {contracts.map((contract) => (
                        <tr key={contract.MaHopDong} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{contract.MaHopDong}</td>
                            <td className="py-2 px-4 border-b font-medium">{contract.Loai}</td>
                            
                            {/* Giả định API /api/hopdong đã JOIN và trả về TenChuHo và SoCanHo */}
                            <td className="py-2 px-4 border-b">
                                {contract.TenChuHo || `(Mã ND: ${contract.ChuHoId})`}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {contract.SoCanHo || `(Mã CH: ${contract.MaCanHo})`}
                            </td>
                            
                            <td className="py-2 px-4 border-b">{formatDate(contract.NgayKy)}</td>
                            <td className="py-2 px-4 border-b">{formatDate(contract.NgayHetHan)}</td>
                        </tr>
                    ))}
                    
                    {contracts.length === 0 && (
                        <tr>
                            <td colSpan="6" className="py-4 text-center text-gray-500">
                                📜 Chưa có dữ liệu về Hợp đồng.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ContractList;