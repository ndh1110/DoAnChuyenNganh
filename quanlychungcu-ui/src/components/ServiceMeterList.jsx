import React from 'react';

// Hàm helper (từ file cũ của bạn)
const formatBillingPeriod = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `Kỳ ${date.getMonth() + 1}/${date.getFullYear()}`;
};

/**
 * Component "Ngốc" (Dumb Component)
 * - KHÔNG tự gọi API.
 * - Chỉ nhận props 'meters' và 'isLoading' từ cha (InvoicesPage).
 */
function ServiceMeterList({ meters, isLoading }) {

    if (isLoading) {
        return <div className="p-4 text-center text-blue-500">Đang tải lịch sử ghi chỉ số...</div>;
    }

    return (
        <div className="service-meter-list mt-8 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Lịch sử Ghi Chỉ số Dịch vụ ({meters.length})</h2>
            
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
                    {/* Lặp qua props 'meters' */}
                    {meters.map((meter) => (
                        <tr key={meter.MaChiSo} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{meter.MaChiSo}</td>
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