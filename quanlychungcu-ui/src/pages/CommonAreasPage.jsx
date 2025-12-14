// src/pages/CommonAreasPage.jsx (PREMIUM UI - DASHBOARD STYLE)
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { commonAreaService } from '../services/commonAreaService';
import { incidentService } from '../services/incidentService';
import { inspectionService } from '../services/inspectionService';
import { employeeService } from '../services/employeeService';
import { blockService } from '../services/blockService';

import CommonAreaForm from '../components/CommonAreaForm.jsx';
import IncidentForm from '../components/IncidentForm.jsx';
import InspectionForm from '../components/InspectionForm.jsx';
import toast, { Toaster } from 'react-hot-toast';

const CommonAreasPage = () => {
  const { user } = useAuth();
  const canManageTech = ['Quản lý', 'Admin', 'Kỹ thuật'].includes(user?.role);
  const canManageArea = ['Quản lý', 'Admin'].includes(user?.role);

  const [activeTab, setActiveTab] = useState('AREAS'); // 'AREAS', 'INCIDENTS', 'INSPECTIONS'
  const [data, setData] = useState({ areas: [], incidents: [], inspections: [], blocks: [], employees: [] });
  const [loading, setLoading] = useState(true);
  
  const [formState, setFormState] = useState({ type: null, data: null });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const promises = [
        commonAreaService.getAll(),    
        incidentService.getAll(),      
        blockService.getAll(),          
      ];
      if (canManageTech) {
          promises.push(inspectionService.getAll());
          promises.push(employeeService.getAllEmployees());
      }
      const results = await Promise.all(promises);
      
      setData({
          areas: results[0],
          incidents: results[1],
          blocks: results[2],
          inspections: canManageTech ? results[3] : [],
          employees: canManageTech ? results[4] : []
      });
    } catch (err) {
      toast.error("Lỗi tải dữ liệu kỹ thuật");
    } finally {
      setLoading(false);
    }
  }, [canManageTech]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- HANDLERS ---
  const openForm = (type, data = null) => setFormState({ type, data });
  const closeForm = () => setFormState({ type: null, data: null });

  const handleSubmit = async (formData) => {
      try {
          const { type, data } = formState;
          if (type === 'AREA') {
              if(data) await commonAreaService.update(data.MaKhuVucChung, formData);
              else await commonAreaService.create(formData);
              toast.success("Đã lưu thông tin Khu vực!");
          } else if (type === 'INCIDENT') {
              if(data) await incidentService.update(data.MaSuCo, formData);
              else await incidentService.create(formData);
              toast.success("Đã báo cáo Sự cố!");
          } else if (type === 'INSPECTION') {
              await inspectionService.create(formData);
              toast.success("Đã ghi nhận kiểm tra!");
          }
          closeForm(); fetchData();
      } catch (err) { toast.error("Lỗi: " + err.message); }
  };

  const handleDelete = async (type, id) => {
      if(!window.confirm("Bạn muốn xóa mục này?")) return;
      try {
          if(type === 'AREA') await commonAreaService.delete(id);
          if(type === 'INCIDENT') await incidentService.delete(id);
          if(type === 'INSPECTION') await inspectionService.delete(id);
          toast.success("Đã xóa!"); fetchData();
      } catch (err) { toast.error("Không thể xóa: " + err.message); }
  }

  // --- UI COMPONENTS ---
  const StatusBadge = ({ status }) => {
      const styles = {
          'Hoạt động': 'bg-green-100 text-green-700',
          'Bảo trì': 'bg-yellow-100 text-yellow-700',
          'Đóng cửa': 'bg-red-100 text-red-700',
          'Đã xử lý': 'bg-green-100 text-green-700',
          'Chờ xử lý': 'bg-red-100 text-red-700',
          'Đang xử lý': 'bg-blue-100 text-blue-700',
          'Tốt': 'bg-green-100 text-green-700',
          'Cần lưu ý': 'bg-yellow-100 text-yellow-700'
      };
      return <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Trung tâm Kỹ thuật</h1>
            <p className="text-slate-500 mt-1">Quản lý tiện ích, sự cố và bảo trì tòa nhà</p>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-2">
            {canManageArea && (
                <button onClick={() => openForm('AREA')} className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-sm">
                    + Thêm Khu Vực
                </button>
            )}
            <button onClick={() => openForm('INCIDENT')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-transform transform hover:scale-105 flex items-center gap-2">
                ⚠️ Báo Sự Cố
            </button>
            {canManageTech && (
                <button onClick={() => openForm('INSPECTION')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors">
                    ✅ Ghi Kiểm Tra
                </button>
            )}
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 mb-6 space-x-6 overflow-x-auto">
          {['AREAS', 'INCIDENTS', canManageTech ? 'INSPECTIONS' : null].filter(Boolean).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                  {tab === 'AREAS' && '🏞️ Khu vực chung'}
                  {tab === 'INCIDENTS' && '🔧 Theo dõi sự cố'}
                  {tab === 'INSPECTIONS' && '📋 Lịch sử kiểm tra'}
              </button>
          ))}
      </div>

      {/* --- CONTENT --- */}
      {loading ? <div className="text-center py-12 text-gray-400">⏳ Đang đồng bộ dữ liệu...</div> : (
        <div className="animate-fade-in">
            
            {/* 1. KHU VỰC CHUNG (GRID CARDS) */}
            {activeTab === 'AREAS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.areas.map(area => (
                        <div key={area.MaKhuVucChung} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all relative group">
                            {canManageArea && (
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openForm('AREA', area)} className="text-gray-400 hover:text-blue-600 mr-2">✏️</button>
                                    <button onClick={() => handleDelete('AREA', area.MaKhuVucChung)} className="text-gray-400 hover:text-red-600">🗑️</button>
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                                    {area.Loai === 'Tiện ích' ? '🏊' : '🏢'}
                                </div>
                                <StatusBadge status={area.TrangThai} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{area.TenKhuVuc}</h3>
                            <p className="text-sm text-gray-500 mt-1">Thuộc: {area.TenBlock || 'Toàn khu'}</p>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                                <span>Loại: {area.Loai}</span>
                                <span>ID: #{area.MaKhuVucChung}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. SỰ CỐ (TICKET LIST) */}
            {activeTab === 'INCIDENTS' && (
                <div className="space-y-4">
                    {data.incidents.length === 0 && <div className="text-center text-gray-400 py-10">Không có sự cố nào cần xử lý.</div>}
                    {data.incidents.map(inc => (
                        <div key={inc.MaSuCo} className="bg-white rounded-lg p-4 border-l-4 border-red-500 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-red-600 font-bold">#{inc.MaSuCo}</span>
                                    <h4 className="font-bold text-gray-800">{inc.TenKhuVuc}</h4>
                                    <StatusBadge status={inc.TrangThai} />
                                </div>
                                <p className="text-gray-600">{inc.MoTa}</p>
                                <p className="text-xs text-gray-400 mt-2">Mức độ: <span className="uppercase font-bold">{inc.MucDo}</span> • NV Xử lý: {inc.TenNhanVien || 'Chưa phân công'}</p>
                            </div>
                            {canManageTech && (
                                <div className="flex gap-2">
                                    <button onClick={() => openForm('INCIDENT', inc)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100">Cập nhật</button>
                                    <button onClick={() => handleDelete('INCIDENT', inc.MaSuCo)} className="px-4 py-2 bg-gray-50 text-gray-500 rounded-lg text-sm hover:bg-red-50 hover:text-red-600">Xóa</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 3. LỊCH SỬ KIỂM TRA (TABLE) */}
            {activeTab === 'INSPECTIONS' && canManageTech && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="p-4">Khu vực</th>
                                <th className="p-4">Nhân viên KT</th>
                                <th className="p-4">Thời gian</th>
                                <th className="p-4">Đánh giá</th>
                                <th className="p-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.inspections.map(insp => (
                                <tr key={insp.MaKiemTra} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{insp.TenKhuVuc}</td>
                                    <td className="p-4 text-gray-600">{insp.TenNhanVien}</td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(insp.ThoiGian).toLocaleString('vi-VN')}</td>
                                    <td className="p-4"><StatusBadge status={insp.DanhGia} /></td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete('INSPECTION', insp.MaKiemTra)} className="text-red-400 hover:text-red-600">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}

      {/* MODALS */}
      {formState.type === 'AREA' && (
          <CommonAreaForm initialData={formState.data} allBlocks={data.blocks} onSubmit={handleSubmit} onClose={closeForm} />
      )}
      {formState.type === 'INCIDENT' && (
          <IncidentForm initialData={formState.data} allCommonAreas={data.areas} allEmployees={data.employees} onSubmit={handleSubmit} onClose={closeForm} />
      )}
      {formState.type === 'INSPECTION' && (
          <InspectionForm allCommonAreas={data.areas} allEmployees={data.employees} onSubmit={handleSubmit} onClose={closeForm} />
      )}
    </div>
  );
};

export default CommonAreasPage;