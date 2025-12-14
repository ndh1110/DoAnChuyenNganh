import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blockService } from '../services/blockService';
import RoomActionModal from '../components/RoomActionModal';
import FloorForm from '../components/FloorForm';
import ApartmentForm from '../components/ApartmentForm';
import toast from 'react-hot-toast'; // <--- IMPORT TOAST

const BlockDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blockData, setBlockData] = useState(null);
  const [loading, setLoading] = useState(true);

  // States
  const [isFloorModalOpen, setFloorModalOpen] = useState(false);
  const [isAptModalOpen, setAptModalOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [editingApt, setEditingApt] = useState(null);
  const [selectedAptForAction, setSelectedAptForAction] = useState(null);
  const [isRoomActionOpen, setIsRoomActionOpen] = useState(false);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await blockService.getById(id);
      setBlockData(data);
    } catch (err) { toast.error("Lỗi tải dữ liệu"); } finally { setLoading(false); }
  };

  useEffect(() => { loadDetails(); }, [id]);

  // --- HANDLERS ĐÃ THAY ALERT BẰNG TOAST ---
  
  const handleSubmitFloor = async (quantity) => {
      const toastId = toast.loading(`Đang xây thêm ${quantity} tầng...`);
      try {
          const currentFloors = blockData.Floors || [];
          const maxSoTang = currentFloors.reduce((max, f) => Math.max(max, f.SoTang || 0), 0);
          
          const promises = [];
          for (let i = 1; i <= quantity; i++) {
              const nextSoTang = maxSoTang + i;
              const tenTangMoi = `Tầng ${nextSoTang}`;
              promises.push(
                  blockService.addFloor({ 
                      MaBlock: id,
                      TenTang: tenTangMoi,
                      SoTang: nextSoTang 
                  })
              );
          }

          await Promise.all(promises);
          
          setFloorModalOpen(false); 
          loadDetails(); 
          toast.success(`✅ Đã thêm xong ${quantity} tầng mới!`, { id: toastId });
      } catch (err) { 
          toast.error("Lỗi thêm tầng: " + err.message, { id: toastId }); 
      }
  };

  const handleSubmitApartment = async (formData) => {
      try { 
          if (editingApt) await blockService.updateApartment(editingApt.MaCanHo, formData); 
          else await blockService.addApartment(formData); 
          setAptModalOpen(false); 
          loadDetails(); 
          toast.success(editingApt ? "Đã cập nhật căn hộ" : "Đã thêm căn hộ mới");
      } catch (err) { toast.error(err.message); }
  };

  const handleDeleteApartment = async (maCanHo) => { 
      if(!window.confirm("Xóa căn hộ này?")) return; 
      try { 
          await blockService.deleteApartment(maCanHo); 
          loadDetails(); 
          toast.success("Đã xóa căn hộ");
      } catch (err) { toast.error(err.message); } 
  };

  const handleDeleteFloor = async (maTang) => { 
      if(!window.confirm("Xóa tầng này sẽ xóa luôn các căn hộ bên trong?")) return; 
      try { 
          await blockService.deleteFloor(maTang); 
          loadDetails(); 
          toast.success("Đã xóa tầng");
      } catch (err) { toast.error(err.message); } 
  };

  const handleOpenAddApt = (maTang) => { setEditingApt(null); setSelectedFloorId(maTang); setAptModalOpen(true); };
  const handleApartmentClick = (apt) => { setSelectedAptForAction(apt); setIsRoomActionOpen(true); };

  // SẮP XẾP TẦNG (Giữ nguyên)
  const sortedFloors = blockData?.Floors?.sort((a, b) => {
     const nameA = (a.TenTang || "").toLowerCase();
     const nameB = (b.TenTang || "").toLowerCase();
     const getScore = (name, soTang) => {
         if (name.includes("thượng")) return 9999;
         if (name.includes("sảnh") || name.includes("trệt") || name.includes("g")) return -9999;
         const numFromName = parseInt(name.replace(/\D/g, ''));
         if (!isNaN(numFromName)) return numFromName;
         return soTang || 0;
     };
     const scoreA = getScore(nameA, a.SoTang);
     const scoreB = getScore(nameB, b.SoTang);
     return scoreB - scoreA;
  }) || [];

  if (loading) return <div className="p-12 text-center text-slate-500">⏳ Đang tải...</div>;
  if (!blockData) return <div className="p-12 text-center text-red-500">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <FloorForm isOpen={isFloorModalOpen} onClose={() => setFloorModalOpen(false)} onSubmit={handleSubmitFloor} blockName={blockData.TenBlock} />
      <ApartmentForm isOpen={isAptModalOpen} onClose={() => setAptModalOpen(false)} onSubmit={handleSubmitApartment} initialData={editingApt} fixedMaTang={selectedFloorId} />
      <RoomActionModal isOpen={isRoomActionOpen} onClose={() => setIsRoomActionOpen(false)} apartment={selectedAptForAction} onSuccess={loadDetails} />

      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/blocks')} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">⬅️</button>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Sơ đồ {blockData.TenBlock}</h1>
                <div className="text-sm text-slate-500 mt-1">Hiện có <b className="text-blue-600">{sortedFloors.length} Tầng</b></div>
            </div>
        </div>
        <div className="flex gap-3">
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded border text-sm"><span className="w-2 h-2 rounded-full bg-green-500"></span> Trống <span className="w-2 h-2 rounded-full bg-red-500 ml-2"></span> Đã ở</div>
             <button onClick={() => setFloorModalOpen(true)} className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-900">+ Thêm Tầng</button>
        </div>
      </div>

      {/* DANH SÁCH TẦNG */}
      <div className="space-y-6">
        {sortedFloors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-400">Chưa có tầng nào.</div>
        ) : (
            sortedFloors.map((floor) => (
                <div key={floor.MaTang} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                        <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded text-sm">
                            {floor.TenTang || `Tầng ${floor.SoTang || '?'}`}
                        </span>
                        <button onClick={() => handleDeleteFloor(floor.MaTang)} className="text-gray-400 hover:text-red-500 text-sm">🗑️ Xóa tầng</button>
                    </div>
                    
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                        <div onClick={() => handleOpenAddApt(floor.MaTang)} className="aspect-[4/3] rounded border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-blue-50 text-slate-300 hover:text-blue-500 font-bold text-xl transition-all">+</div>
                        {floor.Apartments?.map((apt) => (
                            <div 
                                key={apt.MaCanHo} 
                                onClick={() => handleApartmentClick(apt)}
                                className={`relative aspect-[4/3] rounded border-2 cursor-pointer hover:shadow-md flex flex-col items-center justify-center ${apt.MaTrangThai === 11 ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}
                            >
                                <span className="font-bold">{apt.SoCanHo}</span>
                                <span className="text-[10px] uppercase mt-1 font-bold">{apt.MaTrangThai === 11 ? 'Đã ở' : 'Trống'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default BlockDetailsPage;