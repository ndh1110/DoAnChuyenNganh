import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios

/**
 * Component hiển thị danh sách các Block.
 * Gọi API: GET /api/block
 */
function BlockList() {
  // 1. Khởi tạo State
  const [blocks, setBlocks] = useState([]); // State lưu mảng danh sách block
  const [loading, setLoading] = useState(true); // State cho trạng thái tải dữ liệu
  const [error, setError] = useState(null); // State lưu lỗi (nếu có)

  // 2. Sử dụng useEffect để gọi API một lần khi component render
  useEffect(() => {
    // Định nghĩa hàm async để lấy dữ liệu
    const fetchBlocks = async () => {
      try {
        // 3. Gọi API bằng axios
        // Nhờ có proxy trong vite.config.js, chúng ta chỉ cần gọi '/api/block'
        // Vite sẽ tự động chuyển nó thành 'http://localhost:5000/api/block'
        const response = await axios.get('/api/block');

        // 4. Cập nhật state với dữ liệu nhận được
        setBlocks(response.data);

      } catch (err) {
        // 5. Xử lý lỗi nếu gọi API thất bại
        setError(err.message);
        console.error("Có lỗi xảy ra khi fetch blocks:", err);
      } finally {
        // 6. Dù thành công hay lỗi, cũng dừng trạng thái loading
        setLoading(false);
      }
    };

    // 7. Gọi hàm
    fetchBlocks();

  }, []); // Mảng rỗng [] nghĩa là useEffect này chỉ chạy 1 LẦN DUY NHẤT

  // 8. Render giao diện dựa trên các state
  
  // Trạng thái đang tải
  if (loading) {
    return <div>Đang tải dữ liệu Block...</div>;
  }

  // Trạng thái lỗi
  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Lỗi khi tải dữ liệu: {error}</p>
        <p><i>(Hãy đảm bảo server Backend (quanlychungcu-api) của bạn đang chạy ở cổng 5000)</i></p>
      </div>
    );
  }

  // Trạng thái thành công
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Danh Sách Các Block Chung Cư</h2>
      {/* Kiểm tra nếu không có block nào */}
      {blocks.length === 0 ? (
        <p>Không có block nào trong cơ sở dữ liệu.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {/* 9. Dùng hàm .map() để lặp qua mảng blocks và hiển thị */}
          {blocks.map((block) => (
            <li 
              key={block.MaBlock} // 'key' là bắt buộc khi dùng .map()
              style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '5px' }}
            >
              {/* Hiển thị TenBlock như yêu cầu */}
              {block.TenBlock}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BlockList;