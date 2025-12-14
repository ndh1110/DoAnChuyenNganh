import React, { useState, useEffect } from 'react';
import { blockService } from '../services/blockService';
import BlockForm from '../components/BlockForm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // <--- IMPORT TOAST

const BlocksPage = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = ['Quản lý', 'Admin'].includes(user?.role);

  const loadBlocks = async () => {
    try {
      setLoading(true);
      const data = await blockService.getAll();
      setBlocks(data);
    } catch (err) {
      toast.error("Không tải được danh sách Block"); // Thay alert
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const handleCreate = () => {
    setEditingBlock(null);
    setIsModalOpen(true);
  };

  const handleEdit = (e, block) => {
    e.stopPropagation();
    setEditingBlock(block);
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    // Dùng window.confirm cũng được, hoặc sau này làm Modal Confirm riêng. Tạm giữ confirm để an toàn.
    if(!window.confirm("CẢNH BÁO: Xóa Block sẽ xóa toàn bộ Tầng và Căn hộ bên trong!")) return;
    
    const toastId = toast.loading("Đang xóa Block...");
    try { 
        await blockService.delete(id); 
        toast.success("Đã xóa Block thành công!", { id: toastId });
        loadBlocks(); 
    } catch (err) { 
        toast.error("Lỗi xóa: " + err.message, { id: toastId }); 
    }
  }

  // --- LOGIC FORM SUBMIT VỚI GIAO DIỆN MỚI ---
  const handleFormSubmit = async (formData) => {
    // Tạo ID cho toast để có thể cập nhật trạng thái (Loading -> Success/Error)
    const toastId = toast.loading("Đang xử lý dữ liệu...");

    try {
      // 1. TRƯỜNG HỢP SỬA (UPDATE)
      if (editingBlock) {
          await blockService.update(editingBlock.MaBlock, { TenBlock: formData.TenBlock });
          toast.success("Cập nhật tên Block thành công!", { id: toastId });
      } 
      // 2. TRƯỜNG HỢP TẠO MỚI (CREATE & GENERATE)
      else {
          // A. Tạo vỏ Block
          toast.loading("Đang tạo cấu trúc Block...", { id: toastId });
          const blockRes = await blockService.create({
              TenBlock: formData.TenBlock,
              SoTang: parseInt(formData.SoTang)
          });
          
          const maBlockMoi = blockRes.MaBlock || blockRes.id;
          const tongSoTang = parseInt(formData.SoTang);
          const tongSoCan = parseInt(formData.TongSoCanHo) || 0;
          const soCanMoiTang = tongSoTang > 0 ? Math.floor(tongSoCan / tongSoTang) : 0;

          // B. Vòng lặp tạo Tầng
          for (let i = 1; i <= tongSoTang; i++) {
              // Cập nhật text loading để người dùng biết tiến độ
              toast.loading(`Đang xây tầng ${i}/${tongSoTang}...`, { id: toastId });

              let tenTang = `Tầng ${i}`;
              if (i === 1) tenTang = "Sảnh (Tầng G)";
              if (i === tongSoTang && tongSoTang > 1) tenTang = "Tầng Thượng";

              const floorRes = await blockService.addFloor({
                  MaBlock: maBlockMoi,
                  TenTang: tenTang, 
                  SoTang: i
              });
              
              const maTangMoi = floorRes.MaTang || floorRes.id;

              // C. Tạo căn hộ
              if (soCanMoiTang > 0 && maTangMoi) {
                  const aptPromises = [];
                  for (let j = 1; j <= soCanMoiTang; j++) {
                      const suffix = j < 10 ? `0${j}` : `${j}`;
                      const tenCanHo = `${i}${suffix}`; 

                      aptPromises.push(blockService.addApartment({
                          MaTang: maTangMoi,
                          SoCanHo: tenCanHo,
                          DienTich: 50, 
                          MaTrangThai: 8 
                      }));
                  }
                  await Promise.all(aptPromises);
              }
          }
          
          // HOÀN TẤT -> HIỆN THÔNG BÁO ĐẸP
          toast.success((
            <div>
              <b>Khởi tạo thành công!</b>
              <div className="text-sm mt-1">
                🏢 {formData.TenBlock}<br/>
                🏗️ {tongSoTang} tầng<br/>
                🏠 ~{tongSoCan} căn hộ
              </div>
            </div>
          ), { id: toastId, duration: 5000 });
      }
      
      setIsModalOpen(false);
      loadBlocks();
    } catch (err) {
      console.error(err);
      toast.error("Thất bại: " + (err.response?.data?.message || err.message), { id: toastId });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quản lý Khu Tòa Nhà</h1>
          <p className="text-slate-500 mt-1">Danh sách các Block thuộc dự án Grand Horizon</p>
        </div>
        
        {canManage && (
          <button 
            onClick={handleCreate} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:scale-105"
          >
             🏢 + Thêm Block Mới
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-500">⏳ Đang tải...</div> : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr><th className="p-4">Mã</th><th className="p-4">Tên Block</th><th className="p-4 text-center">Quy mô</th><th className="p-4 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blocks.map(b => (
                <tr key={b.MaBlock} onClick={() => navigate(`/blocks/${b.MaBlock}`)} className="hover:bg-blue-50 cursor-pointer transition-colors">
                  <td className="p-4">#{b.MaBlock}</td>
                  <td className="p-4 font-bold text-slate-700">{b.TenBlock}</td>
                  <td className="p-4 text-center"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">{b.SoTang} Tầng</span></td>
                  <td className="p-4 text-right space-x-2">
                    {canManage && (
                        <>
                            <button onClick={(e) => handleEdit(e, b)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="Sửa tên">✏️</button>
                            <button onClick={(e) => handleDelete(e, b.MaBlock)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Xóa Block">🗑️</button>
                        </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && <BlockForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingBlock} />}
    </div>
  );
};

export default BlocksPage;