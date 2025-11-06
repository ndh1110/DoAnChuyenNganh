import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

const InvoiceDetails = ({ invoiceId, onBack }) => {
    // 1. State cho chi tiết hóa đơn, lịch sử thanh toán, và loading/error
    const [details, setDetails] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. useEffect gọi cả hai API khi invoiceId thay đổi
    useEffect(() => {
        if (!invoiceId) return;

        const fetchDetailsAndPayments = async () => {
            setLoading(true);
            setError(null);
            try {
                // Gọi API 1: GET /api/hoadon/:id
                // Giả định API này trả về chi tiết hóa đơn (vd: { MaHoaDon, TongTien, lineItems: [...] })
                const detailsResponse = await axios.get(`${API_BASE_URL}/hoadon/${invoiceId}`);
                setDetails(detailsResponse.data);

                // Gọi API 2: GET /api/thanhtoan/hoadon/:id
                const paymentsResponse = await axios.get(`${API_BASE_URL}/thanhtoan/hoadon/${invoiceId}`);
                setPayments(paymentsResponse.data);

                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết hóa đơn hoặc thanh toán:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchDetailsAndPayments();
    }, [invoiceId]); // Chạy lại mỗi khi invoiceId thay đổi

    // Hàm tiện ích
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (dateString) => new Intl.DateTimeFormat('vi-VN').format(new Date(dateString));

    // 3. Hiển thị Loading/Error
    if (loading) {
        return <div className="p-4 text-center text-blue-500">Đang tải chi tiết hóa đơn...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API: {error}.
        </div>;
    }
    if (!details) {
        return <div className="p-4 text-center">Không tìm thấy chi tiết hóa đơn.</div>;
    }

    // Tính toán số tiền còn lại
    const totalPaid = payments.reduce((sum, p) => sum + (p.ThanhTien || 0), 0);
    const remainingAmount = (details.TongTien || 0) - totalPaid;

    // 4. Hiển thị Chi tiết và Lịch sử Thanh toán
    return (
        <div className="invoice-details mt-6 p-4 border rounded-lg bg-gray-50">
            <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Quay lại danh sách</button>
            
            <h3 className="text-2xl font-bold mb-4">Chi tiết Hóa đơn #{details.MaHoaDon}</h3>
            
            {/* Tóm tắt Hóa đơn (Từ API /hoadon/:id) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div><strong>Căn hộ:</strong> {details.SoCanHo || `(Mã: ${details.MaCanHo})`}</div>
                <div><strong>Kỳ:</strong> {formatDate(details.KyThang)}</div>
                <div className="font-bold text-lg"><strong>Tổng cộng:</strong> {formatCurrency(details.TongTien)}</div>
                <div className="font-bold text-lg text-green-600"><strong>Đã thanh toán:</strong> {formatCurrency(totalPaid)}</div>
                <div className={`font-bold text-lg ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <strong>Còn lại:</strong> {formatCurrency(remainingAmount)}
                </div>
            </div>

            {/* Bảng Chi tiết Hóa đơn (lineItems - Nếu API trả về) */}
            {/* Giả định details.lineItems là một mảng [...] */}
            {/* ... bạn có thể thêm bảng chi tiết dịch vụ ở đây ... */}

            {/* Bảng Lịch sử Thanh toán (Từ API /thanhtoan/hoadon/:id) */}
            <h4 className="text-xl font-semibold mb-3 mt-8">Lịch sử Thanh toán</h4>
            <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã TT</th>
                        <th className="py-2 px-4 border-b text-left">Ngày Thanh Toán</th>
                        <th className="py-2 px-4 border-b text-right">Số Tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.MaThanhToan}>
                            <td className="py-2 px-4 border-b">{payment.MaThanhToan}</td>
                            <td className="py-2 px-4 border-b">{formatDate(payment.NgayThanhToan)}</td>
                            <td className="py-2 px-4 border-b text-right font-medium">{formatCurrency(payment.ThanhTien)}</td>
                        </tr>
                    ))}
                    {payments.length === 0 && (
                        <tr>
                            <td colSpan="3" className="py-4 text-center text-gray-500">
                                Chưa có thanh toán nào cho hóa đơn này.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InvoiceDetails;