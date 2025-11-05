import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend
const API_BASE_URL = 'http://localhost:5000/api';

const EmployeeList = () => {
    // 1. Khai báo state để lưu trữ danh sách Nhân viên
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Sử dụng useEffect để gọi API khi component được render
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                // Gọi API GET /api/nhanvien
                const response = await axios.get(`${API_BASE_URL}/nhanvien`);
                
                // Cập nhật state với dữ liệu Nhân viên nhận được
                setEmployees(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải danh sách Nhân viên:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []); 

    // 3. Hiển thị trạng thái tải và lỗi
    if (loading) {
        return <div className="p-6 text-center text-blue-500">Đang tải danh sách Nhân viên...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600 text-center font-semibold">
            ❌ Lỗi kết nối API: {error}. Vui lòng kiểm tra Server BE (http://localhost:5000).
        </div>;
    }

    // 4. Hiển thị danh sách Nhân viên
    return (
        <div className="employee-list mt-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Tổng số Nhân viên: {employees.length}</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã NV</th>
                        <th className="py-2 px-4 border-b text-left">Họ Tên</th>
                        <th className="py-2 px-4 border-b text-left">Email</th>
                        <th className="py-2 px-4 border-b text-left">Chức Vụ</th>
                        <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp) => (
                        <tr key={emp.MaNhanVien} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{emp.MaNhanVien}</td>
                            
                            {/* Giả định API /api/nhanvien đã JOIN với NguoiDung để lấy HoTen, Email */}
                            <td className="py-2 px-4 border-b font-medium">
                                {emp.HoTen || `(Mã ND: ${emp.MaNguoiDung})`}
                            </td>
                            <td className="py-2 px-4 border-b text-sm">{emp.Email || 'N/A'}</td>
                            
                            {/* Dữ liệu từ bảng NhanVien */}
                            <td className="py-2 px-4 border-b">{emp.ChucVu}</td> 
                            <td className="py-2 px-4 border-b">{emp.TrangThai || 'Active'}</td>
                        </tr>
                    ))}
                    
                    {employees.length === 0 && (
                        <tr>
                            <td colSpan="5" className="py-4 text-center text-gray-500">
                                👷‍♂️ Chưa có nhân viên nào trong hệ thống.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeList;