import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// 1. Import Services
import { employeeService } from '../services/employeeService';
import { residentService } from '../services/residentService';
import { roleService } from '../services/roleService';
import { commonAreaService } from '../services/commonAreaService'; // <-- BỊ THIẾU

// 2. Import Components
import EmployeeList from '../components/EmployeeList';
import EmployeeForm from '../components/EmployeeForm';
import WorkScheduleList from '../components/WorkScheduleList'; // (Giả sử bạn đã có)
import WorkScheduleForm from '../components/WorkScheduleForm'; // (Giả sử bạn đã có)
import TaskAssignmentList from '../components/TaskAssignmentList'; // (Giả sử bạn đã có)
import TaskAssignmentForm from '../components/TaskAssignmentForm'; // (Giả sử bạn đã có)

const EmployeesPage = () => {

  // 3. Quản lý State (Gộp tất cả)
  // State cho Danh sách
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]); // <-- BỊ THIẾU
  const [tasks, setTasks] = useState([]);       // <-- BỊ THIẾU
  
  // State cho Dữ liệu Form
  const [allUsers, setAllUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [userRolesData, setUserRolesData] = useState([]);
  const [allCommonAreas, setAllCommonAreas] = useState([]); // <-- BỊ THIẾU

  // State chung
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal (Dùng logic cũ)
  const [formState, setFormState] = useState({ 
    modalType: null, // 'EMPLOYEE', 'SCHEDULE', 'TASK'
    initialData: null 
  }); 
  const [formLoading, setFormLoading] = useState(false);
  
  const { user } = useAuth();
  const canManage = user?.role === 'Quản lý';

  // 4. Logic Fetch Data (Fetch 7 API)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        empData, 
        usersData, 
        rolesData, 
        userRoles,
        scheduleData, // <-- MỚI
        taskData,     // <-- MỚI
        commonAreasData // <-- MỚI
      ] = await Promise.all([
        employeeService.getAll(),
        residentService.getAll(),
        roleService.getAllRoles(),
        roleService.getUserRoles(),
        employeeService.getAllSchedules(), // <-- Gọi API Lịch trực
        employeeService.getAllAssignments(), // <-- Gọi API Phân công
        commonAreaService.getAll()     // <-- Gọi API Khu vực chung
      ]);
      
      setEmployees(empData.data);
      setAllUsers(usersData.data);
      setAllRoles(rolesData);
      setUserRolesData(userRoles);
      setSchedules(scheduleData.data); // <-- Lưu Lịch trực
      setTasks(taskData.data);     // <-- Lưu Phân công
      setAllCommonAreas(commonAreasData); // <-- Lưu Khu vực chung

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu trang Nhân viên:", err);
      setError(err.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 5. Logic "Làm giàu" Nhân viên (Thêm vai trò vào)
  const hydratedEmployees = useMemo(() => {
    const userRolesMap = new Map();
    userRolesData.forEach(user => {
      userRolesMap.set(user.MaNguoiDung, user.Roles);
    });

    return employees.map(emp => ({
      ...emp,
      Roles: userRolesMap.get(emp.MaNguoiDung) || [] 
    }));
  }, [employees, userRolesData]);

  // 6. Logic CRUD Handlers (Dùng logic cũ, nhưng sửa lỗi)
  
  // Form Open/Close Handlers
  const openForm = (modalType, initialData = null) => {
    setFormState({ modalType, initialData });
  };
  const closeForm = () => {
    setFormState({ modalType: null, initialData: null });
  };

  const handleFormSubmit = async (formData) => {
    const { modalType, initialData } = formState;
    setFormLoading(true);
    
    try {
      if (modalType === 'EMPLOYEE') {
        // Logic gộp (từ code mới)
        const profileData = {
          NgayVaoLam: formData.NgayVaoLam || null,
          MaSoThue: formData.MaSoThue || null,
          TrangThai: formData.TrangThai,
        };
        let targetUserId;

        if (initialData) { // Sửa
          targetUserId = initialData.MaNguoiDung;
          await employeeService.update(initialData.MaNhanVien, profileData);
        } else { // Tạo mới
          targetUserId = parseInt(formData.MaNguoiDung);
          await employeeService.create({ MaNguoiDung: targetUserId, ...profileData });
        }
        // Luôn đồng bộ vai trò
        await roleService.syncUserRoles(targetUserId, formData.roleIds);
      
      } else if (modalType === 'SCHEDULE') {
        if (initialData) await employeeService.updateSchedule(initialData.MaLichTruc, formData);
        else await employeeService.createSchedule(formData);
      
      } else if (modalType === 'TASK') {
        if (initialData) await employeeService.updateAssignment(initialData.MaPhanCong, formData);
        else await employeeService.createAssignment(formData);
      }
      
      closeForm();
      loadData(); // Tải lại toàn bộ
    } catch (err) {
       console.error("Lỗi khi lưu dữ liệu:", err);
       setError(err.response?.data || err.message);
    } finally {
       setFormLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    let confirmMessage = `Bạn có chắc muốn xóa (ID: ${id})?`;
    let deleteAction;

    if (type === 'EMPLOYEE') {
        confirmMessage = `Bạn có chắc muốn xóa Nhân viên (ID: ${id})?`;
        deleteAction = () => employeeService.delete(id); // Sửa tên hàm
    } else if (type === 'SCHEDULE') {
        deleteAction = () => employeeService.deleteSchedule(id);
    } else if (type === 'TASK') {
        deleteAction = () => employeeService.deleteAssignment(id);
    }

    if (window.confirm(confirmMessage)) {
      try {
        await deleteAction();
        loadData(); // Tải lại
      } catch (err) {
        console.error("Lỗi khi xóa:", err);
        setError(err.message);
      }
    }
  };

  // 7. Render UI
  const renderModal = () => {
    const { modalType, initialData } = formState;
    if (!modalType) return null;

    if (modalType === 'EMPLOYEE') {
      return <EmployeeForm 
                isOpen={true} // <-- Luôn mở nếu modalType tồn tại
                onClose={closeForm} 
                onSubmit={handleFormSubmit}
                isLoading={formLoading}
                initialData={initialData} 
                allUsers={allUsers}
                allRoles={allRoles} // <-- Truyền vai trò xuống
                />;
    }
    if (modalType === 'SCHEDULE') {
       return <WorkScheduleForm 
                isOpen={true}
                onClose={closeForm}
                onSubmit={handleFormSubmit} 
                isLoading={formLoading}
                initialData={initialData} 
                allEmployees={hydratedEmployees} // (Truyền NV đã "làm giàu")
                />;
    }
    if (modalType === 'TASK') {
       return <TaskAssignmentForm 
                isOpen={true}
                onClose={closeForm}
                onSubmit={handleFormSubmit} 
                isLoading={formLoading}
                initialData={initialData} 
                allEmployees={hydratedEmployees} // (Truyền NV đã "làm giàu")
                allCommonAreas={allCommonAreas} 
                />;
    }
    return null;
  };

  return (
    <div className="employees-page container mx-auto p-6">
      
      {/* --- MODALS --- */}
      {renderModal()}

      {/* --- Tiêu đề Trang & Nút bấm --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          👷‍♂️ Quản lý Nhân sự
        </h1>
        {/* Chỉ Quản lý mới thấy nút */}
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => openForm('EMPLOYEE')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md">
              + Thêm Nhân viên
            </button>
            <button onClick={() => openForm('SCHEDULE')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md">
              + Xếp Lịch trực
            </button>
            <button onClick={() => openForm('TASK')}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded shadow-md">
              + Phân công
            </button>
          </div>
        )}
      </div>
      <hr className="mb-6" />

      {error && <div className="p-6 text-red-600 text-center font-semibold">❌ Lỗi API: {error}.</div>}

      {loading ? (
        <div className="p-6 text-center text-blue-500">Đang tải toàn bộ dữ liệu nhân sự...</div>
      ) : (
        <>
          <EmployeeList
            employees={hydratedEmployees} // Dùng NV đã "làm giàu"
            onEdit={canManage ? (data) => openForm('EMPLOYEE', data) : null}
            onDelete={canManage ? (id) => handleDelete('EMPLOYEE', id) : null}
            isLoading={loading}
            canManage={canManage}
          />
          <WorkScheduleList
            schedules={schedules}
            onEdit={canManage ? (data) => openForm('SCHEDULE', data) : null}
            onDelete={canManage ? (id) => handleDelete('SCHEDULE', id) : null}
            isLoading={loading}
            canManage={canManage}
          />
          <TaskAssignmentList
            tasks={tasks}
            onEdit={canManage ? (data) => openForm('TASK', data) : null}
            onDelete={canManage ? (id) => handleDelete('TASK', id) : null}
            isLoading={loading}
            canManage={canManage}
          />
        </>
      )}
    </div>
  );
};

export default EmployeesPage;