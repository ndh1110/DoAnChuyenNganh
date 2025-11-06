// src/pages/ResidentsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';

// 1. Import Service và Components
import * as residentService from '../services/residentService';
import ResidentList from '../components/ResidentList.jsx';
import ResidentForm from '../components/ResidentForm.jsx'; 
// --- THAY ĐỔI 1: Import component chi tiết ---
import ResidentDetails from '../components/ResidentDetails.jsx';

const ResidentsPage = () => {
  // 2. Quản lý toàn bộ State
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentResident, setCurrentResident] = useState(null);

  // --- THAY ĐỔI 2: Thêm state cho chế độ xem chi tiết ---
  const [viewMode, setViewMode] = useState('list'); // 'list' hoặc 'details'
  const [detailData, setDetailData] = useState(null); // Lưu data chi tiết
  const [detailLoading, setDetailLoading] = useState(false);
  
  // 3. Logic Fetch Data (Danh sách)
  const fetchResidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await residentService.getAllResidents();
      setResidents(response.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách Cư dân:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Chỉ fetch danh sách khi ở chế độ 'list'
    if (viewMode === 'list') {
      fetchResidents();
    }
  }, [fetchResidents, viewMode]);

  // 4. Logic CRUD Handlers (Delete, Edit, Create, Submit, Close Form)
  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa cư dân (ID: ${id})?`)) {
      try {
        await residentService.deleteResident(id);
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
        await residentService.updateResident(currentResident.MaNguoiDung, formData);
      } else {
        await residentService.createResident(formData);
      }
      setIsFormOpen(false);
      fetchResidents();
    } catch (err) {
       console.error("Lỗi khi lưu cư dân:", err);
       setError(err.message);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  // --- THAY ĐỔI 3: Thêm handler cho View Details ---
  const handleViewDetails = async (id) => {
    setViewMode('details');
    setDetailLoading(true);
    setError(null); // Xóa lỗi cũ (nếu có)
    try {
      // Gọi API lấy chi tiết
      const response = await residentService.getResidentById(id);
      setDetailData(response.data);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết cư dân:", err);
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setDetailData(null); // Xóa data chi tiết
  };

  // 5. Render UI
  return (
    <div className="residents-page container mx-auto p-6">
      
      {/* Form (Modal) cho Create/Update */}
      {isFormOpen && (
        <ResidentForm 
          initialData={currentResident} 
          onSubmit={handleFormSubmit} 
          onClose={handleFormClose} 
        />
      )}

      {/* Tiêu đề trang */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          {/* --- THAY ĐỔI 4: Tiêu đề động --- */}
          {viewMode === 'list' ? '👥 Quản lý Cư dân' : 'Chi tiết Cư dân'}
        </h1>
        {/* Chỉ hiển thị nút "Thêm" ở màn hình danh sách */}
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
      
      {/* Hiển thị lỗi chung */}
      {error && <div className="p-6 text-red-600 text-center font-semibold">
          ❌ Lỗi API: {error}.
        </div>}

      {/* --- THAY ĐỔI 5: Logic render động (List hoặc Details) --- */}
      {viewMode === 'list' ? (
        <>
          {/* Chế độ xem Danh sách */}
          {loading && <div className="p-6 text-center text-blue-500">Đang tải danh sách Cư dân...</div>}
          {!loading && !error && (
            <ResidentList
              residents={residents}
              onViewDetails={handleViewDetails} // Truyền handler mới
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