// src/pages/UserManagementPage.jsx (PREMIUM SECURITY UI)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { roleService } from '../services/roleService';
import RoleEditModal from '../components/RoleEditModal.jsx';
import toast, { Toaster } from 'react-hot-toast';

// --- UI COMPONENTS ---
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);

const RoleBadge = ({ roleName }) => {
    const r = (roleName || "").toLowerCase();
    let style = "bg-gray-100 text-gray-600 border-gray-200"; // Default (Cư dân/Khách)
    
    if (r.includes('admin') || r.includes('quản trị')) style = "bg-red-100 text-red-700 border-red-200";
    else if (r.includes('quản lý')) style = "bg-blue-100 text-blue-700 border-blue-200";
    else if (r.includes('kỹ thuật') || r.includes('nhân viên')) style = "bg-yellow-100 text-yellow-700 border-yellow-200";
    
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold border ${style} inline-block mr-1 mb-1`}>
            {roleName}
        </span>
    );
};

function UserManagementPage() {
  const [userRolesList, setUserRolesList] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // --- FETCH DATA ---
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        roleService.getUserRoles(),
        roleService.getAllRoles()
      ]);
      setUserRolesList(Array.isArray(usersData) ? usersData : []);
      setAllRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // --- MEMOIZED DATA ---
  const stats = useMemo(() => {
      const users = userRolesList;
      const countRole = (keyword) => users.filter(u => u.Roles.some(r => r.TenVaiTro.toLowerCase().includes(keyword))).length;
      
      return {
          total: users.length,
          admins: countRole('admin') + countRole('quản trị'),
          managers: countRole('quản lý'),
          staff: countRole('nhân viên') + countRole('kỹ thuật')
      };
  }, [userRolesList]);

  const filteredUsers = useMemo(() => {
      return userRolesList.filter(u => {
          const matchSearch = 
              (u.HoTen || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (u.Email || '').toLowerCase().includes(searchTerm.toLowerCase());
          
          let matchFilter = true;
          if (filterRole !== 'All') {
              // Lọc xem user có role nào chứa từ khóa filter không
              matchFilter = u.Roles.some(r => r.TenVaiTro.toLowerCase().includes(filterRole.toLowerCase()));
          }
          return matchSearch && matchFilter;
      });
  }, [userRolesList, searchTerm, filterRole]);

  // --- HANDLERS ---
  const handleOpenModal = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (userId, roleIds) => {
    setFormLoading(true);
    try {
      await roleService.syncUserRoles(userId, roleIds);
      toast.success("Cập nhật quyền hạn thành công!");
      setIsModalOpen(false);
      loadData(); 
    } catch (err) {
      toast.error("Lỗi: " + (err.response?.data || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Phân quyền Hệ thống</h1>
          <p className="text-slate-500 mt-1">Kiểm soát truy cập và cấp bậc tài khoản người dùng</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              <StatCard title="Tổng Tài khoản" value={stats.total} icon="👥" color="bg-gray-100 text-gray-600" />
              <StatCard title="Quản trị viên" value={stats.admins} icon="🛡️" color="bg-red-100 text-red-600" />
              <StatCard title="Quản lý" value={stats.managers} icon="💼" color="bg-blue-100 text-blue-600" />
              <StatCard title="Nhân viên" value={stats.staff} icon="👷" color="bg-yellow-100 text-yellow-600" />
          </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              <input 
                  type="text" 
                  placeholder="Tìm theo tên hoặc email..." 
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
              <option value="admin">🛡️ Admin / Quản trị</option>
              <option value="quản lý">💼 Quản lý</option>
              <option value="nhân viên">👷 Nhân viên</option>
              <option value="cư dân">🏠 Cư dân</option>
          </select>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
              <div className="p-12 text-center text-slate-500">⏳ Đang tải danh sách...</div>
          ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic">Không tìm thấy người dùng phù hợp.</div>
          ) : (
              <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                      <tr>
                          <th className="p-4 pl-6">Người dùng</th>
                          <th className="p-4">Vai trò hiện tại</th>
                          <th className="p-4 text-right pr-6">Hành động</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => (
                          <tr key={user.MaNguoiDung} className="hover:bg-blue-50/50 transition-colors">
                              <td className="p-4 pl-6">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                                          {user.HoTen ? user.HoTen.charAt(0).toUpperCase() : '?'}
                                      </div>
                                      <div>
                                          <div className="font-bold text-slate-800">{user.HoTen}</div>
                                          <div className="text-xs text-gray-500">{user.Email} • ID: {user.MaNguoiDung}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-4">
                                  <div className="flex flex-wrap gap-1">
                                      {user.Roles && user.Roles.length > 0 ? (
                                          user.Roles.map(role => (
                                              <RoleBadge key={role.MaVaiTro} roleName={role.TenVaiTro} />
                                          ))
                                      ) : <span className="text-gray-400 text-sm italic">Chưa phân quyền</span>}
                                  </div>
                              </td>
                              <td className="p-4 text-right pr-6">
                                  <button 
                                      onClick={() => handleOpenModal(user)} 
                                      className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                  >
                                      ✏️ Chỉnh sửa
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          )}
      </div>
      
      {/* EDIT MODAL */}
      <RoleEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isLoading={formLoading}
        allRoles={allRoles}
        currentUser={currentUser}
      />
    </div>
  );
}

export default UserManagementPage;