import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apartmentService } from '../services/apartmentService';
import AddResidentForm from '../components/AddResidentForm'; 
import toast, { Toaster } from 'react-hot-toast';

// --- HÀM TIỆN ÍCH ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
};
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue) || numericValue === 0) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericValue);
};

// --- COMPONENT THẺ CƯ DÂN ---
const ResidentCard = ({ resident }) => (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
            <div className='flex items-center gap-3'>
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {resident.HoTen.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{resident.HoTen}</p>
                    <p className="text-xs text-gray-500">ID: {resident.MaNguoiDung}</p>
                </div>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${resident.VaiTroCuTru.includes('Chủ hộ') || resident.VaiTroCuTru.includes('Người thuê') ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                {resident.VaiTroCuTru}
            </span>
        </div>
        <div className="mt-3 text-sm space-y-1">
            <p className="text-gray-600">SĐT: {resident.SoDienThoai}</p>
            <p className="text-gray-600">Email: {resident.Email}</p>
            <p className="text-gray-600 text-xs">Từ: {formatDate(resident.TuNgay)} - Đến: {resident.DenNgay ? formatDate(resident.DenNgay) : 'Hiện tại'}</p>
        </div>
    </div>
);


function ApartmentDetailPage() {
    const { id } = useParams();
    const [apartment, setApartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApartmentDetails = async () => {
        setLoading(true);
        try {
            // Gọi API tổng hợp mới
            const data = await apartmentService.getApartmentDetailsForStaff(id);
            setApartment(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Không thể tải chi tiết căn hộ.');
            toast.error('Lỗi: Không thể tải chi tiết căn hộ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApartmentDetails();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu căn hộ...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
    if (!apartment) return null;


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Toaster position="top-right" />
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Chi Tiết Căn Hộ: {apartment.SoCanHo}
                <span className="text-base font-medium text-gray-500 ml-3">({apartment.TenBlock} - Tầng {apartment.SoTang})</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột 1 & 2: Thông tin chi tiết */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* 1. THÔNG TIN CƠ BẢN VÀ TRẠNG THÁI */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <h2 className="text-2xl font-semibold text-blue-600 mb-4 border-b pb-2">Thông tin Cơ bản</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <p className="font-medium text-gray-700">Loại Căn hộ:</p>
                            <p className="text-gray-900 font-bold">{apartment.LoaiCanHo || 'Chưa xác định'}</p>
                            
                            <p className="font-medium text-gray-700">Giới hạn Cư trú Max:</p>
                            <p className="text-gray-900 font-bold text-red-600">{apartment.ResidentLimit.Max} người</p>
                            
                            <p className="font-medium text-gray-700">Diện tích:</p>
                            <p className="text-gray-900">{apartment.DienTich} m²</p>
                            
                            <p className="font-medium text-gray-700">Trạng thái hiện tại:</p>
                            <p className={`font-bold ${apartment.MaTrangThai === 8 ? 'text-green-600' : 'text-orange-600'}`}>{apartment.TenTrangThai}</p>
                        </div>
                    </div>

                    {/* 2. THÔNG TIN HỢP ĐỒNG & CHỦ HỘ CHÍNH */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <h2 className="text-2xl font-semibold text-indigo-600 mb-4 border-b pb-2">Hợp đồng & Chủ/Thuê Chính</h2>
                        {apartment.MaHopDong ? (
                            <div className="space-y-3 text-sm">
                                <p className={`font-bold text-lg ${apartment.LoaiHopDong === 'Mua/Bán' ? 'text-green-700' : 'text-red-700'}`}>
                                    Loại Hợp đồng: {apartment.LoaiHopDong} (Mã HĐ: {apartment.MaHopDong})
                                </p>
                                <p><strong>Chủ/Thuê Chính:</strong> {apartment.TenChuHo} (ID: {apartment.BenB_Id})</p>
                                <p><strong>SĐT/Email:</strong> {apartment.SDTChuHo || 'N/A'} / {apartment.EmailChuHo || 'N/A'}</p>
                                <p><strong>Ngày Hết Hạn:</strong> {formatDate(apartment.NgayHetHan)}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Căn hộ này chưa có Hợp đồng chính đang có hiệu lực.</p>
                        )}
                    </div>
                    
                    {/* 3. THÔNG TIN LISTING (Nếu có) */}
                    {apartment.IsAvailableForRent === 1 && (
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                            <h2 className="text-2xl font-semibold text-yellow-600 mb-4 border-b pb-2">Thông tin Listing (Cho thuê)</h2>
                            <div className="space-y-3 text-sm">
                                <p><strong>Giá Thuê:</strong> <span className='font-bold text-xl text-red-600'>{formatCurrency(apartment.RentPrice)}/tháng</span></p>
                                <p><strong>Mô tả:</strong> {apartment.ListingDescription || 'Chưa có mô tả chi tiết.'}</p>
                            </div>
                        </div>
                    )}
                    
                    {/* (Giả định): Phần Hiển thị Hóa đơn, Yêu cầu sẽ nằm ở đây */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <h2 className="text-2xl font-semibold text-purple-600 mb-4 border-b pb-2">Dịch vụ & Yêu cầu</h2>
                        <p className='text-sm text-gray-500'>*Các mục này sẽ được triển khai chi tiết trong Module tiếp theo (Yêu cầu & Tài chính).</p>
                    </div>

                </div>

                {/* Cột 3: Quản lý Cư dân */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* FORM THÊM CƯ DÂN */}
                    <AddResidentForm 
                        apartmentId={parseInt(id)} 
                        onMemberAdded={fetchApartmentDetails} // Hàm làm mới dữ liệu
                        currentLimit={apartment.ResidentLimit}
                    />

                    {/* DANH SÁCH CƯ DÂN HIỆN TẠI */}
                    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
                        <h2 className="text-2xl font-semibold text-green-600 mb-4 border-b pb-2">
                            Cư dân Đang ở 
                        </h2>
                        <span className='text-sm text-gray-500'>({apartment.ResidentLimit.Current} / {apartment.ResidentLimit.Max})</span>
                        {apartment.ActiveResidents.length > 0 ? (
                            <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-2">
                                {apartment.ActiveResidents.map(resident => (
                                    <ResidentCard key={resident.MaLichSu} resident={resident} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mt-4">Căn hộ chưa có cư dân nào được ghi nhận đang cư trú.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApartmentDetailPage;