import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const TaskAssignmentList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Gọi API GET /api/phancong
                const response = await axios.get(`${API_BASE_URL}/phancong`);
                setTasks(response.data); 
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải Phân công:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchTasks();
    }, []); 

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString));
    };

    if (loading) return <div className="p-4 text-center text-blue-500">Đang tải danh sách phân công...</div>;
    if (error) return <div className="p-4 text-red-600 text-center font-semibold">❌ Lỗi API Phân công: {error}.</div>;

    return (
        <div className="task-assignment-list mt-8 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Danh Sách Phân Công ({tasks.length})</h2>
            
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Mã PC</th>
                        <th className="py-2 px-4 border-b text-left">Nhân Viên</th>
                        <th className="py-2 px-4 border-b text-left">Khu Vực</th>
                        <th className="py-2 px-4 border-b text-left">Ngày</th>
                        <th className="py-2 px-4 border-b text-left">Ca</th>
                        <th className="py-2 px-4 border-b text-left">Trạng Thái</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr key={task.MaPhanCong} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{task.MaPhanCong}</td>
                            {/* Giả định API /api/phancong đã JOIN và trả về HoTen, TenKhuVuc */}
                            <td className="py-2 px-4 border-b font-medium">
                                {task.HoTen || `(Mã NV: ${task.MaNhanVien})`}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {task.TenKhuVuc || `(Mã KVC: ${task.MaKhuVucChung})`}
                            </td>
                            <td className="py-2 px-4 border-b">{formatDate(task.Ngay)}</td>
                            <td className="py-2 px-4 border-b">{task.Ca}</td>
                            <td className="py-2 px-4 border-b font-semibold">{task.TrangThai}</td>
                        </tr>
                    ))}
                    {tasks.length === 0 && (
                        <tr>
                            <td colSpan="6" className="py-4 text-center text-gray-500">
                                📋 Chưa có nhiệm vụ nào được phân công.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TaskAssignmentList;