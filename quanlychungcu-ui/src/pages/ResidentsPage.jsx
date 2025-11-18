// src/pages/ResidentsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';

// 1. Import Service và Components
import {residentService} from '../services/residentService';
import ResidentList from '../components/ResidentList.jsx';
import ResidentForm from '../components/ResidentForm.jsx'; 
import ResidentDetails from '../components/ResidentDetails.jsx';

const ResidentsPage = () => {
  // 2. Quản lý toàn bộ State
  const [residents, setResidents] = useState([]); // <-- Tốt! Khởi tạo mảng rỗng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentResident, setCurrentResident] = useState(null);

  const [viewMode, setViewMode] = useState('list'); 
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // 3. Logic Fetch Data (Danh sách)
  const fetchResidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // --- SỬA LỖI 1 ---
      // residentService.getAll() giờ đã trả về mảng data
      const data = await residentService.getAll();
      setResidents(data); // Bỏ .data
      // -------------------

    } catch (err) {
      console.error("Lỗi khi tải danh sách Cư dân:", err);
      setError(err.message);
    } finally {
      setLoading(false); // Luôn tắt loading
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchResidents();
    }
  }, [fetchResidents, viewMode]);

  // 4. Logic CRUD Handlers (Các hàm này đã đúng, không cần sửa)
  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa cư dân (ID: ${id})?`)) {
      try {
        await residentService.delete(id);
        fetchResidents(); 
      } catch (err) {
        console.error("Lỗi khi xóa cư dân:", err);
        setError(err.message);
      }
    }
  };

  const handleEdit = (resident) => {
    setCurrentResident(resident);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setCurrentResident(null);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = async (formData) => {
    try {
      if (currentResident) {
        await residentService.update(currentResident.MaNguoiDung, formData);
      } else {
        await residentService.create(formData);
      }
      setIsFormOpen(false);
      fetchResidents(); // Tải lại danh sách
    } catch (err) {
       console.error("Lỗi khi lưu cư dân:", err);
       setError(err.message);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  // 5. Handler cho View Details
  const handleViewDetails = async (id) => {
    setViewMode('details');
    setDetailLoading(true);
    setError(null); 
    try {
      // --- SỬA LỖI 2 ---
      // residentService.getById() giờ đã trả về object data
      const data = await residentService.getById(id);
      setDetailData(data); // Bỏ .data
      // -------------------

    } catch (err) {
      console.error("Lỗi khi tải chi tiết cư dân:", err);
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setDetailData(null); 
  };

  // 6. Render UI (Giữ nguyên)
  return (
    <div className="residents-page container mx-auto p-6">
      
      {isFormOpen && (
        <ResidentForm 
          initialData={currentResident} 
          onSubmit={handleFormSubmit} 
          onClose={handleFormClose} 
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          {viewMode === 'list' ? '👥 Quản lý Cư dân' : 'Chi tiết Cư dân'}
        </h1>
        {viewMode === 'list' && (
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md"
          >
            + Thêm Cư Dân Mới
          </button>
        )}
      </div>
      <hr className="mb-6" />
      
      {error && <div className="p-6 text-red-600 text-center font-semibold">
          ❌ Lỗi API: {error}.
        </div>}

      {viewMode === 'list' ? (
        <>
          {/* Chế độ xem Danh sách */}
          {loading && <div className="p-6 text-center text-blue-500">Đang tải danh sách Cư dân...</div>}
          {!loading && !error && (
            <ResidentList
              residents={residents}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </>
      ) : (
        <>
          {/* Chế độ xem Chi tiết */}
          {detailLoading && <div className="p-6 text-center text-blue-500">Đang tải chi tiết...</div>}
          {!detailLoading && !error && (
            <ResidentDetails
              resident={detailData}
              onBack={handleBackToList}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ResidentsPage;