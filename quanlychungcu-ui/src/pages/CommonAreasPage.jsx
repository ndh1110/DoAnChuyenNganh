// src/pages/CommonAreasPage.jsx
import React, { useState, useEffect, useCallback } from 'react';

// 1. Import useAuth
import { useAuth } from '../context/AuthContext';

import { commonAreaService } from '../services/commonAreaService';
import { incidentService } from '../services/incidentService';
import { inspectionService } from '../services/inspectionService';
import { employeeService } from '../services/employeeService';
import { blockService } from '../services/blockService';

import CommonAreaList from '../components/CommonAreaList.jsx';
import IncidentList from '../components/IncidentList.jsx';
import InspectionList from '../components/InspectionList.jsx';
import CommonAreaForm from '../components/CommonAreaForm.jsx';
import IncidentForm from '../components/IncidentForm.jsx';
import InspectionForm from '../components/InspectionForm.jsx';

const CommonAreasPage = () => {
  // --- LOGIC PHÂN QUYỀN ---
  const { user } = useAuth();
  // Nhóm quyền được quản lý kỹ thuật (bao gồm Kỹ thuật viên)
  const canManageTech = ['Quản lý', 'Admin', 'Kỹ thuật'].includes(user?.role);
  // Nhóm quyền được quản lý cấu trúc (Thêm/Sửa Khu vực) - Có thể chỉ dành cho Quản lý
  const canManageArea = ['Quản lý', 'Admin'].includes(user?.role);

  // -------------------------

  const [commonAreas, setCommonAreas] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allBlocks, setAllBlocks] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [formState, setFormState] = useState({
    modalType: null, 
    initialData: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Nếu là Cư dân -> Chỉ cần tải danh sách Khu vực và Sự cố (để xem)
      // Nếu là Tech -> Tải hết
      const promises = [
        commonAreaService.getAll(),    
        incidentService.getAll(),      
        blockService.getAll(),          
      ];

      // Chỉ tải Inspection và Employee nếu có quyền kỹ thuật
      if (canManageTech) {
          promises.push(inspectionService.getAll());
          promises.push(employeeService.getAllEmployees());
      }

      const results = await Promise.all(promises);
      
      setCommonAreas(results[0]); 
      setIncidents(results[1]); 
      setAllBlocks(results[2]);

      if (canManageTech) {
          setInspections(results[3]);
          setAllEmployees(results[4]); 
      }

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Kỹ thuật:", err);
      setError(err.message || "Lỗi khi tải dữ liệu Kỹ thuật.");
    } finally {
      setLoading(false);
    }
  }, [canManageTech]); // Thêm dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormSubmit = async (formData) => {
    try {
      const { modalType, initialData } = formState;
      
      if (modalType === 'AREA') {
        if (initialData) await commonAreaService.update(initialData.MaKhuVucChung, formData);
        else await commonAreaService.create(formData);
      
      } else if (modalType === 'INCIDENT') {
        // Cư dân cũng có thể báo sự cố? Nếu có, không cần chặn ở đây.
        // Nếu chỉ Tech mới báo sự cố hệ thống -> Chặn.
        // Giả sử Cư dân ĐƯỢC báo sự cố:
        if (initialData) await incidentService.update(initialData.MaSuCo, formData);
        else await incidentService.create(formData);
      
      } else if (modalType === 'INSPECTION') {
        await inspectionService.create(formData);
      }
      
      closeForm();
      fetchData();
    } catch (err) {
       console.error("Lỗi khi lưu dữ liệu:", err);
       setError(err.response?.data || err.message);
    }
  };

  const handleDelete = async (type, id) => {
    let confirmMessage = `Bạn có chắc muốn xóa (ID: ${id})?`;
    let deleteAction;

    if (type === 'AREA') {
        confirmMessage = `Xóa Khu vực (ID: ${id})?`;
        deleteAction = () => commonAreaService.delete(id);
    } else if (type === 'INCIDENT') {
        deleteAction = () => incidentService.delete(id);
    } else if (type === 'INSPECTION') {
        deleteAction = () => inspectionService.delete(id);
    }

    if (window.confirm(confirmMessage)) {
      try {
        await deleteAction();
        fetchData(); 
      } catch (err) {
        console.error("Lỗi khi xóa:", err);
        setError(err.message);
      }
    }
  };
  
  const openForm = (modalType, initialData = null) => {
    setFormState({ modalType, initialData });
  };
  const closeForm = () => {
    setFormState({ modalType: null, initialData: null });
  };

  const renderModal = () => {
    const { modalType, initialData } = formState;
    if (!modalType) return null;

    if (modalType === 'AREA') {
      return <CommonAreaForm 
                initialData={initialData} 
                allBlocks={allBlocks} 
                onSubmit={handleFormSubmit} 
                onClose={closeForm} />;
    }
    if (modalType === 'INCIDENT') {
       return <IncidentForm 
                initialData={initialData} 
                allCommonAreas={commonAreas}
                allEmployees={allEmployees} 
                onSubmit={handleFormSubmit} 
                onClose={closeForm} />;
    }
    if (modalType === 'INSPECTION') {
       return <InspectionForm 
                allCommonAreas={commonAreas}
                allEmployees={allEmployees} 
                onSubmit={handleFormSubmit} 
                onClose={closeForm} />;
    }
    return null;
  };

  return (
    <div className="common-areas-page container mx-auto p-6">
      
      {renderModal()}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          🏞️ Khu vực chung & Tiện ích
        </h1>
        
        <div className="flex flex-wrap gap-2">
          {/* 1. NÚT THÊM KHU VỰC: Chỉ Quản lý */}
          {canManageArea && (
            <button onClick={() => openForm('AREA')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md">
                + Thêm Khu Vực
            </button>
          )}

          {/* 2. NÚT BÁO SỰ CỐ: Cho phép cả Cư dân (để báo hỏng hóc) */}
          <button onClick={() => openForm('INCIDENT')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-md">
            + Báo Sự Cố
          </button>

          {/* 3. NÚT GHI KIỂM TRA: Chỉ Kỹ thuật/Quản lý */}
          {canManageTech && (
            <button onClick={() => openForm('INSPECTION')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md">
                + Ghi Kiểm Tra
            </button>
          )}
        </div>
      </div>
      <hr className="mb-6" />

      {error && <div className="p-6 text-red-600 text-center font-semibold">❌ Lỗi API: {error}</div>}

      <CommonAreaList
        areas={commonAreas}
        isLoading={loading}
        onEdit={(data) => openForm('AREA', data)}
        onDelete={(id) => handleDelete('AREA', id)}
        canManage={canManageArea} // <--- TRUYỀN QUYỀN XUỐNG LIST
      />
      
      {/* Danh sách sự cố (Ai cũng xem được để biết tình trạng) */}
      <IncidentList
        incidents={incidents}
        isLoading={loading}
        onEdit={(data) => canManageTech && openForm('INCIDENT', data)} // Chỉ Tech mới sửa trạng thái sự cố
        onDelete={(id) => handleDelete('INCIDENT', id)}
        canManage={canManageTech}
      />

      {/* Danh sách kiểm tra (Chỉ hiện cho Kỹ thuật xem) */}
      {canManageTech && (
        <InspectionList
            inspections={inspections}
            isLoading={loading}
            onDelete={(id) => handleDelete('INSPECTION', id)}
        />
      )}
    </div>
  );
};

export default CommonAreasPage;