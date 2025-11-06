import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 1. Import cả 4 Lớp Service
import { apartmentService } from '../services/apartmentService';
import { blockService } from '../services/blockService';
import { floorService } from '../services/floorService';
import { statusService } from '../services/statusService'; // <-- ĐÃ SỬA

// 2. Import các Component "Ngốc"
import ApartmentList from '../components/ApartmentList';
import ApartmentForm from '../components/ApartmentForm';

function ApartmentsPage() {
  // === 3. Quản lý State ===
  const [allApartments, setAllApartments] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [apartmentStatuses, setApartmentStatuses] = useState([]); // <-- STATE MỚI
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentApartment, setCurrentApartment] = useState(null);
  
  // State cho Bộ lọc (Filters)
  const [filterBlockId, setFilterBlockId] = useState('');
  const [filterFloorId, setFilterFloorId] = useState('');
  const [filterStatusId, setFilterStatusId] = useState(''); // <-- STATE MỚI CHO LỌC

  // === 4. Logic (useEffect) ===
  
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Chạy song song 4 yêu cầu API
      const [apartmentsData, blocksData, floorsData, statusesData] = await Promise.all([
        apartmentService.getAll(),
        blockService.getAll(),
        floorService.getAll(),
        // SỬA Ở ĐÂY: Gọi API mới theo context
        statusService.getByContext('APARTMENT') 
      ]);
      
      setAllApartments(apartmentsData);
      setAllBlocks(blocksData);
      setAllFloors(floorsData);
      setApartmentStatuses(statusesData); // <-- LƯU STATE MỚI
      
    } catch (err) {
      setError(err.message || "Lỗi khi tải dữ liệu ban đầu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); 

  // === 5. Logic Lọc và "Làm giàu" Dữ liệu (useMemo) ===

  // Lọc danh sách tầng (cho BỘ LỌC)
  const filteredFloorsForFilter = useMemo(() => {
    if (!filterBlockId) return [];
    return allFloors.filter(f => f.MaBlock.toString() === filterBlockId);
  }, [filterBlockId, allFloors]);

  // Lọc và "làm giàu" danh sách căn hộ để hiển thị
  const hydratedAndFilteredApartments = useMemo(() => {
    const floorMap = new Map(allFloors.map(f => [f.MaTang, f]));
    const blockMap = new Map(allBlocks.map(b => [b.MaBlock, b]));

    // API đã trả về TenTrangThai, KHÔNG CẦN TẠO statusMap nữa

    return allApartments
      .filter(apt => {
        // Lọc theo Block
        if (filterBlockId) {
          const floor = floorMap.get(apt.MaTang);
          if (!floor || floor.MaBlock.toString() !== filterBlockId) {
            return false;
          }
        }
        // Lọc theo Tầng
        if (filterFloorId) {
          if (apt.MaTang.toString() !== filterFloorId) {
            return false;
          }
        }
        // LỌC THEO TRẠNG THÁI (MỚI)
        if (filterStatusId) {
          // So sánh MaTrangThai (từ API Căn Hộ) với filterStatusId
          if ((apt.MaTrangThai || '').toString() !== filterStatusId) {
            return false;
          }
        }
        return true; 
      })
      .map(apt => {
        // "Làm giàu" (Hydrate) Block và Tầng
        const floor = floorMap.get(apt.MaTang);
        const block = floor ? blockMap.get(floor.MaBlock) : null;
        
        // TenTrangThai đã có sẵn từ API (apt.TenTrangThai)
        // nên không cần "làm giàu" (hydrate) nữa.

        return {
          ...apt,
          SoTang: floor ? floor.SoTang : null,
          TenBlock: block ? block.TenBlock : null,
          MaBlock: block ? block.MaBlock : null,
          // apt.TenTrangThai đã có sẵn
        };
      });
  }, [allApartments, allBlocks, allFloors, filterBlockId, filterFloorId, filterStatusId]); // <-- Thêm filterStatusId

  // === 6. Các Hàm Xử Lý Sự Kiện (Event Handlers) ===
  // ... (handleAddNew, handleEdit, handleDelete, handleFormSubmit giữ nguyên) ...
  const handleAddNew = () => { /* (giữ nguyên) */ 
    setCurrentApartment(null);
    setIsModalOpen(true);
  };
  const handleEdit = (apartment) => { /* (giữ nguyên) */ 
    setCurrentApartment(apartment);
    setIsModalOpen(true);
  };
  const handleDelete = async (id) => { /* (giữ nguyên) */ 
    if (window.confirm(`Bạn có chắc muốn xóa Căn hộ (ID: ${id})?`)) {
      try {
        setLoading(true);
        await apartmentService.delete(id);
        alert("Xóa Căn hộ thành công!");
        loadInitialData();
      } catch (err) {
        setError(err.message || "Lỗi khi xóa Căn hộ.");
        alert(`Lỗi khi xóa: ${error}`);
      } finally {
        setLoading(false);
      }
    }
  };
    const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      // Dữ liệu chuẩn bị gửi đi
      const dataToSubmit = {
        MaTang: parseInt(formData.MaTang),
        SoCanHo: formData.SoCanHo,
        MaTrangThai: formData.MaTrangThai ? parseInt(formData.MaTrangThai) : null
      };

      if (currentApartment) {
        // --- Cập nhật (Update) ---
        await apartmentService.update(currentApartment.MaCanHo, dataToSubmit);
        alert("Cập nhật Căn hộ thành công!");
      } else {
        // --- Tạo mới (Create) ---
        await apartmentService.create(dataToSubmit);
        alert("Tạo mới Căn hộ thành công!");
      }

      setIsModalOpen(false);
      setCurrentApartment(null);
      loadInitialData(); // Tải lại toàn bộ
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi lưu Căn hộ.";
      setError(errorMsg);
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setFormLoading(false);
    }
  };
  
  useEffect(() => {
    setFilterFloorId('');
  }, [filterBlockId]);

  // === 7. Render Giao Diện ===
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Quản lý Căn Hộ</h2>
        <button onClick={handleAddNew} className="btn-add-new">
          + Thêm Căn Hộ Mới
        </button>
      </div>

      {/* --- Bộ lọc (Filters) --- */}
      <div className="filters-container">
        {/* Lọc Block */}
        <div className="filter-item">
          <label htmlFor="filterBlock">Lọc theo Block: </label>
          <select 
            id="filterBlock" 
            value={filterBlockId} 
            onChange={(e) => setFilterBlockId(e.target.value)}
            disabled={loading}
          >
            <option value="">{loading ? 'Đang tải...' : 'Tất cả Block'}</option>
            {allBlocks.map(block => (
              <option key={block.MaBlock} value={block.MaBlock}>
                {block.TenBlock}
              </option>
            ))}
          </select>
        </div>
        
        {/* Lọc Tầng */}
        <div className="filter-item">
          <label htmlFor="filterFloor">Lọc theo Tầng: </label>
          <select 
            id="filterFloor" 
            value={filterFloorId} 
            onChange={(e) => setFilterFloorId(e.target.value)}
            disabled={!filterBlockId || loading} 
          >
            <option value="">Tất cả Tầng</option>
            {filteredFloorsForFilter.map(floor => (
              <option key={floor.MaTang} value={floor.MaTang}>
                Tầng số: {floor.SoTang}
              </option>
            ))}
          </select>
        </div>
        
        {/* LỌC TRẠNG THÁI (MỚI) */}
        <div className="filter-item">
          <label htmlFor="filterStatus">Lọc theo Trạng Thái: </label>
          <select 
            id="filterStatus" 
            value={filterStatusId} 
            onChange={(e) => setFilterStatusId(e.target.value)}
            disabled={loading}
          >
            <option value="">Tất cả Trạng Thái</option>
            {apartmentStatuses.map(status => (
              <option key={status.MaTrangThai} value={status.MaTrangThai}>
                {status.Ten}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-message">Lỗi: {error}</div>}

      {/* 8. Truyền danh sách đã "làm giàu" xuống */}
      <ApartmentList
        apartments={hydratedAndFilteredApartments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />
      
      {/* 9. Truyền apartmentStatuses xuống Form */}
      <ApartmentForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
        initialData={currentApartment}
        allBlocks={allBlocks}
        allFloors={allFloors}
        apartmentStatuses={apartmentStatuses} // <-- TRUYỀN PROP QUAN TRỌNG
      />
    </div>
  );
}

export default ApartmentsPage;