import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 1. Import tất cả các Service cần thiết
import { contractService } from '../services/contractService';
import { residentService } from '../services/residentService';
import { apartmentService } from '../services/apartmentService';
import { floorService } from '../services/floorService';
import { blockService } from '../services/blockService';

// 2. Import các Component "Ngốc"
import ContractList from '../components/ContractList';
import ContractForm from '../components/ContractForm';

/**
 * Component "Thông Minh" (Smart Component)
 * - Quản lý state và logic cho CRUD Hợp Đồng.
 */
function ContractsPage() {
  // === 3. Quản lý State ===
  const [allContracts, setAllContracts] = useState([]);
  const [allResidents, setAllResidents] = useState([]);
  const [allApartments, setAllApartments] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);
  
  // === 4. Logic (useEffect) ===
  
  // Tải TẤT CẢ dữ liệu cần thiết
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Chạy song song 5 yêu cầu API
      const [contractsData, residentsData, apartmentsData, floorsData, blocksData] = await Promise.all([
        contractService.getAll(),
        residentService.getAll(),
        apartmentService.getAll(),
        floorService.getAll(),
        blockService.getAll()
      ]);
      
      setAllContracts(contractsData);
      setAllResidents(residentsData.data);
      setAllApartments(apartmentsData);
      setAllFloors(floorsData);
      setAllBlocks(blocksData);
      
    } catch (err) {
      setError(err.message || "Lỗi khi tải dữ liệu ban đầu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); // Chạy 1 lần

  // === 5. Logic "Làm giàu" Dữ liệu (useMemo) ===

  // "Làm giàu" Căn Hộ (để truyền xuống Form)
  const hydratedApartments = useMemo(() => {
    const floorMap = new Map(allFloors.map(f => [f.MaTang, f]));
    const blockMap = new Map(allBlocks.map(b => [b.MaBlock, b]));
    
    return allApartments.map(apt => {
        const floor = floorMap.get(apt.MaTang);
        const block = floor ? blockMap.get(floor.MaBlock) : null;
        return {
          ...apt,
          SoTang: floor ? floor.SoTang : null,
          TenBlock: block ? block.TenBlock : null,
        };
      });
  }, [allApartments, allFloors, allBlocks]);

  // "Làm giàu" Hợp Đồng (để truyền xuống List)
  const hydratedContracts = useMemo(() => {
    // Tạo Maps để tra cứu nhanh
    const residentMap = new Map(allResidents.map(r => [r.MaNguoiDung, r.HoTen]));
    // Dùng hydratedApartments để tra cứu SoCanHo
    const apartmentMap = new Map(hydratedApartments.map(a => [a.MaCanHo, a.SoCanHo])); 

    return allContracts.map(con => {
      return {
        ...con,
        TenChuHo: residentMap.get(con.ChuHoId) || 'N/A',
        SoCanHo: apartmentMap.get(con.MaCanHo) || 'N/A',
      };
    });
  }, [allContracts, allResidents, hydratedApartments]);

  // === 6. Các Hàm Xử Lý Sự Kiện (Event Handlers) ===

  const handleAddNew = () => {
    setCurrentContract(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contract) => {
    setCurrentContract(contract);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Hợp đồng (ID: ${id})?`)) {
      try {
        setLoading(true);
        await contractService.delete(id);
        alert("Xóa Hợp đồng thành công!");
        loadInitialData(); // Tải lại toàn bộ
      } catch (err) {
        setError(err.message || "Lỗi khi xóa Hợp đồng.");
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

      // Đảm bảo ID là số
      const dataToSubmit = {
        ...formData,
        MaCanHo: parseInt(formData.MaCanHo),
        ChuHoId: parseInt(formData.ChuHoId),
      };

      if (currentContract) {
        // --- Cập nhật (Update) ---
        await contractService.update(currentContract.MaHopDong, dataToSubmit);
        alert("Cập nhật Hợp đồng thành công!");
      } else {
        // --- Tạo mới (Create) ---
        await contractService.create(dataToSubmit);
        alert("Tạo mới Hợp đồng thành công!");
      }

      setIsModalOpen(false);
      setCurrentContract(null);
      loadInitialData(); // Tải lại toàn bộ
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi lưu Hợp đồng.";
      setError(errorMsg);
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setFormLoading(false);
    }
  };

  // === 7. Render Giao Diện ===
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Quản lý Hợp đồng</h2>
        <button onClick={handleAddNew} className="btn-add-new">
          + Thêm Hợp đồng Mới
        </button>
      </div>

      {error && <div className="error-message">Lỗi: {error}</div>}

      <ContractList
        contracts={hydratedContracts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />
      
      <ContractForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
        initialData={currentContract}
        // Truyền dữ liệu cho các dropdowns
        allResidents={allResidents}
        hydratedApartments={hydratedApartments}
      />
    </div>
  );
}

export default ContractsPage;