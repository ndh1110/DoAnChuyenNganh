import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa URL cơ sở của API backend của bạn
const API_BASE_URL = 'http://localhost:5000/api';

const BlockList = () => {
    // 1. Khai báo state để lưu trữ danh sách Block và trạng thái tải dữ liệu
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Sử dụng useEffect để gọi API khi component được render lần đầu
    useEffect(() => {
        const fetchBlocks = async () => {
            try {
                // Gọi API GET /api/block
                const response = await axios.get(`${API_BASE_URL}/block`);
                
                // Cập nhật state với dữ liệu Block nhận được
                setBlocks(response.data); 
                
                // Đánh dấu đã tải xong
                setLoading(false); 
            } catch (err) {
                console.error("Lỗi khi tải danh sách Block:", err);
                // Cập nhật state lỗi và đánh dấu đã tải xong
                setError(err.message);
                setLoading(false);
            }
        };

        fetchBlocks();
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần sau render đầu tiên

    // 3. Hiển thị thông báo tải và lỗi
    if (loading) {
        return <div className="p-4 text-center">Đang tải danh sách Block...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500 text-center">Lỗi: {error}. Vui lòng kiểm tra Server BE.</div>;
    }

    // 4. Hiển thị danh sách Block
    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Danh sách Block</h2>
            
            <ul className="list-disc pl-5">
                {/* Kiểm tra và hiển thị danh sách tên Block */}
                {blocks.length > 0 ? (
                    blocks.map((block) => (
                        <li key={block.MaBlock} className="py-1">
                            {/* Dữ liệu lấy từ API có các trường như MaBlock, TenBlock, SoTang, v.v. */}
                            <strong>{block.TenBlock}</strong> (Số tầng: {block.SoTang || 'N/A'})
                        </li>
                    ))
                ) : (
                    <li className="text-gray-500">Không tìm thấy Block nào.</li>
                )}
            </ul>
            <p className="mt-4 text-sm text-gray-600">Tổng cộng: {blocks.length} Block</p>
        </div>
    );
};

export default BlockList;