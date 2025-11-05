import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

const ServiceList = () => {
    // 1. Khai báo state để lưu trữ danh sách Dịch vụ
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Sử dụng useEffect để gọi API khi component được render
    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Gọi API GET /api/dichvu
                const response = await axios.get(`${API_BASE_URL}/dichvu`);
                
                // Cập nhật state với dữ liệu Dịch vụ nhận được
                setServices(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải danh sách Dịch vụ:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchServices();
    }, []); 

    // 3. Hiển thị trạng thái tải và lỗi
    if (loading) {
        return <div className="p-6 text-center text-blue-500">Đang tải danh sách Dịch vụ...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API: {error}. Vui lòng kiểm tra Server BE (http://localhost:5000).
        </div>;
    }

    // 4. Hiển thị danh sách Dịch vụ
    return (
        <div className="service-list mt-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Tổng số Dịch vụ: {services.length}</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã DV</th>
                        <th className="py-2 px-4 border-b text-left">Tên Dịch Vụ</th>
                        <th className="py-2 px-4 border-b text-left">Kiểu Tính Phí</th>
                        <th className="py-2 px-4 border-b text-left">Đơn Vị Tính</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service) => (
                        <tr key={service.MaDichVu} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{service.MaDichVu}</td>
                            <td className="py-2 px-4 border-b font-medium">{service.TenDichVu}</td>
                            {/* KieuTinh: 'FIXED' (Cố định) hoặc 'METERED' (Theo đồng hồ) [cite: 1919] */}
                            <td className="py-2 px-4 border-b">
                                {service.KieuTinh === 'FIXED' ? 'Cố định' : 'Theo đồng hồ'}
                            </td>
                            {/* DonViMacDinh: 'kWh', 'm³', 'tháng' [cite: 1919] */}
                            <td className="py-2 px-4 border-b">{service.DonViMacDinh}</td>
                        </tr>
                    ))}
                    
                    {services.length === 0 && (
                        <tr>
                            <td colSpan="4" className="py-4 text-center text-gray-500">
                                🔌 Chưa có dịch vụ nào được cấu hình.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ServiceList;