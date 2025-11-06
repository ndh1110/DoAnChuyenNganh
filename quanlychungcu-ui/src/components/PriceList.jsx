import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

const PriceList = () => {
    // 1. State cho Bảng giá
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. useEffect gọi API
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // Gọi API GET /api/banggia
                const response = await axios.get(`${API_BASE_URL}/banggia`);
                setPrices(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải Bảng giá:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchPrices();
    }, []); 

    // 3. Hàm tiện ích
    const formatDate = (dateString) => {
        if (!dateString) return 'Vô thời hạn';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN').format(date);
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'N/A';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // 4. Hiển thị Loading/Error
    if (loading) {
        return <div className="p-4 text-center text-blue-500">Đang tải bảng giá...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API Bảng giá: {error}.
        </div>;
    }

    // 5. Hiển thị Bảng giá
    return (
        <div className="price-list mt-8 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Bảng Giá Dịch Vụ</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã Bảng Giá</th>
                        <th className="py-2 px-4 border-b text-left">Tên Dịch Vụ</th>
                        <th className="py-2 px-4 border-b text-left">Đơn Giá (VND)</th>
                        <th className="py-2 px-4 border-b text-left">Hiệu lực Từ</th>
                        <th className="py-2 px-4 border-b text-left">Hiệu lực Đến</th>
                    </tr>
                </thead>
                <tbody>
                    {prices.map((price) => (
                        <tr key={price.MaBangGia} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{price.MaBangGia}</td>
                            
                            {/* Giả định API /api/banggia đã JOIN và trả về TenDichVu */}
                            <td className="py-2 px-4 border-b font-medium">
                                {price.TenDichVu || `(Mã DV: ${price.MaDichVu})`}
                            </td>
                            
                            <td className="py-2 px-4 border-b font-semibold text-blue-700">
                                {formatCurrency(price.DonGiaBien)}
                            </td>
                            <td className="py-2 px-4 border-b">{formatDate(price.HieuLucTu)}</td>
                            <td className="py-2 px-4 border-b">{formatDate(price.HieuLucDen)}</td>
                        </tr>
                    ))}
                    {prices.length === 0 && (
                        <tr>
                            <td colSpan="5" className="py-4 text-center text-gray-500">
                                💰 Chưa có Bảng giá nào được cấu hình.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PriceList;