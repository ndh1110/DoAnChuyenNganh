import React from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - Hiển thị danh sách các tầng của block đã chọn.
 * - Chỉ nhận props từ cha (FloorsPage).
 */
function FloorList({ floors, onDelete, isLoading }) {

  if (isLoading) {
    return <div>Đang tải dữ liệu tầng...</div>;
  }

  if (floors.length === 0) {
    return <div>Không có tầng nào (hoặc chưa chọn block).</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Mã Tầng (MaTang)</th>
          <th>Số Tầng (SoTang)</th>
          <th>Hành Động</th>
        </tr>
      </thead>
      <tbody>
        {floors.map((floor) => (
          <tr key={floor.MaTang}>
            <td>{floor.MaTang}</td>
            <td>{floor.SoTang}</td>
            <td className="actions">
              {/* API của bạn không có Update Tầng, chỉ có Xóa */}
              <button onClick={() => onDelete(floor.MaTang)} className="btn-delete">
                Xóa
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default FloorList;