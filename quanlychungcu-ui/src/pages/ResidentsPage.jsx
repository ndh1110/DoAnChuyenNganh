import React, { useState, useEffect, useCallback } from 'react';
import {residentService} from '../services/residentService';
import ResidentList from '../components/ResidentList.jsx';
import ResidentForm from '../components/ResidentForm.jsx'; 
import ResidentDetails from '../components/ResidentDetails.jsx';

const ResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentResident, setCurrentResident] = useState(null);
  const [viewMode, setViewMode] = useState('list'); 
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const fetchResidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await residentService.getAll();
      setResidents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (viewMode === 'list') fetchResidents(); }, [fetchResidents, viewMode]);

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa cư dân (ID: ${id})?`)) {
      try { await residentService.delete(id); fetchResidents(); } 
      catch (err) { setError(err.message); }
    }
  };

  const handleEdit = (resident) => { setCurrentResident(resident); setIsFormOpen(true); };
  const handleCreateNew = () => { setCurrentResident(null); setIsFormOpen(true); };
  
  const handleFormSubmit = async (formData) => {
    try {
      if (currentResident) await residentService.update(currentResident.MaNguoiDung, formData);
      else await residentService.create(formData);
      setIsFormOpen(false);
      fetchResidents();
    } catch (err) { alert("Lỗi: " + err.message); }
  };

  const handleViewDetails = async (id) => {
    setViewMode('details');
    setDetailLoading(true);
    try {
      const data = await residentService.getById(id);
      setDetailData(data);
    } catch (err) { setError(err.message); } 
    finally { setDetailLoading(false); }
  };

  const handleBackToList = () => { setViewMode('list'); setDetailData(null); };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {isFormOpen && <ResidentForm initialData={currentResident} onSubmit={handleFormSubmit} onClose={() => setIsFormOpen(false)} />}

      {viewMode === 'list' ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Quản lý Cư dân</h1>
                <p className="text-slate-500 mt-1">Danh sách cư dân đang sinh sống tại Grand Horizon</p>
            </div>
            <button onClick={handleCreateNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all">
                + Thêm Cư Dân
            </button>
          </div>

          {loading ? <div className="p-12 text-center text-slate-500 animate-pulse">⏳ Đang tải...</div> : 
           error ? <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">❌ {error}</div> : 
           <ResidentList residents={residents} onViewDetails={handleViewDetails} onEdit={handleEdit} onDelete={handleDelete} />
          }
        </>
      ) : (
        <>
          {detailLoading ? <div className="p-12 text-center text-slate-500">Đang tải chi tiết...</div> : 
           <ResidentDetails resident={detailData} onBack={handleBackToList} />
          }
        </>
      )}
    </div>
  );
};

export default ResidentsPage;