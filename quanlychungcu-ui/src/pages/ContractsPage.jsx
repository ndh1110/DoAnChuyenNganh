// src/pages/ContractsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { contractService } from '../services/contractService';
import { residentService } from '../services/residentService';
// --- SỬA: Bỏ import apartmentService, floorService ---
import { blockService } from '../services/blockService'; 

import ContractList from '../components/ContractList';
import ContractForm from '../components/ContractForm';
import ContractDetails from '../components/ContractDetails'; 

function ContractsPage() {
  const [allContracts, setAllContracts] = useState([]);
  const [allResidents, setAllResidents] = useState([]); 
  const [allApartments, setAllApartments] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [detailContract, setDetailContract] = useState(null);
  
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // --- SỬA: Gọi blockService thay cho apartmentService/floorService ---
      const [contractsData, residentsData, apartmentsData, floorsData, blocksData] = await Promise.all([
        contractService.getAll(),
        residentService.getAll(),
        blockService.getAllApartments(), // Sửa tại đây
        blockService.getAllFloors(),     // Sửa tại đây
        blockService.getAll()
      ]);
      setAllContracts(contractsData);
      setAllResidents(residentsData); 
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
  }, [loadInitialData]);

  const hydratedApartments = useMemo(() => {
    const floorMap = new Map(allFloors.map(f => [f.MaTang, f]));
    const blockMap = new Map(allBlocks.map(b => [b.MaBlock, b]));
    return allApartments.map(apt => {
        const floor = floorMap.get(apt.MaTang);
        const block = floor ? blockMap.get(floor.MaBlock) : null;
        return { ...apt, SoTang: floor ? floor.SoTang : null, TenBlock: block ? block.TenBlock : null };
      });
  }, [allApartments, allFloors, allBlocks]);

  const hydratedContracts = useMemo(() => {
    return allContracts; 
  }, [allContracts]);
  
  const handleAddNew = () => { setCurrentContract(null); setIsModalOpen(true); };
  const handleEdit = (contract) => { setCurrentContract(contract); setIsModalOpen(true); };
  const handleViewDetails = (contract) => { setDetailContract(contract); setViewMode('details'); };
  const handleBackToList = () => { setViewMode('list'); setDetailContract(null); };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Hợp đồng (ID: ${id})?`)) {
      try {
        setLoading(true);
        await contractService.delete(id);
        alert("Xóa Hợp đồng thành công!");
        loadInitialData();
      } catch (err) {
        setError(err.message || "Lỗi khi xóa Hợp đồng.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (formData, needsCCCDUpdate) => {
    try {
      setFormLoading(true);
      setError(null);

      if (needsCCCDUpdate) {
         try {
             await residentService.update(formData.BenB_Id, { CCCD: formData.CCCD });
         } catch (err) {
             throw new Error("Lỗi cập nhật CCCD: " + err.message);
         }
      }
      
      const dataToSubmit = {
        SoHopDong: formData.SoHopDong,
        MaCanHo: parseInt(formData.MaCanHo),
        BenB_Id: parseInt(formData.BenB_Id), 
        BenA_Id: formData.BenA_Id ? parseInt(formData.BenA_Id) : null,
        Loai: formData.Loai,
        GiaTriHopDong: formData.GiaTriHopDong,
        SoTienCoc: formData.SoTienCoc,
        NgayKy: formData.NgayKy,
        NgayHetHan: formData.NgayHetHan,
        DieuKhoans: formData.DieuKhoans 
      };

      if (currentContract) {
        await contractService.update(currentContract.MaHopDong, dataToSubmit);
        alert("Đã cập nhật thông tin Hợp đồng!");
      } else {
        await contractService.create(dataToSubmit); 
        alert("Tạo Hợp đồng thành công!");
      }

      setIsModalOpen(false);
      setCurrentContract(null);
      loadInitialData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi lưu Hợp đồng.";
      setError(errorMsg);
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <ContractForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
        initialData={currentContract}
        allResidents={allResidents} 
        hydratedApartments={hydratedApartments}
      />

      {viewMode === 'list' ? (
          <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Quản lý Hợp đồng</h2>
                <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow">
                + Thêm Hợp đồng Mới
                </button>
            </div>
            {error && <div className="p-4 mb-4 bg-red-50 text-red-600 rounded">Lỗi: {error}</div>}
            <ContractList
                contracts={hydratedContracts}
                onViewDetails={handleViewDetails} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={loading}
            />
          </>
      ) : (
          <ContractDetails 
              contract={detailContract} 
              onBack={handleBackToList} 
          />
      )}
    </div>
  );
}

export default ContractsPage;