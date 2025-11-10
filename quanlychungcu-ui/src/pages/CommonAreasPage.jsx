// src/pages/CommonAreasPage.jsx
import React, { useState, useEffect, useCallback } from 'react';

// 1. Import Services và Components
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
  // 2. Quản lý State (Không đổi)
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

  // 3. Logic Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // (Gọi API y hệt như file EmployeesPage)
      const [areaRes, incidentRes, inspectRes, blockRes, empRes] = await Promise.all([
        commonAreaService.getAll(),    
        incidentService.getAll(),      
        inspectionService.getAll(),
        blockService.getAll(),          
        employeeService.getAllEmployees(), // Đã sửa ở bước trước
      ]);
      
      // --- THAY ĐỔI 1: Bỏ '.data' (vì service đã xử lý) ---
      setCommonAreas(areaRes); 
      setIncidents(incidentRes); 
      setInspections(inspectRes);
      setAllBlocks(blockRes);
      setAllEmployees(empRes); 

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Kỹ thuật:", err);
      setError(err.message || "Lỗi khi tải dữ liệu Kỹ thuật.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 4. Logic CRUD Handlers (Không đổi)
  const handleFormSubmit = async (formData) => {
    /* ... (Logic handleFormSubmit không đổi) ... */
    try {
      const { modalType, initialData } = formState;
      
      if (modalType === 'AREA') {
        if (initialData) await commonAreaService.update(initialData.MaKhuVucChung, formData);
        else await commonAreaService.create(formData);
      
      } else if (modalType === 'INCIDENT') {
        if (initialData) await incidentService.update(initialData.MaSuCo, formData);
        else await incidentService.create(formData);
      
      } else if (modalType === 'INSPECTION') {
        await inspectionService.create(formData);
      }
      
      closeForm();
      fetchData(); // Tải lại toàn bộ
    } catch (err) {
       console.error("Lỗi khi lưu dữ liệu:", err);
       setError(err.response?.data || err.message);
    }
  };

  const handleDelete = async (type, id) => {
    /* ... (Logic handleDelete không đổi) ... */
    let confirmMessage = `Bạn có chắc muốn xóa (ID: ${id})?`;
    let deleteAction;

    if (type === 'AREA') {
        confirmMessage = `Xóa Khu vực (ID: ${id})? (Sẽ xóa/gỡ liên kết Sự cố, Kiểm tra, Phân công)`;
        deleteAction = () => commonAreaService.delete(id);
    } else if (type === 'INCIDENT') {
        deleteAction = () => incidentService.delete(id);
    } else if (type === 'INSPECTION') {
        deleteAction = () => inspectionService.delete(id);
    }

    if (window.confirm(confirmMessage)) {
      try {
        await deleteAction();
        fetchData(); // Tải lại
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

  // 6. Render UI (Không đổi)
  const renderModal = () => {
    /* ... (Logic renderModal không đổi) ... */
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
      
      {/* --- MODALS --- */}
      {renderModal()}

      {/* --- Tiêu đề Trang & Nút bấm (Không đổi) --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          🏞️ Quản lý Kỹ thuật & Vận hành
        </h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => openForm('AREA')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md">
            + Thêm Khu Vực
          </button>
          <button onClick={() => openForm('INCIDENT')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-md">
            + Báo Sự Cố
          </button>
          <button onClick={() => openForm('INSPECTION')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md">
            + Ghi Kiểm Tra
          </button>
        </div>
      </div>
      <hr className="mb-6" />

      {error && <div className="p-6 text-red-600 text-center font-semibold">❌ Lỗi API: {error}</div>}

      {/* --- Hiển thị các danh sách (Không đổi) --- */}
      <CommonAreaList
        areas={commonAreas}
        isLoading={loading}
        onEdit={(data) => openForm('AREA', data)}
        onDelete={(id) => handleDelete('AREA', id)}
      />
      <IncidentList
        incidents={incidents}
        isLoading={loading}
        onEdit={(data) => openForm('INCIDENT', data)}
        onDelete={(id) => handleDelete('INCIDENT', id)}
      />
      <InspectionList
        inspections={inspections}
        isLoading={loading}
        onDelete={(id) => handleDelete('INSPECTION', id)}
      />
    </div>
  );
};

export default CommonAreasPage;