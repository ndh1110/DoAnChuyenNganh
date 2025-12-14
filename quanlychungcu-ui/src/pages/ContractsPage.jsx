// src/pages/ContractsPage.jsx (PREMIUM CONTRACT MANAGEMENT)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { contractService } from '../services/contractService';
import { residentService } from '../services/residentService';
import { blockService } from '../services/blockService';
import ContractForm from '../components/ContractForm';
import ContractDetails from '../components/ContractDetails';
import toast, { Toaster } from 'react-hot-toast';

// --- HELPER FORMATS ---
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

// --- UI COMPONENTS ---
const StatCard = ({ title, value, icon, color, subText }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
    </div>
);

const StatusBadge = ({ contract }) => {
    const today = new Date();
    const expiryDate = contract.NgayHetHan ? new Date(contract.NgayHetHan) : null;
    
    // Logic trạng thái
    if (!expiryDate) return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Vô thời hạn</span>;
    
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">Đã hết hạn</span>;
    if (diffDays <= 30) return <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Sắp hết hạn ({diffDays} ngày)</span>;
    
    return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Đang hiệu lực</span>;
};

function ContractsPage() {
  // Data State
  const [allContracts, setAllContracts] = useState([]);
  const [allResidents, setAllResidents] = useState([]); 
  const [allApartments, setAllApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'details'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);
  const [detailContract, setDetailContract] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All', 'Mua/Bán', 'Cho thuê'

  // --- FETCH DATA ---
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [contractsData, residentsData, apartmentsData, floorsData, blocksData] = await Promise.all([
        contractService.getAll(),
        residentService.getAll(),
        blockService.getAllApartments(),
        blockService.getAllFloors(),
        blockService.getAll()
      ]);

      setAllContracts(contractsData);
      setAllResidents(residentsData);
      
      // Hydrate Apartments (Map Block/Floor info)
      const floorMap = new Map(floorsData.map(f => [f.MaTang, f]));
      const blockMap = new Map(blocksData.map(b => [b.MaBlock, b]));
      
      const hydratedApts = apartmentsData.map(apt => {
          const floor = floorMap.get(apt.MaTang);
          const block = floor ? blockMap.get(floor.MaBlock) : null;
          return { 
              ...apt, 
              SoTang: floor ? floor.SoTang : null, 
              TenBlock: block ? block.TenBlock : null 
          };
      });
      setAllApartments(hydratedApts);

    } catch (err) {
      toast.error("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  // --- STATS & FILTER ---
  const stats = useMemo(() => {
      const totalValue = allContracts.reduce((sum, c) => sum + (parseFloat(c.GiaTriHopDong) || 0), 0);
      const expiringSoon = allContracts.filter(c => {
          if (!c.NgayHetHan) return false;
          const days = Math.ceil((new Date(c.NgayHetHan) - new Date()) / (1000 * 60 * 60 * 24));
          return days > 0 && days <= 30;
      }).length;

      return {
          count: allContracts.length,
          value: formatCurrency(totalValue),
          expiring: expiringSoon
      };
  }, [allContracts]);

  const filteredContracts = useMemo(() => {
      return allContracts.filter(c => {
          const matchSearch = 
              c.SoHopDong.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (c.TenBenB || '').toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchType = filterType === 'All' || c.Loai === filterType;
          
          return matchSearch && matchType;
      });
  }, [allContracts, searchTerm, filterType]);

  // --- HANDLERS ---
  const handleAddNew = () => { setCurrentContract(null); setIsModalOpen(true); };
  const handleEdit = (e, contract) => { e.stopPropagation(); setCurrentContract(contract); setIsModalOpen(true); };
  
  const handleViewDetails = (contract) => { 
      // Gắn thêm thông tin căn hộ vào để hiển thị chi tiết
      const apt = allApartments.find(a => a.MaCanHo === contract.MaCanHo);
      setDetailContract({ ...contract, ApartmentInfo: apt }); 
      setViewMode('details'); 
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(`Xóa Hợp đồng ${id}? Dữ liệu liên quan có thể bị ảnh hưởng.`)) return;
    try {
        await contractService.delete(id);
        toast.success("Đã xóa hợp đồng");
        loadInitialData();
    } catch (err) { toast.error("Lỗi xóa: " + err.message); }
  };

  const handleFormSubmit = async (formData, needsCCCDUpdate) => {
    setFormLoading(true);
    try {
      if (needsCCCDUpdate) {
         await residentService.update(formData.BenB_Id, { CCCD: formData.CCCD });
      }
      
      const payload = {
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
        await contractService.update(currentContract.MaHopDong, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await contractService.create(payload); 
        toast.success("Tạo hợp đồng mới thành công!");
      }

      setIsModalOpen(false);
      loadInitialData();
    } catch (err) {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* MODAL FORM */}
      <ContractForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
        initialData={currentContract}
        allResidents={allResidents} 
        hydratedApartments={allApartments}
      />

      {viewMode === 'list' ? (
          <>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý Hợp đồng</h1>
                    <p className="text-slate-500 mt-1">Lưu trữ hồ sơ pháp lý, mua bán và cho thuê căn hộ</p>
                </div>
                <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                    📄 Soạn Hợp đồng Mới
                </button>
            </div>

            {/* DASHBOARD STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <StatCard title="Tổng Hợp đồng" value={stats.count} icon="📑" color="bg-blue-100 text-blue-600" />
                <StatCard title="Tổng Giá trị (VNĐ)" value={stats.value} icon="💰" color="bg-green-100 text-green-600" />
                <StatCard title="Sắp hết hạn (30 ngày)" value={stats.expiring} icon="⚠️" color="bg-orange-100 text-orange-600" subText="Cần gia hạn gấp" />
            </div>

            {/* FILTERS */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Tìm số hợp đồng, tên chủ hộ..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="All">Tất cả Loại</option>
                    <option value="Mua/Bán">🤝 Mua Bán</option>
                    <option value="Cho thuê">🔑 Cho Thuê</option>
                </select>
            </div>

            {/* MAIN LIST */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? <div className="p-12 text-center text-slate-500">⏳ Đang tải dữ liệu...</div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="p-4 pl-6">Số Hợp Đồng</th>
                                    <th className="p-4">Căn hộ</th>
                                    <th className="p-4">Đối tác (Bên B)</th>
                                    <th className="p-4">Giá trị / Cọc</th>
                                    <th className="p-4">Thời hạn</th>
                                    <th className="p-4 text-right pr-6">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredContracts.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-400">Không tìm thấy hợp đồng nào.</td></tr>
                                ) : (
                                    filteredContracts.map(c => (
                                        <tr 
                                            key={c.MaHopDong} 
                                            onClick={() => handleViewDetails(c)}
                                            className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                        >
                                            <td className="p-4 pl-6">
                                                <div className="font-bold text-blue-600">{c.SoHopDong}</div>
                                                <div className={`text-xs px-2 py-0.5 rounded border inline-block mt-1 font-bold ${c.Loai === 'Mua/Bán' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                                    {c.Loai}
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-gray-700">
                                                {/* Tìm tên Block từ ID căn hộ */}
                                                {(() => {
                                                    const apt = allApartments.find(a => a.MaCanHo === c.MaCanHo);
                                                    return apt ? <span>{apt.SoCanHo} <span className="text-gray-400 text-xs">({apt.TenBlock})</span></span> : c.MaCanHo;
                                                })()}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800">{c.TenBenB}</div>
                                                <div className="text-xs text-gray-500">ID: {c.BenB_Id}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{formatCurrency(c.GiaTriHopDong)}</div>
                                                {c.SoTienCoc > 0 && <div className="text-xs text-gray-500">Cọc: {formatCurrency(c.SoTienCoc)}</div>}
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge contract={c} />
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Hết hạn: {c.NgayHetHan ? formatDate(c.NgayHetHan) : '--'}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right pr-6">
                                                <button onClick={(e) => handleEdit(e, c)} className="text-gray-400 hover:text-blue-600 p-2 mr-1" title="Sửa">✏️</button>
                                                <button onClick={(e) => handleDelete(e, c.MaHopDong)} className="text-gray-400 hover:text-red-600 p-2" title="Xóa">🗑️</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
          </>
      ) : (
          <ContractDetails 
              contract={detailContract} 
              onBack={() => setViewMode('list')} 
          />
      )}
    </div>
  );
}

export default ContractsPage;