// src/pages/BlocksPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { blockService } from '../services/blockService';
import BlockForm from '../components/BlockForm';
import { useAuth } from '../context/AuthContext'; 
import BlockList from '../components/BlockList';

function BlocksPage() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [modalMode, setModalMode] = useState('crud');

  const { user } = useAuth(); 

  // --- SỬA ĐỔI LOGIC PHÂN QUYỀN TẠI ĐÂY ---
  // Định nghĩa danh sách các vai trò ĐƯỢC PHÉP quản lý (Thêm/Sửa/Xóa/Setup)
  const MANAGER_ROLES = ['Quản lý', 'Admin', 'Nhân viên', 'Kỹ thuật'];
  
  // Kiểm tra xem role của user hiện tại có nằm trong danh sách quản lý không
  const canManageBlocks = MANAGER_ROLES.includes(user?.role);

  // (Logic loadBlocks giữ nguyên)
  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blockService.getAll();
      setBlocks(data);
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  // (Các hàm handleAddNew, handleEdit, handleDelete, handleModalSubmit GIỮ NGUYÊN)
  const handleAddNew = () => {
    setCurrentBlock(null);
    setModalMode('crud');
    setIsModalOpen(true);
  };

  const handleEdit = (block) => {
    setCurrentBlock(block);
    setModalMode('crud');
    setIsModalOpen(true);
  };
  
  const handleOpenSetupModal = () => {
    setCurrentBlock(null);
    setModalMode('setup');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Block (ID: ${id})?`)) {
      try {
        setLoading(true); 
        await blockService.delete(id);
        alert("Xóa Block thành công!");
        loadBlocks();
      } catch (err) {
        const errorMsg = err.message || "Lỗi khi xóa Block.";
        setError(errorMsg);
        alert(`Lỗi khi xóa: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      if (modalMode === 'setup') {
        const result = await blockService.setup(formData);
        alert(result.message || "Setup Block thành công!");
      } else {
        if (currentBlock) {
          await blockService.update(currentBlock.MaBlock, formData);
          alert("Cập nhật Block thành công!");
        } else {
          await blockService.create(formData);
          alert("Tạo mới Block thành công!");
        }
      }
      setIsModalOpen(false);
      loadBlocks();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Lỗi khi lưu.";
      setError(errorMsg);
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Quản lý Chung Cư (Block)</h2>
        
        {/* Chỉ hiển thị các nút Thêm nếu có quyền quản lý */}
        {canManageBlocks && (
          <div>
            <button onClick={handleAddNew} className="btn-add-new">
              + Thêm Block (Đơn)
            </button>
            <button 
              onClick={handleOpenSetupModal} 
              className="btn-add-new-setup" 
              style={{marginLeft: '10px', background: '#007bff'}}
            >
              + Thêm Nâng Cao (Setup)
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">Lỗi: {error}</div>}

      <BlockList
        blocks={blocks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
        canManage={canManageBlocks} // Truyền quyền xuống danh sách
      />
      
      {/* Chỉ render Form khi cần thiết (dù logic ẩn nút đã chặn người dùng bấm, nhưng thêm điều kiện ở đây cho an toàn) */}
      {canManageBlocks && (
        <BlockForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit} 
          initialData={currentBlock}
          isLoading={formLoading}
          mode={modalMode} 
        />
      )}
    </div>
  );
}

export default BlocksPage;