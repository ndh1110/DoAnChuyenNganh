// src/pages/ApartmentDetailPage.jsx (PHIÊN BẢN ĐÃ FIX LỖI CRASH 'LENGTH')

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { blockService } from "../services/blockService";
import AddResidentForm from '../components/AddResidentForm'; 
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api'; 

const API_URL = 'http://localhost:5000/'; 

// --- HÀM TIỆN ÍCH ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString.split('T')[0]); 
    return date.toLocaleDateString('vi-VN');
};

const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue) || numericValue === 0) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericValue);
};

// --- COMPONENT MODAL CẬP NHẬT/GIA HẠN CƯ DÂN ---
const UpdateResidentModal = ({ isOpen, onClose, resident, onUpdated, currentApartmentId }) => {
    const [vaiTro, setVaiTro] = useState('');
    const [denNgay, setDenNgay] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (resident) {
            setVaiTro(resident.VaiTroCuTru || '');
            setDenNgay(resident.DenNgay ? resident.DenNgay.split('T')[0] : '');
        }
    }, [resident]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            MaNguoiDung: resident.MaNguoiDung,
            MaCanHo: currentApartmentId, 
            TuNgay: resident.TuNgay.split('T')[0], 
            DenNgay: denNgay, 
            VaiTroCuTru: vaiTro
        };

        try {
            await api.put(`/lichsucutru/${resident.MaLichSu}`, payload);
            toast.success("Gia hạn/Cập nhật thành công!");
            onUpdated(); 
            onClose();
        } catch (err) {
            toast.error("Lỗi cập nhật: " + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !resident) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Gia hạn / Cập nhật cư dân: {resident.HoTen}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Vai trò cư trú</label>
                        <select
                            value={vaiTro}
                            onChange={(e) => setVaiTro(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="Chủ hộ">Chủ hộ</option>
                            <option value="Cư dân thuê">Cư dân thuê</option>
                            <option value="Thành viên gia đình">Thành viên gia đình</option>
                            <option value="Người giúp việc">Người giúp việc</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Ngày Kết thúc (Gia hạn)</label>
                        <input
                            type="date"
                            value={denNgay}
                            onChange={(e) => setDenNgay(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Để trống nếu cư trú vô thời hạn.</p>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">Hủy</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">
                            {loading ? 'Đang cập nhật...' : 'Lưu Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- COMPONENT THẺ CƯ DÂN ---
const ResidentCard = ({ resident, onUpdateRequested, onEditRequested }) => {
    const handleEndResidency = async () => {
        if (!window.confirm(`Xác nhận cư dân ${resident.HoTen} đã chuyển đi?`)) return;
        try {
            await api.put(`/lichsucutru/end/${resident.MaLichSu}`);
            toast.success(`Đã xác nhận ${resident.HoTen} chuyển đi.`);
            onUpdateRequested(); 
        } catch (err) {
            toast.error(err.response?.data || "Lỗi khi kết thúc cư trú.");
        }
    };
    
    const isCurrentlyActive = resident.DenNgay === null || new Date(resident.DenNgay) >= new Date(new Date().toDateString());
    const isOwner = resident.VaiTroCuTru.includes('Chủ hộ');

    return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
                {isCurrentlyActive && (
                    <div className="flex gap-2">
                        <button onClick={() => onEditRequested(resident)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Sửa / Gia hạn">📝</button>
                        <button 
                            onClick={isOwner ? null : handleEndResidency}
                            disabled={isOwner}
                            className={`p-1.5 rounded ${isOwner ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                            title={isOwner ? "Chủ hộ phải thực hiện chuyển nhượng" : "Xác nhận chuyển đi"}
                        >
                            🚪
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-3 text-sm space-y-1 border-t pt-2">
                <p className={`font-medium ${isOwner ? 'text-blue-600' : 'text-gray-600'}`}>Vai trò: {resident.VaiTroCuTru}</p>
                <p className="text-gray-500 text-xs italic">
                    Ở từ: {formatDate(resident.TuNgay)} 
                    - Đến: {resident.DenNgay ? formatDate(resident.DenNgay) : 'Vô thời hạn'}
                    {!isCurrentlyActive && <span className="text-xs text-red-500 font-bold ml-2">(Đã chuyển đi)</span>}
                </p>
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
function ApartmentDetailPage() {
    const { id } = useParams();
    const apartmentId = parseInt(id);

    const [apartmentDetails, setApartmentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [residentToUpdate, setResidentToUpdate] = useState(null);
    
    const fetchApartmentDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await blockService.getApartmentInfo(apartmentId);
            setApartmentDetails(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Không thể tải chi tiết căn hộ.');
        } finally {
            setLoading(false);
        }
    }, [apartmentId]);

    useEffect(() => {
        if (!isNaN(apartmentId)) {
            fetchApartmentDetails();
        }
    }, [fetchApartmentDetails]);
    
    const handleOpenUpdateModal = (resident) => {
        setResidentToUpdate(resident);
        setIsUpdateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setResidentToUpdate(null);
        setIsUpdateModalOpen(false);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu căn hộ...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
    if (!apartmentDetails) return null;
    
    const apartment = apartmentDetails; 

    // --- FIX LỖI CRASH Ở ĐÂY ---
    // Đảm bảo ActiveResidents luôn là mảng, kể cả khi API trả về null/undefined
    const safeActiveResidents = Array.isArray(apartment.ActiveResidents) ? apartment.ActiveResidents : [];

    // Kiểm tra cảnh báo (Dùng biến safeActiveResidents thay vì apartment.ActiveResidents)
    if (safeActiveResidents.length > 0 && safeActiveResidents.some(r => r.VaiTroCuTru.includes('Chủ hộ')) && apartment.MaHopDong === null) {
        // Có thể bật toast cảnh báo ở đây nếu muốn
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Toaster position="top-right" />
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Chi Tiết Căn Hộ: {apartment.SoCanHo}
                <span className="text-base font-medium text-gray-500 ml-3">({apartment.TenBlock} - Tầng {apartment.SoTang})</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* THÔNG TIN CƠ BẢN */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <h2 className="text-2xl font-semibold text-blue-600 mb-4 border-b pb-2">Thông tin Cơ bản</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <p className="font-medium text-gray-700">Loại Căn hộ:</p>
                            <p className="text-gray-900 font-bold">{apartment.LoaiCanHo || 'Chưa xác định'}</p>
                            
                            <p className="font-medium text-gray-700">Giới hạn Cư trú Max:</p>
                            <p className="text-gray-900 font-bold text-red-600">
                                {apartment.ResidentLimit?.Max || 0} người
                            </p>
                            
                            <p className="font-medium text-gray-700">Diện tích:</p>
                            <p className="text-gray-900">{apartment.DienTich} m²</p>
                            
                            <p className="font-medium text-gray-700">Trạng thái:</p>
                            <p className={`font-bold ${apartment.MaTrangThai === 8 ? 'text-green-600' : 'text-orange-600'}`}>{apartment.TenTrangThai}</p>
                        </div>
                    </div>

                    {/* HỢP ĐỒNG */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <h2 className="text-2xl font-semibold text-indigo-600 mb-4 border-b pb-2">Hợp đồng & Chủ/Thuê Chính</h2>
                        {apartment.MaHopDong ? (
                            <div className="space-y-3 text-sm">
                                <p className={`font-bold text-lg ${apartment.LoaiHopDong === 'Mua/Bán' ? 'text-green-700' : 'text-red-700'}`}>
                                    Loại HĐ: {apartment.LoaiHopDong} (Mã: {apartment.MaHopDong})
                                </p>
                                <p><strong>Chủ/Thuê Chính:</strong> {apartment.TenChuHo} (ID: {apartment.BenB_Id})</p>
                                <p><strong>SĐT/Email:</strong> {apartment.SDTChuHo || 'N/A'} / {apartment.EmailChuHo || 'N/A'}</p>
                                <p><strong>Hết Hạn:</strong> {formatDate(apartment.NgayHetHan)}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Căn hộ này chưa có Hợp đồng chính đang hiệu lực.</p>
                        )}
                    </div>
                    
                    {/* LISTING (NẾU CÓ) */}
                    {apartment.IsAvailableForRent === 1 && (
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                            <h2 className="text-2xl font-semibold text-yellow-600 mb-4 border-b pb-2">Thông tin Listing (Cho thuê)</h2>
                            <div className="space-y-3 text-sm">
                                <p><strong>Giá Thuê:</strong> <span className='font-bold text-xl text-red-600'>{formatCurrency(apartment.RentPrice)}/tháng</span></p>
                                <p><strong>Mô tả:</strong> {apartment.ListingDescription || 'Chưa có mô tả.'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* QUẢN LÝ CƯ DÂN */}
                <div className="lg:col-span-1 space-y-6">
                    <AddResidentForm 
                        apartmentId={apartmentId} 
                        onMemberAdded={fetchApartmentDetails} 
                        currentLimit={apartment.ResidentLimit}
                    />

                    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
                        <h2 className="text-2xl font-semibold text-green-600 mb-4 border-b pb-2">
                            Cư dân Đang ở 
                        </h2>
                        <span className='text-sm text-gray-500'>
                            ({apartment.ResidentLimit?.Current || 0} / {apartment.ResidentLimit?.Max || 0})
                        </span>
                        
                        {/* DÙNG BIẾN AN TOÀN safeActiveResidents */}
                        {safeActiveResidents.length > 0 ? (
                            <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-2">
                                {safeActiveResidents.map(resident => (
                                    <ResidentCard 
                                        key={resident.MaLichSu} 
                                        resident={resident} 
                                        onUpdateRequested={fetchApartmentDetails} 
                                        onEditRequested={handleOpenUpdateModal}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mt-4">Chưa có cư dân nào đang cư trú.</p>
                        )}
                    </div>
                </div>
            </div>
            
            <UpdateResidentModal
                isOpen={isUpdateModalOpen}
                onClose={handleCloseUpdateModal}
                resident={residentToUpdate}
                onUpdated={fetchApartmentDetails}
                currentApartmentId={apartmentId} 
            />
        </div>
    );
}

export default ApartmentDetailPage;