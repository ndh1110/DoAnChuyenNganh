import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const WorkScheduleList = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                // Gọi API GET /api/lichtruc
                const response = await axios.get(`${API_BASE_URL}/lichtruc`);
                setSchedules(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải Lịch trực:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchSchedules();
    }, []); 

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString));
    };

    if (loading) return <div className="p-4 text-center text-blue-500">Đang tải lịch trực...</div>;
    if (error) return <div className="p-4 text-red-600 text-center font-semibold">❌ Lỗi API Lịch trực: {error}.</div>;

    return (
        <div className="work-schedule-list mt-8 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Lịch Trực Nhân Viên ({schedules.length})</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã Lịch</th>
                        <th className="py-2 px-4 border-b text-left">Nhân Viên</th>
                        <th className="py-2 px-4 border-b text-left">Ngày Trực</th>
                        <th className="py-2 px-4 border-b text-left">Ca Trực</th>
                        <th className="py-2 px-4 border-b text-left">Ghi Chú</th>
                    </tr>
                </thead>
                <tbody>
                    {schedules.map((sch) => (
                        <tr key={sch.MaLichTruc} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{sch.MaLichTruc}</td>
                            {/* Giả định API /api/lichtruc đã JOIN và trả về HoTen */}
                            <td className="py-2 px-4 border-b font-medium">
                                {sch.HoTen || `(Mã NV: ${sch.MaNhanVien})`}
                            </td>
                            <td className="py-2 px-4 border-b">{formatDate(sch.Ngay)}</td>
                            <td className="py-2 px-4 border-b">{sch.Ca}</td>
                            <td className="py-2 px-4 border-b">{sch.GhiChu}</td>
                        </tr>
                    ))}
                    {schedules.length === 0 && (
                        <tr>
                            <td colSpan="5" className="py-4 text-center text-gray-500">
                                🗓️ Chưa có lịch trực nào được xếp.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default WorkScheduleList;