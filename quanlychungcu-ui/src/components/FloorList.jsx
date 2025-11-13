// src/components/FloorList.jsx
import React from 'react';

function FloorList({ floors, onDelete, isLoading, canManage }) { // Nhận prop canManage

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
          
          {/* Chỉ hiện cột Hành Động nếu có quyền */}
          {canManage && <th>Hành Động</th>}
        </tr>
      </thead>
      <tbody>
        {floors.map((floor) => (
          <tr key={floor.MaTang}>
            <td>{floor.MaTang}</td>
            <td>{floor.SoTang}</td>
            
            {/* Chỉ hiện nút Xóa nếu có quyền */}
            {canManage && (
              <td className="actions">
                <button onClick={() => onDelete(floor.MaTang)} className="btn-delete">
                  Xóa
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default FloorList;