// src/pages/ResidentsPage.jsx (PREMIUM ADMIN UI)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { residentService } from '../services/residentService';
import ResidentForm from '../components/ResidentForm.jsx'; 
import ResidentDetails from '../components/ResidentDetails.jsx';
import toast, { Toaster } from 'react-hot-toast';

// --- UI COMPONENTS NHỎ ---
const StatCard = ({ title, value, icon, color, subText }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
            {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
    </div>
);

const RoleBadge = ({ role }) => {
    // Chuẩn hóa role về chữ thường để so sánh
    const r = (role || "").toLowerCase();
    if (r.includes('chủ')) return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">👑 Chủ hộ</span>;
    if (r.includes('thuê')) return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">🏘️ Khách thuê</span>;
    return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs border border-gray-200">Cư dân</span>;
};

const ResidentsPage = () => {
  // State Data
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State UI & Filter
  const [viewMode, setViewMode] = useState('list'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All'); // 'All', 'Owner', 'Tenant'

  // State Modal & Detail
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentResident, setCurrentResident] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // --- FETCH DATA ---
  const fetchResidents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await residentService.getAll();
      setResidents(data);
    } catch (err) {
      toast.error("Lỗi tải danh sách: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (viewMode === 'list') fetchResidents(); }, [fetchResidents, viewMode]);

  // --- STATS & FILTER LOGIC (useMemo để tối ưu) ---
  const stats = useMemo(() => {
      const total = residents.length;
      const owners = residents.filter(r => (r.VaiTro || '').toLowerCase().includes('chủ')).length;
      const tenants = residents.filter(r => (r.VaiTro || '').toLowerCase().includes('thuê')).length;
      return { total, owners, tenants };
  }, [residents]);

  const filteredResidents = useMemo(() => {
      return residents.filter(r => {
          const matchSearch = 
              (r.HoTen || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (r.SoDienThoai || '').includes(searchTerm) ||
              (r.Email || '').toLowerCase().includes(searchTerm.toLowerCase());
          
          let matchRole = true;
          const role = (r.VaiTro || '').toLowerCase();
          if (filterRole === 'Owner') matchRole = role.includes('chủ');
          if (filterRole === 'Tenant') matchRole = role.includes('thuê');

          return matchSearch && matchRole;
      });
  }, [residents, searchTerm, filterRole]);

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    if (!window.confirm(`Xóa cư dân ID: ${id}? Hành động này không thể hoàn tác.`)) return;
    const toastId = toast.loading("Đang xóa...");
    try { 
        await residentService.delete(id); 
        toast.success("Đã xóa thành công!", { id: toastId });
        fetchResidents(); 
    } catch (err) { 
        toast.error("Lỗi xóa: " + err.message, { id: toastId }); 
    }
  };

  const handleEdit = (e, resident) => { 
      e.stopPropagation(); // Tránh click vào row
      setCurrentResident(resident); 
      setIsFormOpen(true); 
  };
  
  const handleCreateNew = () => { 
      setCurrentResident(null); 
      setIsFormOpen(true); 
  };
  
  const handleFormSubmit = async (formData) => {
    try {
      if (currentResident) await residentService.update(currentResident.MaNguoiDung, formData);
      else await residentService.create(formData);
      
      toast.success(currentResident ? "Cập nhật thành công!" : "Thêm cư dân mới thành công!");
      setIsFormOpen(false);
      fetchResidents();
    } catch (err) { toast.error("Lỗi lưu dữ liệu: " + err.message); }
  };

  const handleViewDetails = async (resident) => {
    setViewMode('details');
    setDetailLoading(true);
    try {
      const data = await residentService.getById(resident.MaNguoiDung);
      setDetailData(data);
    } catch (err) { toast.error("Không tải được chi tiết"); } 
    finally { setDetailLoading(false); }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {isFormOpen && (
          <ResidentForm 
            initialData={currentResident} 
            onSubmit={handleFormSubmit} 
            onClose={() => setIsFormOpen(false)} 
          />
      )}

      {viewMode === 'list' ? (
        <>
          {/* HEADER & ACTIONS */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Quản lý Cư dân</h1>
                <p className="text-slate-500 mt-1">Thông tin nhân khẩu và tình trạng cư trú</p>
            </div>
            <button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 transform hover:scale-105">
                <span className="text-xl">+</span> Thêm Cư Dân
            </button>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <StatCard 
                  title="Tổng Cư Dân" 
                  value={stats.total} 
                  icon="👥" 
                  color="bg-purple-100 text-purple-600" 
                  subText="Đang ghi nhận trên hệ thống"
              />
              <StatCard 
                  title="Chủ Hộ" 
                  value={stats.owners} 
                  icon="👑" 
                  color="bg-yellow-100 text-yellow-600" 
                  subText="Sở hữu căn hộ"
              />
              <StatCard 
                  title="Khách Thuê / Ở Ghép" 
                  value={stats.tenants} 
                  icon="🏘️" 
                  color="bg-blue-100 text-blue-600" 
                  subText="Tạm trú dài hạn"
              />
          </div>

          {/* FILTERS & TOOLBAR */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                  <input 
                      type="text" 
                      placeholder="Tìm theo tên, SĐT, Email..." 
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
              >
                  <option value="All">Tất cả Vai trò</option>
                  <option value="Owner">👑 Chủ hộ</option>
                  <option value="Tenant">🏘️ Khách thuê</option>
              </select>
          </div>

          {/* MAIN TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                  <div className="p-12 text-center text-slate-500">⏳ Đang tải dữ liệu...</div>
              ) : filteredResidents.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 italic">Không tìm thấy cư dân nào phù hợp.</div>
              ) : (
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                              <tr>
                                  <th className="p-4 pl-6">Họ và Tên</th>
                                  <th className="p-4">Liên hệ</th>
                                  <th className="p-4">Căn hộ</th>
                                  <th className="p-4">Vai trò</th>
                                  <th className="p-4">Ngày sinh</th>
                                  <th className="p-4 text-right pr-6">Hành động</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {filteredResidents.map(r => (
                                  <tr 
                                    key={r.MaNguoiDung} 
                                    onClick={() => handleViewDetails(r)}
                                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                  >
                                      {/* Cột 1: Avatar & Tên */}
                                      <td className="p-4 pl-6">
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                                  {r.HoTen ? r.HoTen.charAt(0).toUpperCase() : '?'}
                                              </div>
                                              <div>
                                                  <div className="font-bold text-gray-800">{r.HoTen}</div>
                                                  <div className="text-xs text-gray-400">ID: {r.MaNguoiDung}</div>
                                              </div>
                                          </div>
                                      </td>

                                      {/* Cột 2: Liên hệ */}
                                      <td className="p-4">
                                          <div className="text-sm text-gray-700">📞 {r.SoDienThoai || '---'}</div>
                                          <div className="text-xs text-gray-500">📧 {r.Email || '---'}</div>
                                      </td>

                                      {/* Cột 3: Căn hộ (Nếu có dữ liệu liên kết) */}
                                      <td className="p-4">
                                          {/* Giả sử API trả về MaCanHo hoặc TenCanHo, nếu không có thì để trống */}
                                          {r.SoCanHo ? (
                                              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                  {r.SoCanHo}
                                              </span>
                                          ) : <span className="text-gray-400 text-sm">--</span>}
                                      </td>

                                      {/* Cột 4: Vai trò */}
                                      <td className="p-4">
                                          <RoleBadge role={r.VaiTro} />
                                      </td>

                                      {/* Cột 5: Ngày sinh */}
                                      <td className="p-4 text-sm text-gray-600">
                                          {r.NgaySinh ? new Date(r.NgaySinh).toLocaleDateString('vi-VN') : '--'}
                                      </td>

                                      {/* Cột 6: Actions */}
                                      <td className="p-4 text-right pr-6">
                                          <button 
                                            onClick={(e) => handleEdit(e, r)}
                                            className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all mr-1"
                                            title="Sửa thông tin"
                                          >
                                              ✏️
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(r.MaNguoiDung); }}
                                            className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"
                                            title="Xóa cư dân"
                                          >
                                              🗑️
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
        </>
      ) : (
        /* DETAIL VIEW */
        <div className="animate-fade-in-up">
            <button 
                onClick={() => { setViewMode('list'); setDetailData(null); }}
                className="mb-6 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
            >
                ⬅️ Quay lại danh sách
            </button>
            
            {detailLoading ? (
                <div className="p-12 text-center text-slate-500">Đang tải hồ sơ...</div>
            ) : (
                <ResidentDetails resident={detailData} onBack={() => {}} />
            )}
        </div>
      )}
    </div>
  );
};

export default ResidentsPage;