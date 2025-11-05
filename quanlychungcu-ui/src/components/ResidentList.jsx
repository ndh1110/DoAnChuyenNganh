import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Component hiển thị danh sách Cư dân (Người dùng).
 * Gọi API: GET /api/nguoidung
 */
function ResidentList() {
  // 1. Khởi tạo State
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Sử dụng useEffect để gọi API
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        // Gọi API 'nguoidung'
        const response = await axios.get('/api/nguoidung');
        
        // Cập nhật state với dữ liệu người dùng
        setResidents(response.data);
      } catch (err) {
        setError(err.message);
        console.error("Có lỗi xảy ra khi fetch residents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, []); // Chỉ chạy 1 lần

  // 3. Render các trạng thái
  if (loading) {
    return <div>Đang tải danh sách cư dân...</div>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Lỗi khi tải dữ liệu: {error}</p>
      </div>
    );
  }

  // 4. Render bảng dữ liệu
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', marginTop: '30px' }}>
      <h2>Danh Sách Cư Dân</h2>
      
      {/* Hiển thị dạng bảng cho dễ nhìn */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid white' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Mã ND</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Họ Tên</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Số Điện Thoại</th>
          </tr>
        </thead>
        <tbody>
          {residents.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: '8px', textAlign: 'center' }}>
                Không có dữ liệu cư dân.
              </td>
            </tr>
          ) : (
            residents.map((resident) => (
              <tr key={resident.MaNguoiDung} style={{ borderBottom: '1px solid #555' }}>
                <td style={{ padding: '8px' }}>{resident.MaNguoiDung}</td>
                <td style={{ padding: '8px' }}>{resident.HoTen}</td>
                <td style={{ padding: '8px' }}>{resident.Email}</td>
                {/* Hiển thị SĐT, dữ liệu này có từ file "Cập nhật và sửa.txt"
                  Nếu là NULL, hiển thị "Chưa cập nhật"
                */}
                <td style={{ padding: '8px' }}>
                  {resident.SoDienThoai ? resident.SoDienThoai : 'Chưa cập nhật'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ResidentList;