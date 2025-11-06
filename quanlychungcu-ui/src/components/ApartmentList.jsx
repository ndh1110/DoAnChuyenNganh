import React from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - Hiển thị danh sách các căn hộ đã được lọc và "làm giàu" (hydrated).
 */
function ApartmentList({ apartments, onEdit, onDelete, isLoading }) {

  if (isLoading) {
    return <div>Đang tải dữ liệu căn hộ...</div>;
  }

  if (apartments.length === 0) {
    return <div>Không có căn hộ nào phù hợp với bộ lọc.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Mã Căn Hộ</th>
          <th>Số Căn Hộ</th>
          <th>Tên Block</th>
          <th>Số Tầng</th>
          <th>Trạng Thái</th>
          <th>Hành Động</th>
        </tr>
      </thead>
      <tbody>
        {apartments.map((apt) => (
          <tr key={apt.MaCanHo}>
            <td>{apt.MaCanHo}</td>
            <td>{apt.SoCanHo}</td>
            {/* Hiển thị dữ liệu đã "làm giàu" từ component cha (Page).
              Nếu không tìm thấy, hiển thị MaTang gốc. 
            */}
            <td>{apt.TenBlock || `(Block ID: ${apt.MaBlock})`}</td>
            <td>{apt.SoTang || `(Tầng ID: ${apt.MaTang})`}</td>
            <td>{apt.TenTrangThai || 'N/A'}</td>
            <td className="actions">
              <button onClick={() => onEdit(apt)} className="btn-edit">
                Sửa
              </button>
              <button onClick={() => onDelete(apt.MaCanHo)} className="btn-delete">
                Xóa
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ApartmentList;