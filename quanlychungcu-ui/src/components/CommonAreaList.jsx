import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const CommonAreaList = () => {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                // Gọi API GET /api/khuvucchung
                const response = await axios.get(`${API_BASE_URL}/khuvucchung`);
                setAreas(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải Khu vực chung:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchAreas();
    }, []); 

    if (loading) return <div className="p-4 text-center text-blue-500">Đang tải danh sách khu vực chung...</div>;
    if (error) return <div className="p-4 text-red-600 text-center font-semibold">❌ Lỗi API Khu vực chung: {error}.</div>;

    return (
        <div className="common-area-list mt-6 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Danh sách Khu vực chung ({areas.length})</h2>
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã KVC</th>
                        <th className="py-2 px-4 border-b text-left">Tên Khu Vực</th>
                        <th className="py-2 px-4 border-b text-left">Thuộc Block</th>
                        <th className="py-2 px-4 border-b text-left">Loại</th>
                        <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
                    </tr>
                </thead>
                <tbody>
                    {areas.map((area) => (
                        <tr key={area.MaKhuVucChung} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{area.MaKhuVucChung}</td>
                            <td className="py-2 px-4 border-b font-medium">{area.Ten}</td>
                            {/* Giả định API /api/khuvucchung đã JOIN và trả về TenBlock */}
                            <td className="py-2 px-4 border-b">
                                {area.TenBlock || `(Mã Block: ${area.MaBlock})`}
                            </td>
                            <td className="py-2 px-4 border-b">{area.Loai}</td>
                            <td className="py-2 px-4 border-b">{area.TrangThai}</td>
                        </tr>
                    ))}
                    {areas.length === 0 && (
                        <tr>
                            <td colSpan="5" className="py-4 text-center text-gray-500">
                                🏞️ Chưa có khu vực chung nào được thiết lập.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CommonAreaList;