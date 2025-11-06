import React, { useState, useEffect, useCallback } from 'react';
// 1. Import Lớp Service
import { blockService } from '../services/blockService';

// 2. Import các Component "Ngốc"
import BlockList from '../components/BlockList';
import BlockForm from '../components/BlockForm';

/**
 * Component "Thông Minh" (Smart Component)
 * - Quản lý toàn bộ state (danh sách, loading, lỗi, modal).
 * - Quản lý toàn bộ logic (fetch, create, update, delete).
 * - Truyền state và logic xuống các component "ngốc".
 */
function BlocksPage() {
  // === 3. Quản lý State ===
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  // State giữ block đang được chọn để Sửa
  // (Nếu là null -> Tạo mới. Nếu có object -> Cập nhật)
  const [currentBlock, setCurrentBlock] = useState(null);

  // === 4. Logic (useEffect) ===
  
  // Dùng useCallback để tránh hàm bị tạo lại, tối ưu hiệu suất
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
  }, []); // Hàm này không phụ thuộc vào gì, chỉ tạo 1 lần

  // useEffect để gọi API khi trang được tải (component mounted)
  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]); // Phụ thuộc vào `loadBlocks`

  // === 5. Các Hàm Xử Lý Sự Kiện (Event Handlers) ===

  // Mở modal để TẠO MỚI
  const handleAddNew = () => {
    setCurrentBlock(null); // Không có block nào đang sửa
    setIsModalOpen(true);
  };

  // Mở modal để CẬP NHẬT (nhận `block` từ BlockList)
  const handleEdit = (block) => {
    setCurrentBlock(block); // Set block đang sửa
    setIsModalOpen(true);
  };

  // Xử lý sự kiện XÓA (nhận `id` từ BlockList)
  const handleDelete = async (id) => {
    // Xác nhận trước khi xóa
    if (window.confirm(`Bạn có chắc muốn xóa Block (ID: ${id})?`)) {
      try {
        setLoading(true); // Có thể dùng state loading riêng cho từng dòng
        await blockService.delete(id);
        alert("Xóa Block thành công!");
        // Tải lại danh sách sau khi xóa thành công
        loadBlocks();
      } catch (err) {
        setError(err.message || "Lỗi khi xóa Block.");
        alert(`Lỗi khi xóa: ${error}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Xử lý khi Form (trong modal) được SUBMIT
  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      if (currentBlock) {
        // --- Cập nhật (Update) ---
        await blockService.update(currentBlock.MaBlock, formData);
        alert("Cập nhật Block thành công!");
      } else {
        // --- Tạo mới (Create) ---
        await blockService.create(formData);
        alert("Tạo mới Block thành công!");
      }

      // Đóng modal và tải lại danh sách
      setIsModalOpen(false);
      setCurrentBlock(null);
      loadBlocks();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi lưu Block.";
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
        <button onClick={handleAddNew} className="btn-add-new">
          + Thêm Block Mới
        </button>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && <div className="error-message">Lỗi: {error}</div>}

      {/* 7. Truyền state và handlers xuống component "ngốc" 
      */}
      <BlockList
        blocks={blocks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />
      
      {/* 8. Render Modal (Form) 
      */}
      <BlockForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={currentBlock}
        isLoading={formLoading}
      />
    </div>
  );
}

export default BlocksPage;