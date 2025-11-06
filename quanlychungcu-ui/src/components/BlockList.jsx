import React from 'react';

/**
 * Component "Ngốc" (Dumb Component)
 * - KHÔNG gọi API, KHÔNG quản lý state.
 * - Chỉ nhận props từ cha (BlocksPage) và hiển thị.
 * - Phát sự kiện onEdit, onDelete lên cho cha xử lý.
 */
function BlockList({ blocks, onEdit, onDelete, isLoading }) {
  
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
          <th>Hành Động</th>
        </tr>
      </thead>
      <tbody>
        {blocks.map((block) => (
          <tr key={block.MaBlock}>
            <td>{block.MaBlock}</td>
            <td>{block.TenBlock}</td>
            <td>{block.SoTang || 'N/A'}</td>
            <td className="actions">
              {/* Khi click, gọi hàm từ props và truyền "block" 
                (hoặc MaBlock) lên cho component cha (BlocksPage)
              */}
              <button onClick={() => onEdit(block)} className="btn-edit">
                Sửa
              </button>
              <button onClick={() => onDelete(block.MaBlock)} className="btn-delete">
                Xóa
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default BlockList;