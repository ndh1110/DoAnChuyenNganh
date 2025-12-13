import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api'; 

const AddResidentForm = ({ apartmentId, onMemberAdded, currentLimit }) => {
    // Giả định user nhập MaNguoiDung (ID người dùng đã tồn tại)
    const [formData, setFormData] = useState({
        MaCanHo: apartmentId,
        MaNguoiDung: '', 
        VaiTroCuTru: 'Thành viên gia đình', 
        TuNgay: new Date().toISOString().split('T')[0], 
        DenNgay: '', 
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'MaNguoiDung' ? parseInt(value) || '' : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSend = {
                ...formData,
                DenNgay: formData.DenNgay === '' ? null : formData.DenNgay,
                MaNguoiDung: parseInt(formData.MaNguoiDung), // Đảm bảo là số
            };
            
            if (isNaN(dataToSend.MaNguoiDung)) {
                toast.error("Mã Người Dùng không hợp lệ.");
                return;
            }

            // Gọi API mới: POST /api/lichsucutru/add-member
            const response = await api.post('/lichsucutru/add-member', dataToSend);
            toast.success(response.data.message);
            onMemberAdded(); // Gọi hàm làm mới dữ liệu trên trang cha
            
            // Reset form
            setFormData(prev => ({
                 ...prev,
                 MaNguoiDung: '',
                 DenNgay: ''
            }));

        } catch (error) {
            // Xử lý lỗi từ Backend (bao gồm cả lỗi kiểm tra giới hạn 400 Bad Request)
            const errorMessage = error.response?.data?.message || error.response?.data || "Lỗi khi thêm cư dân. Kiểm tra MaNguoiDung và giới hạn.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const limitInfo = currentLimit ? 
        `${currentLimit.Current}/${currentLimit.Max} người (${currentLimit.LoaiCanHo})` : 'Đang tải giới hạn...';

    const isLimitExceeded = currentLimit && currentLimit.Current >= currentLimit.Max;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Đăng ký Thành viên Cư trú
            </h3>
            <div className={`text-sm mb-4 font-bold ${isLimitExceeded ? 'text-red-600' : 'text-green-600'}`}>
                Giới hạn Cư trú: {limitInfo}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col">
                    <label htmlFor="MaNguoiDung" className="text-sm font-medium text-gray-700">Mã Người Dùng (ID) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        id="MaNguoiDung"
                        name="MaNguoiDung"
                        value={formData.MaNguoiDung}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập ID người dùng (vd: 1, 5, 12)"
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="VaiTroCuTru" className="text-sm font-medium text-gray-700">Vai trò Cư trú</label>
                    <select
                        id="VaiTroCuTru"
                        name="VaiTroCuTru"
                        value={formData.VaiTroCuTru}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="Thành viên gia đình">Thành viên gia đình</option>
                        <option value="Người giúp việc">Người giúp việc</option>
                        <option value="Khách lâu dài">Khách lâu dài</option>
                    </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="TuNgay" className="text-sm font-medium text-gray-700">Ngày Bắt đầu <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            id="TuNgay"
                            name="TuNgay"
                            value={formData.TuNgay}
                            onChange={handleChange}
                            required
                            className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="DenNgay" className="text-sm font-medium text-gray-700">Ngày Kết thúc (Nếu có)</label>
                        <input
                            type="date"
                            id="DenNgay"
                            name="DenNgay"
                            value={formData.DenNgay}
                            onChange={handleChange}
                            className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || isLimitExceeded}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Đang thêm...' : (isLimitExceeded ? '🚫 Đã đạt giới hạn' : 'Thêm Cư dân')}
                </button>
            </form>
        </div>
    );
};

export default AddResidentForm;