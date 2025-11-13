// src/components/BlockList.jsx
import React from 'react';

function BlockList({ blocks, onEdit, onDelete, isLoading, canManage }) {
  
  if (isLoading) {
    return <div>Đang tải danh sách block...</div>;
  }

  if (blocks.length === 0) {
    return <div>Không có block nào.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Mã Block</th>
          <th>Tên Block</th>
          <th>Số Tầng</th>
          
          {/* Chỉ hiển thị cột Hành Động nếu có quyền quản lý */}
          {canManage && <th className="py-2 px-4 border-b text-left">Hành Động</th>}
        </tr>
      </thead>
      <tbody>
        {blocks.map((block) => (
          <tr key={block.MaBlock}>
            <td>{block.MaBlock}</td>
            <td>{block.TenBlock}</td>
            <td>{block.SoTang || 'N/A'}</td>
            
            {/* Chỉ hiển thị các nút thao tác nếu có quyền quản lý */}
            {canManage && (
              <td className="actions">
                <button onClick={() => onEdit(block)} className="btn-edit">
                  Sửa
                </button>
                <button onClick={() => onDelete(block.MaBlock)} className="btn-delete">
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

export default BlockList;