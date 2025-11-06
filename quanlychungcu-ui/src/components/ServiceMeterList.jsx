import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

const ServiceMeterList = () => {
    // 1. State cho Chỉ số Dịch vụ
    const [meters, setMeters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. useEffect gọi API
    useEffect(() => {
        const fetchMeters = async () => {
            try {
                // Gọi API GET /api/chisodichvu
                const response = await axios.get(`${API_BASE_URL}/chisodichvu`);
                setMeters(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải Chỉ số Dịch vụ:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchMeters();
    }, []); 

    // 3. Hàm tiện ích
    const formatBillingPeriod = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return `Kỳ ${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // 4. Hiển thị Loading/Error
    if (loading) {
        return <div className="p-4 text-center text-blue-500">Đang tải lịch sử ghi chỉ số...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API Chỉ số: {error}.
        </div>;
    }

    // 5. Hiển thị Bảng chỉ số
    return (
        <div className="service-meter-list mt-8 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Lịch sử Ghi Chỉ số Dịch vụ</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã Ghi</th>
                        <th className="py-2 px-4 border-b text-left">Căn Hộ</th>
                        <th className="py-2 px-4 border-b text-left">Dịch Vụ</th>
                        <th className="py-2 px-4 border-b text-left">Kỳ Ghi</th>
                        <th className="py-2 px-4 border-b text-right">Chỉ số Cũ</th>
                        <th className="py-2 px-4 border-b text-right">Chỉ số Mới</th>
                    </tr>
                </thead>
                <tbody>
                    {meters.map((meter) => (
                        <tr key={meter.MaChiSo} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{meter.MaChiSo}</td>
                            
                            {/* Giả định API /api/chisodichvu đã JOIN và trả về SoCanHo, TenDichVu */}
                            <td className="py-2 px-4 border-b font-medium">
                                {meter.SoCanHo || `(Mã CH: ${meter.MaCanHo})`}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {meter.TenDichVu || `(Mã DV: ${meter.MaDichVu})`}
                            </td>
                            
                            <td className="py-2 px-4 border-b">{formatBillingPeriod(meter.KyThang)}</td>
                            <td className="py-2 px-4 border-b text-right">{meter.ChiSoCu}</td>
                            <td className="py-2 px-4 border-b text-right font-semibold">{meter.ChiSoMoi}</td>
                        </tr>
                    ))}
                    {meters.length === 0 && (
                        <tr>
                            <td colSpan="6" className="py-4 text-center text-gray-500">
                                📊 Chưa có chỉ số dịch vụ nào được ghi.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ServiceMeterList;