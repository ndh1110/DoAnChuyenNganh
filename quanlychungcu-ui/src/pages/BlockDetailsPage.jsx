import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blockService } from '../services/blockService';

import RoomActionModal from '../components/RoomActionModal';
import FloorForm from '../components/FloorForm';
import ApartmentForm from '../components/ApartmentForm';

const BlockDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blockData, setBlockData] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Modal
  const [isFloorModalOpen, setFloorModalOpen] = useState(false);
  const [isAptModalOpen, setAptModalOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [editingApt, setEditingApt] = useState(null);
  
  // Room Action
  const [selectedAptForAction, setSelectedAptForAction] = useState(null);
  const [isRoomActionOpen, setIsRoomActionOpen] = useState(false);

  const loadDetails = async () => {
    try {
      const data = await blockService.getById(id);
      setBlockData(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadDetails(); }, [id]);

  // --- HANDLERS ---
  const handleSubmitFloor = async (floorData) => {
      try {
          await blockService.addFloor({ ...floorData, MaBlock: id });
          setFloorModalOpen(false); loadDetails();
      } catch (err) { alert("Lỗi: " + err.message); }
  };

  const handleSubmitApartment = async (formData) => {
      try {
          if (editingApt) await blockService.updateApartment(editingApt.MaCanHo, formData);
          else await blockService.addApartment(formData);
          setAptModalOpen(false); loadDetails();
      } catch (err) { alert("Lỗi: " + err.message); }
  };

  const handleOpenAddApt = (maTang) => {
      setEditingApt(null); setSelectedFloorId(maTang); setAptModalOpen(true);
  };

  const handleDeleteApartment = async (maCanHo) => {
    if(!window.confirm("Bạn chắc chắn xóa căn hộ này?")) return;
    try { await blockService.deleteApartment(maCanHo); loadDetails(); }
    catch (err) { alert("Lỗi xóa: " + err.message); }
  };

  const handleDeleteFloor = async (maTang) => {
    if(!window.confirm("Xóa tầng sẽ xóa hết căn hộ bên trong?")) return;
    try { await blockService.deleteFloor(maTang); loadDetails(); }
    catch (err) { alert("Lỗi xóa: " + err.message); }
  };

  const handleApartmentClick = (apt) => {
      setSelectedAptForAction(apt); setIsRoomActionOpen(true);
  };

  if (loading) return <div className="p-12 text-center text-slate-500">⏳ Đang tải...</div>;
  if (!blockData) return <div className="p-12 text-center text-red-500">Không có dữ liệu.</div>;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      
      {/* MODALS */}
      <FloorForm isOpen={isFloorModalOpen} onClose={() => setFloorModalOpen(false)} onSubmit={handleSubmitFloor} blockName={blockData.TenBlock} />
      <ApartmentForm isOpen={isAptModalOpen} onClose={() => setAptModalOpen(false)} onSubmit={handleSubmitApartment} initialData={editingApt} fixedMaTang={selectedFloorId} />
      <RoomActionModal isOpen={isRoomActionOpen} onClose={() => setIsRoomActionOpen(false)} apartment={selectedAptForAction} onSuccess={loadDetails} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/blocks')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-all">←</button>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Sơ đồ {blockData.TenBlock}</h1>
                <p className="text-sm text-slate-500 font-medium">Tổng số tầng: <span className="text-blue-600">{blockData.Floors?.length || 0}</span></p>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* CHÚ THÍCH MÀU SẮC (Khớp DB: 8=Xanh #2ecc71, 11=Đỏ #e74c3c) */}
            <div className="flex gap-4 text-sm font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: '#2ecc71'}}></span> 
                    <span className="text-slate-600">Trống</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: '#e74c3c'}}></span> 
                    <span className="text-slate-600">Đã ở</span>
                </div>
            </div>

            <button onClick={() => setFloorModalOpen(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-slate-200 transition-all">
                + Thêm Tầng Mới
            </button>
        </div>
      </div>

      {/* DANH SÁCH TẦNG */}
      <div className="space-y-8">
        {blockData.Floors?.sort((a,b) => {
             const nameA = a.TenTang || ""; const nameB = b.TenTang || "";
             return nameB.localeCompare(nameA, undefined, { numeric: true });
        }).map((floor) => (
            <div key={floor.MaTang} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group/floor">
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">{(floor.TenTang||"").replace(/\D/g,'') || 'T'}</span>
                        <h3 className="font-bold text-slate-700 text-lg">{floor.TenTang}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{floor.Apartments?.length || 0} căn</span>
                        <button onClick={() => handleDeleteFloor(floor.MaTang)} className="opacity-0 group-hover/floor:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">🗑️</button>
                    </div>
                </div>
                
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    <div onClick={() => handleOpenAddApt(floor.MaTang)} className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group/add">
                        <span className="text-2xl text-slate-300 group-hover/add:text-blue-500">+</span>
                        <span className="text-xs font-semibold text-slate-400 group-hover/add:text-blue-500 mt-1">Thêm Căn</span>
                    </div>

                    {/* RENDER CĂN HỘ */}
                    {floor.Apartments?.map((apt) => {
                        // LOGIC SỬA ĐỔI: Dùng MaTrangThai thay vì TrangThai
                        const statusId = apt.MaTrangThai; // <-- QUAN TRỌNG: Dùng MaTrangThai
                        
                        // 11 = Đã ở (Màu Đỏ), 8 = Trống (Màu Xanh)
                        const isOccupied = statusId === 11;
                        
                        // Lấy màu từ API (MauSac) hoặc Fallback cứng dựa trên MaTrangThai
                        const colorCode = apt.MauSac || (isOccupied ? '#e74c3c' : '#2ecc71');

                        return (
                            <div 
                                key={apt.MaCanHo} 
                                onClick={() => handleApartmentClick(apt)}
                                className="relative group/apt aspect-[4/3] rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-all bg-white"
                                style={{ 
                                    borderColor: colorCode,
                                    color: colorCode
                                }}
                            >
                                <span className="font-bold text-lg">{apt.SoCanHo}</span>
                                
                                {/* Hiển thị trạng thái */}
                                <span className="text-[10px] uppercase tracking-wider font-bold mt-1 opacity-80" style={{ color: colorCode }}>
                                    {isOccupied ? 'Đã ở' : 'Trống'}
                                </span>
                                
                                {/* Nút Xóa */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteApartment(apt.MaCanHo); }} 
                                    className="absolute top-1 right-1 w-6 h-6 bg-white text-red-500 rounded-full shadow-sm opacity-0 group-hover/apt:opacity-100 flex items-center justify-center hover:bg-red-50 transition-all text-xs z-10 border border-red-100"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default BlockDetailsPage;