// src/pages/FloorsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { blockService } from '../services/blockService';
import { floorService } from '../services/floorService';
import { useAuth } from '../context/AuthContext'; // <-- 1. Import useAuth
import FloorList from '../components/FloorList';
import FloorForm from '../components/FloorForm';

function FloorsPage() {
  const [floors, setFloors] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState('');
  
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // --- 2. LOGIC PHÂN QUYỀN ---
  const { user } = useAuth();
  const MANAGER_ROLES = ['Quản lý', 'Admin', 'Nhân viên', 'Kỹ thuật'];
  const canManageFloors = MANAGER_ROLES.includes(user?.role);

  // (Logic loadBlocks và loadFloors giữ nguyên)
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

  const loadFloors = useCallback(async () => {
    if (!selectedBlockId) {
      setFloors([]);
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
  }, [selectedBlockId]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  useEffect(() => {
    loadFloors();
  }, [loadFloors]);

  const handleBlockChange = (e) => {
    setSelectedBlockId(e.target.value);
  };

  const handleAddNew = () => {
    if (!selectedBlockId) {
      alert("Vui lòng chọn một Block trước khi thêm tầng.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Tầng (ID: ${id})?`)) {
      try {
        setLoadingFloors(true);
        await floorService.delete(id);
        alert("Xóa Tầng thành công!");
        loadFloors();
      } catch (err) {
        const errorMsg = err.message || "Lỗi khi xóa Tầng.";
        setError(errorMsg);
        alert(`Lỗi khi xóa: ${errorMsg}`);
        setLoadingFloors(false);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);
      
      const dataToSubmit = {
        ...formData,
        MaBlock: parseInt(selectedBlockId)
      };

      await floorService.create(dataToSubmit);
      alert("Tạo mới Tầng thành công!");
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
  
  const getSelectedBlockName = () => {
    const selectedBlock = blocks.find(b => b.MaBlock.toString() === selectedBlockId);
    return selectedBlock ? selectedBlock.TenBlock : '';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Quản lý Tầng</h2>
        
        {/* --- 3. Ẩn nút Thêm nếu không có quyền --- */}
        {canManageFloors && (
          <button 
            onClick={handleAddNew} 
            className="btn-add-new"
            disabled={!selectedBlockId}
          >
            + Thêm Tầng Mới
          </button>
        )}
      </div>

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

      {error && <div className="error-message">Lỗi: {error}</div>}

      {/* --- 4. Truyền quyền xuống FloorList --- */}
      <FloorList
        floors={floors}
        onDelete={handleDelete}
        isLoading={loadingFloors}
        canManage={canManageFloors} 
      />
      
      {/* --- 5. Chỉ render Form khi có quyền --- */}
      {canManageFloors && (
        <FloorForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          blockName={getSelectedBlockName()}
        />
      )}
    </div>
  );
}

export default FloorsPage;