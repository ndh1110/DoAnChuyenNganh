import React, { useState, useEffect, useCallback } from 'react';

// 1. Import Lớp Service
// Import cả 2 service vì trang này cần dữ liệu Block VÀ Tầng
import { blockService } from '../services/blockService';
import { floorService } from '../services/floorService';

// 2. Import các Component "Ngốc"
import FloorList from '../components/FloorList';
import FloorForm from '../components/FloorForm';

/**
 * Component "Thông Minh" (Smart Component)
 * - Quản lý state và logic cho chức năng CRUD Tầng.
 */
function FloorsPage() {
  // === 3. Quản lý State ===
  const [floors, setFloors] = useState([]); // Danh sách tầng
  const [blocks, setBlocks] = useState([]); // Danh sách block (cho dropdown)
  const [selectedBlockId, setSelectedBlockId] = useState(''); // Block đang chọn
  
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // === 4. Logic (useEffect) ===

  // Hàm tải danh sách Block (cho dropdown)
  const loadBlocks = useCallback(async () => {
    try {
      setLoadingBlocks(true);
      setError(null);
      const data = await blockService.getAll();
      setBlocks(data);
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh sách Block.");
    } finally {
      setLoadingBlocks(false);
    }
  }, []);

  // Hàm tải danh sách Tầng (dựa trên block đang chọn)
  const loadFloors = useCallback(async () => {
    if (!selectedBlockId) {
      setFloors([]); // Nếu chưa chọn block, reset ds tầng
      return;
    }
    try {
      setLoadingFloors(true);
      setError(null);
      const data = await floorService.getByBlockId(selectedBlockId);
      setFloors(data);
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh sách Tầng.");
    } finally {
      setLoadingFloors(false);
    }
  }, [selectedBlockId]); // Phụ thuộc vào block đang chọn

  // 1. useEffect: Tải danh sách Block khi trang được mở
  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  // 2. useEffect: Tải danh sách Tầng KHI `selectedBlockId` thay đổi
  useEffect(() => {
    loadFloors();
  }, [loadFloors]); // Phụ thuộc vào hàm `loadFloors` (đã chứa `selectedBlockId`)

  // === 5. Các Hàm Xử Lý Sự Kiện (Event Handlers) ===

  // Xử lý khi đổi Block trên dropdown
  const handleBlockChange = (e) => {
    setSelectedBlockId(e.target.value);
  };

  // Mở modal để TẠO MỚI
  const handleAddNew = () => {
    if (!selectedBlockId) {
      alert("Vui lòng chọn một Block trước khi thêm tầng.");
      return;
    }
    setIsModalOpen(true);
  };

  // Xử lý sự kiện XÓA (nhận `id` từ FloorList)
  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Tầng (ID: ${id})?`)) {
      try {
        setLoadingFloors(true); // Đặt loading
        await floorService.delete(id);
        alert("Xóa Tầng thành công!");
        loadFloors(); // Tải lại danh sách tầng cho block hiện tại
      } catch (err) {
        setError(err.message || "Lỗi khi xóa Tầng.");
        alert(`Lỗi khi xóa: ${error}`);
        setLoadingFloors(false);
      }
    }
  };

  // Xử lý khi Form (trong modal) được SUBMIT
  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);
      
      // Gắn MaBlock đang chọn vào formData trước khi gửi
      const dataToSubmit = {
        ...formData,
        MaBlock: parseInt(selectedBlockId)
      };

      await floorService.create(dataToSubmit);
      alert("Tạo mới Tầng thành công!");

      // Đóng modal và tải lại danh sách
      setIsModalOpen(false);
      loadFloors();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi lưu Tầng.";
      setError(errorMsg);
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setFormLoading(false);
    }
  };
  
  // Lấy tên block đang chọn (để hiển thị trên modal)
  const getSelectedBlockName = () => {
    const selectedBlock = blocks.find(b => b.MaBlock.toString() === selectedBlockId);
    return selectedBlock ? selectedBlock.TenBlock : '';
  };

  // === 6. Render Giao Diện ===
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Quản lý Tầng</h2>
        <button 
          onClick={handleAddNew} 
          className="btn-add-new"
          disabled={!selectedBlockId} // Chỉ cho phép thêm khi đã chọn block
        >
          + Thêm Tầng Mới
        </button>
      </div>

      {/* --- Bộ lọc chọn Block --- */}
      <div className="filters">
        <label htmlFor="blockSelect">Chọn Block: </label>
        <select 
          id="blockSelect" 
          value={selectedBlockId} 
          onChange={handleBlockChange}
          disabled={loadingBlocks}
        >
          <option value="">{loadingBlocks ? 'Đang tải Block...' : '-- Vui lòng chọn Block --'}</option>
          {blocks.map(block => (
            <option key={block.MaBlock} value={block.MaBlock}>
              {block.TenBlock}
            </option>
          ))}
        </select>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && <div className="error-message">Lỗi: {error}</div>}

      {/* 7. Truyền state và handlers xuống component "ngốc" */}
      <FloorList
        floors={floors}
        onDelete={handleDelete}
        isLoading={loadingFloors}
      />
      
      {/* 8. Render Modal (Form) */}
      <FloorForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
        blockName={getSelectedBlockName()}
      />
    </div>
  );
}

export default FloorsPage;