// src/pages/EmployeesPage.jsx (ĐÃ FIX LỖI RENDER OBJECT VAI TRÒ)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employeeService';
import { roleService } from '../services/roleService';
import { commonAreaService } from '../services/commonAreaService';

import EmployeeForm from '../components/EmployeeForm';
import WorkScheduleForm from '../components/WorkScheduleForm';
import TaskAssignmentForm from '../components/TaskAssignmentForm';
import toast, { Toaster } from 'react-hot-toast';

// --- UI COMPONENTS ---
const TabButton = ({ active, label, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm ${active ? 'bg-blue-600 text-white transform scale-105' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
    >
        {label}
    </button>
);

const StatusBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    const map = {
        'active': 'bg-green-100 text-green-700',
        'inactive': 'bg-gray-100 text-gray-500',
        'nghỉ việc': 'bg-red-100 text-red-600',
        'hoàn thành': 'bg-green-100 text-green-700',
        'đang làm': 'bg-blue-100 text-blue-700',
        'chờ xử lý': 'bg-yellow-100 text-yellow-700'
    };
    // Tìm key gần đúng
    const key = Object.keys(map).find(k => s.includes(k));
    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${map[key] || 'bg-gray-100'}`}>{status}</span>;
};

const EmployeesPage = () => {
  const { user } = useAuth();
  const canManage = ['Quản lý', 'Admin'].includes(user?.role);

  // Data State
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // Support Data
  const [allUsers, setAllUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [userRolesData, setUserRolesData] = useState([]);
  const [allCommonAreas, setAllCommonAreas] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('EMPLOYEES'); 
  const [formState, setFormState] = useState({ modalType: null, initialData: null });
  const [formLoading, setFormLoading] = useState(false);

  // --- FETCH DATA ---
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [empRes, userRes, roleRes, userRoleRes, schRes, taskRes, areaRes] = await Promise.all([
        employeeService.getAllEmployees(),
        employeeService.getAllUsers(),
        roleService.getAllRoles(),
        roleService.getUserRoles(),
        employeeService.getAllSchedules(),
        employeeService.getAllAssignments(),
        employeeService.getAllCommonAreas()
      ]);
      
      // FIX CRASH: Luôn đảm bảo là mảng
      setEmployees(Array.isArray(empRes) ? empRes : []);
      setAllUsers(Array.isArray(userRes) ? userRes : []);
      setAllRoles(Array.isArray(roleRes) ? roleRes : []);
      setUserRolesData(Array.isArray(userRoleRes) ? userRoleRes : []);
      setSchedules(Array.isArray(schRes) ? schRes : []);
      setTasks(Array.isArray(taskRes) ? taskRes : []);
      setAllCommonAreas(Array.isArray(areaRes) ? areaRes : []);

    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải dữ liệu. Vui lòng kiểm tra console.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // --- MEMOIZED DATA (FIX CRASH) ---
  const hydratedEmployees = useMemo(() => {
    if (!Array.isArray(employees) || !Array.isArray(userRolesData)) return [];

    const roleMap = new Map();
    userRolesData.forEach(ur => {
        if (ur && ur.MaNguoiDung) roleMap.set(ur.MaNguoiDung, ur.Roles);
    });
    
    return employees.map(emp => ({
      ...emp,
      Roles: roleMap.get(emp.MaNguoiDung) || []
    }));
  }, [employees, userRolesData]);

  // --- HANDLERS ---
  const openForm = (type, data = null) => setFormState({ modalType: type, initialData: data });
  const closeForm = () => setFormState({ modalType: null, initialData: null });

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    const { modalType, initialData } = formState;
    try {
        if (modalType === 'EMPLOYEE') {
            const profileData = {
                NgayVaoLam: formData.NgayVaoLam || null,
                MaSoThue: formData.MaSoThue || null,
                TrangThai: formData.TrangThai,
            };
            let targetUserId = initialData ? initialData.MaNguoiDung : parseInt(formData.MaNguoiDung);
            
            if (initialData) await employeeService.updateEmployee(initialData.MaNhanVien, profileData);
            else await employeeService.createEmployee({ MaNguoiDung: targetUserId, ...profileData });
            
            if (formData.roleIds) await roleService.syncUserRoles(targetUserId, formData.roleIds);
            toast.success("Lưu hồ sơ thành công!");

        } else if (modalType === 'SCHEDULE') {
            if (initialData) await employeeService.updateSchedule(initialData.MaLichTruc, formData);
            else await employeeService.createSchedule(formData);
            toast.success("Lưu lịch trực thành công!");

        } else if (modalType === 'TASK') {
            if (initialData) await employeeService.updateAssignment(initialData.MaPhanCong, formData);
            else await employeeService.createAssignment(formData);
            toast.success("Phân công thành công!");
        }
        closeForm();
        loadData();
    } catch (err) {
        toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
        setFormLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
      if(!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
      try {
          if (type === 'EMPLOYEE') await employeeService.deleteEmployee(id);
          if (type === 'SCHEDULE') await employeeService.deleteSchedule(id);
          if (type === 'TASK') await employeeService.deleteAssignment(id);
          toast.success("Đã xóa thành công");
          loadData();
      } catch(err) { toast.error("Lỗi xóa: " + err.message); }
  }

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Quản trị Nhân sự</h1>
            <p className="text-slate-500 mt-1">Quản lý hồ sơ, phân công và giám sát hiệu quả làm việc</p>
        </div>
        
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
            <TabButton active={activeTab === 'EMPLOYEES'} label="👥 Nhân viên" onClick={() => setActiveTab('EMPLOYEES')} />
            <TabButton active={activeTab === 'SCHEDULES'} label="📅 Lịch trực" onClick={() => setActiveTab('SCHEDULES')} />
            <TabButton active={activeTab === 'TASKS'} label="📋 Phân công" onClick={() => setActiveTab('TASKS')} />
        </div>
      </div>

      {loading ? <div className="text-center py-10 text-gray-400">⏳ Đang tải dữ liệu...</div> : (
        <>
            {/* TAB 1: NHÂN VIÊN */}
            {activeTab === 'EMPLOYEES' && (
                <div>
                    {canManage && (
                        <div className="mb-6 flex justify-end">
                            <button onClick={() => openForm('EMPLOYEE')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-md">
                                + Thêm Nhân viên mới
                            </button>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hydratedEmployees.map(emp => (
                            <div key={emp.MaNhanVien} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative group">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                                            {emp.HoTen ? emp.HoTen.charAt(0) : '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{emp.HoTen}</h3>
                                            <p className="text-sm text-gray-500">{emp.Email}</p>
                                        </div>
                                    </div>
                                    {canManage && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button onClick={() => openForm('EMPLOYEE', emp)} className="text-blue-500 hover:bg-blue-50 p-2 rounded">✏️</button>
                                            <button onClick={() => handleDelete('EMPLOYEE', emp.MaNhanVien)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                                    {/* FIX LỖI RENDER OBJECT TẠI ĐÂY */}
                                    {emp.Roles && emp.Roles.length > 0 ? (
                                        emp.Roles.map((r, idx) => (
                                            <span key={idx} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-100">
                                                {/* Hiển thị TenVaiTro nếu r là object, hoặc hiển thị r nếu là string */}
                                                {typeof r === 'object' ? (r.TenVaiTro || r.tenVaiTro || 'Role?') : r}
                                            </span>
                                        ))
                                    ) : <span className="text-gray-400 text-xs italic">Chưa phân vai trò</span>}
                                </div>
                                <div className="mt-3 flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Mã NV: <b>{emp.MaNhanVien}</b></span>
                                    <StatusBadge status={emp.TrangThai} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: LỊCH TRỰC (Giữ nguyên) */}
            {activeTab === 'SCHEDULES' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">Lịch trực tuần này</h3>
                        {canManage && <button onClick={() => openForm('SCHEDULE')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm">+ Xếp lịch</button>}
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="p-4">Nhân viên</th>
                                <th className="p-4">Ngày trực</th>
                                <th className="p-4">Ca trực</th>
                                <th className="p-4">Ghi chú</th>
                                {canManage && <th className="p-4 text-right">Hành động</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {schedules.map(sch => (
                                <tr key={sch.MaLichTruc} className="hover:bg-blue-50 transition-colors">
                                    <td className="p-4 font-bold text-gray-700">{sch.TenNhanVien}</td>
                                    <td className="p-4">{new Date(sch.NgayTruc).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{sch.CaTruc}</span></td>
                                    <td className="p-4 text-gray-500 text-sm">{sch.GhiChu || '--'}</td>
                                    {canManage && (
                                        <td className="p-4 text-right">
                                            <button onClick={() => openForm('SCHEDULE', sch)} className="text-blue-600 hover:underline mr-3 text-sm">Sửa</button>
                                            <button onClick={() => handleDelete('SCHEDULE', sch.MaLichTruc)} className="text-red-600 hover:underline text-sm">Xóa</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 3: PHÂN CÔNG (Giữ nguyên) */}
            {activeTab === 'TASKS' && (
                <div>
                    {canManage && (
                        <div className="mb-6 flex justify-end">
                            <button onClick={() => openForm('TASK')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-bold shadow-md">
                                + Giao việc mới
                            </button>
                        </div>
                    )}
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <div key={task.MaPhanCong} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4 hover:border-yellow-400 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-gray-800 text-lg">{task.TenKhuVuc}</span>
                                        <StatusBadge status={task.TrangThai} />
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        👤 Phụ trách: <b>{task.TenNhanVien}</b> • 📅 {new Date(task.Ngay).toLocaleDateString('vi-VN')} ({task.Ca})
                                    </p>
                                </div>
                                {canManage && (
                                    <div className="flex gap-2">
                                        <button onClick={() => openForm('TASK', task)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded text-sm font-medium">Cập nhật</button>
                                        <button onClick={() => handleDelete('TASK', task.MaPhanCong)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded text-sm font-medium">Hủy</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
      )}

      {/* MODALS */}
      {formState.modalType === 'EMPLOYEE' && (
          <EmployeeForm 
            isOpen={true} onClose={closeForm} onSubmit={handleFormSubmit} isLoading={formLoading}
            initialData={formState.initialData} allUsers={allUsers} allRoles={allRoles}
          />
      )}
      {formState.modalType === 'SCHEDULE' && (
          <WorkScheduleForm 
            isOpen={true} onClose={closeForm} onSubmit={handleFormSubmit} isLoading={formLoading}
            initialData={formState.initialData} allEmployees={hydratedEmployees}
          />
      )}
      {formState.modalType === 'TASK' && (
          <TaskAssignmentForm 
            isOpen={true} onClose={closeForm} onSubmit={handleFormSubmit} isLoading={formLoading}
            initialData={formState.initialData} allEmployees={hydratedEmployees} allCommonAreas={allCommonAreas}
          />
      )}
    </div>
  );
};

export default EmployeesPage;