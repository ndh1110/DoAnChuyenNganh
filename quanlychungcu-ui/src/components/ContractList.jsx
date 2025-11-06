import React from 'react';

// Hàm helper để format ngày (YYYY-MM-DD)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return 'Ngày lỗi';
  }
};

/**
 * Component "Ngốc" (Dumb Component)
 * - Hiển thị danh sách các hợp đồng đã được "làm giàu" (hydrated).
 */
function ContractList({ contracts, onEdit, onDelete, isLoading }) {

  if (isLoading) {
    return <div>Đang tải dữ liệu hợp đồng...</div>;
  }

  if (contracts.length === 0) {
    return <div>Không có hợp đồng nào.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Mã HĐ</th>
          <th>Loại Hợp Đồng</th>
          <th>Chủ Hộ (Cư Dân)</th>
          <th>Số Căn Hộ</th>
          <th>Ngày Ký</th>
          <th>Ngày Hết Hạn</th>
          <th>Hành Động</th>
        </tr>
      </thead>
      <tbody>
        {contracts.map((con) => (
          <tr key={con.MaHopDong}>
            <td>{con.MaHopDong}</td>
            <td>{con.Loai}</td>
            {/* Dữ liệu đã "làm giàu" từ cha */}
            <td>{con.TenChuHo || `(ID: ${con.ChuHoId})`}</td>
            <td>{con.SoCanHo || `(ID: ${con.MaCanHo})`}</td>
            <td>{formatDate(con.NgayKy)}</td>
            <td>{formatDate(con.NgayHetHan)}</td>
            <td className="actions">
              <button onClick={() => onEdit(con)} className="btn-edit">
                Sửa
              </button>
              <button onClick={() => onDelete(con.MaHopDong)} className="btn-delete">
                Xóa
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ContractList;