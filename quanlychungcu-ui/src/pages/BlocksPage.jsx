// src/pages/BlocksPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// 1. Import Lớp Service
import { blockService } from '../services/blockService';

// 2. Import các Component "Ngốc"
// --- (GỘP TỪ HEAD): Import cả Auth và Form ---
import BlockForm from '../components/BlockForm';
import { useAuth } from '../context/AuthContext'; 

function BlocksPage() {
  // === 3. Quản lý State ===
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal Form (DÙNG CHUNG)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(null);
  
  // STATE MỚI: Xác định modal đang ở chế độ nào (Từ 'nhan')
  const [modalMode, setModalMode] = useState('crud'); // 'crud' hoặc 'setup'

  // --- (GỘP TỪ HEAD): Lấy user và quyền ---
  const { user } = useAuth(); 
  const canManageBlocks = user?.role === 'Quản lý';

  // === 4. Logic (useEffect) ===
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

  // === 5. Các Hàm Xử Lý Sự Kiện (Event Handlers) ===

  // Mở modal để TẠO MỚI (CRUD)
  const handleAddNew = () => {
    setCurrentBlock(null);
    setModalMode('crud'); // Đặt chế độ
    setIsModalOpen(true);
  };

  // Mở modal để CẬP NHẬT (CRUD)
  const handleEdit = (block) => {
    setCurrentBlock(block);
    setModalMode('crud'); // Đặt chế độ
    setIsModalOpen(true);
  };
  
  // Mở modal để SETUP (Nâng cao) (Từ 'nhan')
  const handleOpenSetupModal = () => {
    setCurrentBlock(null);
    setModalMode('setup'); // Đặt chế độ
    setIsModalOpen(true);
  };

  // Xử lý sự kiện XÓA
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

  // Xử lý khi Form (trong modal) được SUBMIT (HÀM TỔNG) (Từ 'nhan')
  const handleModalSubmit = async (formData) => {
    // formData chứa { TenBlock, SoTang, TongSoCanHo }
    try {
      setFormLoading(true);
      setError(null);

      if (modalMode === 'setup') {
        // --- Chế độ Setup ---
        const result = await blockService.setup(formData); // Gọi service.setup
        alert(result.message || "Setup Block thành công!");
        
      } else {
        // --- Chế độ CRUD ---
        if (currentBlock) {
          // --- Cập nhật (Update)
          await blockService.update(currentBlock.MaBlock, formData);
          alert("Cập nhật Block thành công!");
        } else {
          // --- Tạo mới (Create)
          await blockService.create(formData);
          alert("Tạo mới Block thành công!");
        }
      }

      // Đóng modal và tải lại danh sách
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

  // === 6. Render Giao Diện ===
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Quản lý Chung Cư (Block)</h2>
        
        {/* --- (GỘP TỪ HEAD): Chỉ hiển thị nút nếu có quyền --- */}
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
        canManage={canManageBlocks} // <-- (Từ HEAD)
      />
      
      {/* --- (GỘP TỪ NHANH): Render Modal Form duy nhất --- */}
      <BlockForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit} 
        initialData={currentBlock}
        isLoading={formLoading}
        mode={modalMode} 
      />
    </div>
  );
}

export default BlocksPage;