import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

// --- THAY ĐỔI 1: Nhận prop 'onRowClick' ---
const InvoiceList = ({ onRowClick }) => {
    // 1. Khai báo state để lưu trữ danh sách Hóa đơn
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Sử dụng useEffect để gọi API khi component được render
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                // Gọi API GET /api/hoadon
                const response = await axios.get(`${API_BASE_URL}/hoadon`);
                
                // Cập nhật state với dữ liệu Hóa đơn nhận được
                setInvoices(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải danh sách Hóa đơn:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []); 

    // ... (Các hàm formatDate, formatBillingPeriod, formatCurrency không đổi) ...
    // Hàm tiện ích để định dạng ngày (ví dụ: 2025-10-30T... -> 30/10/2025)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN').format(date);
    };

    // Hàm tiện ích để định dạng kỳ (ví dụ: 2025-10-01T... -> 10/2025)
    const formatBillingPeriod = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Hàm tiện ích để định dạng tiền tệ (ví dụ: 500000 -> 500,000 đ)
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'N/A';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };


    // 3. Hiển thị trạng thái tải và lỗi
    if (loading) {
        return <div className="p-6 text-center text-blue-500">Đang tải danh sách Hóa đơn...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API: {error}. Vui lòng kiểm tra Server BE (http://localhost:5000).
        </div>;
    }

    // 4. Hiển thị danh sách Hóa đơn
    return (
        <div className="invoice-list mt-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Tổng số Hóa đơn: {invoices.length}</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    {/* ... (Phần <tr> <th> không đổi) ... */}
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã HĐ</th>
                        <th className="py-2 px-4 border-b text-left">Căn Hộ</th>
                        <th className="py-2 px-4 border-b text-left">Kỳ Hóa Đơn</th>
                        <th className="py-2 px-4 border-b text-left">Tổng Tiền</th>
                        <th className="py-2 px-4 border-b text-left">Ngày Phát Hành</th>
                        <th className="py-2 px-4 border-b text-left">Ngày Hết Hạn</th>
                        <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice) => (
                        // --- THAY ĐỔI 2: Thêm class và sự kiện onClick cho <tr> ---
                        <tr 
                            key={invoice.MaHoaDon} 
                            className={`hover:bg-gray-100 ${onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onRowClick && onRowClick(invoice.MaHoaDon)}
                        >
                            <td className="py-2 px-4 border-b">{invoice.MaHoaDon}</td>
                            
                            <td className="py-2 px-4 border-b font-medium">
                                {invoice.SoCanHo || `(Mã CH: ${invoice.MaCanHo})`}
                            </td>
                            
                            <td className="py-2 px-4 border-b">{formatBillingPeriod(invoice.KyThang)}</td>
                            <td className="py-2 px-4 border-b font-semibold text-red-600">{formatCurrency(invoice.TongTien)}</td>
                            <td className="py-2 px-4 border-b">{formatDate(invoice.NgayPhatHanh)}</td>
                            <td className="py-2 px-4 border-b">{formatDate(invoice.NgayDenHan)}</td>
                            
                            <td className="py-2 px-4 border-b">
                                {invoice.TenTrangThai || 'Chờ thanh toán'}
                            </td>
                        </tr>
                    ))}
                    
                    {/* ... (Phần "Chưa có dữ liệu" không đổi) ... */}
                     {invoices.length === 0 && (
                        <tr>
                            <td colSpan="7" className="py-4 text-center text-gray-500">
                                🧾 Chưa có dữ liệu về Hóa đơn.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InvoiceList;