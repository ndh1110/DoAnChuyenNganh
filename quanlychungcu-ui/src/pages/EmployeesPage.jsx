// src/pages/EmployeesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';

// 1. Import Services và Components
// --- THAY ĐỔI 1: Sửa cách import ---
import { employeeService } from '../services/employeeService';
import EmployeeList from '../components/EmployeeList.jsx';
import WorkScheduleList from '../components/WorkScheduleList.jsx';
import TaskAssignmentList from '../components/TaskAssignmentList.jsx';
import EmployeeForm from '../components/EmployeeForm.jsx';
import WorkScheduleForm from '../components/WorkScheduleForm.jsx';
import TaskAssignmentForm from '../components/TaskAssignmentForm.jsx';

const EmployeesPage = () => {
  // 2. Quản lý State (Không đổi)
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allCommonAreas, setAllCommonAreas] = useState([]);
  const [formState, setFormState] = useState({
    modalType: null,
    initialData: null,
  });

  // 3. Logic Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // --- THAY ĐỔI 2: Sửa cách gọi API (dùng employeeService) ---
      const [empRes, schRes, taskRes, userRes, areaRes] = await Promise.all([
        employeeService.getAllEmployees(),
        employeeService.getAllSchedules(),
        employeeService.getAllAssignments(),
        employeeService.getAllUsers(),
        employeeService.getAllCommonAreas(),
      ]);
      
      // --- THAY ĐỔI 3: Bỏ '.data' vì service đã xử lý ---
      setEmployees(empRes);
      setSchedules(schRes);
      setTasks(taskRes);
      setAllUsers(userRes);
      setAllCommonAreas(areaRes);

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Nhân sự:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 4. Logic CRUD Handlers (Không đổi)
  const handleFormSubmit = async (formData) => {
    try {
      const { modalType, initialData } = formState;
      
      if (modalType === 'EMPLOYEE') {
        if (initialData) await employeeService.updateEmployee(initialData.MaNhanVien, formData);
        else await employeeService.createEmployee(formData);
      
      } else if (modalType === 'SCHEDULE') {
        if (initialData) await employeeService.updateSchedule(initialData.MaLichTruc, formData);
        else await employeeService.createSchedule(formData);
      
      } else if (modalType === 'TASK') {
        if (initialData) await employeeService.updateAssignment(initialData.MaPhanCong, formData);
        else await employeeService.createAssignment(formData);
      }
      
      closeForm();
      fetchData(); // Tải lại toàn bộ
    } catch (err) {
       console.error("Lỗi khi lưu dữ liệu:", err);
       setError(err.response?.data || err.message);
    }
  };

  const handleDelete = async (type, id) => {
    let confirmMessage = `Bạn có chắc muốn xóa (ID: ${id})?`;
    let deleteAction;

    if (type === 'EMPLOYEE') {
        confirmMessage = `Bạn có chắc muốn xóa Nhân viên (ID: ${id})?`;
        deleteAction = () => employeeService.deleteEmployee(id);
    } else if (type === 'SCHEDULE') {
        deleteAction = () => employeeService.deleteSchedule(id);
    } else if (type === 'TASK') {
        deleteAction = () => employeeService.deleteAssignment(id);
    }

    if (window.confirm(confirmMessage)) {
      try {
        await deleteAction();
        fetchData(); // Tải lại
      } catch (err) {
        console.error("Lỗi khi xóa:", err);
        setError(err.message);
      }
    }
  };
  
  // -- Form Open/Close Handlers (Không đổi) --
  const openForm = (modalType, initialData = null) => {
    setFormState({ modalType, initialData });
  };
  const closeForm = () => {
    setFormState({ modalType: null, initialData: null });
  };

  // 6. Render UI (Không đổi)
  const renderModal = () => {
    const { modalType, initialData } = formState;
    if (!modalType) return null;

    if (modalType === 'EMPLOYEE') {
      return <EmployeeForm 
                initialData={initialData} 
                allUsers={allUsers} 
                onSubmit={handleFormSubmit} 
                onClose={closeForm} />;
    }
    if (modalType === 'SCHEDULE') {
       return <WorkScheduleForm 
                initialData={initialData} 
                allEmployees={employees} 
                onSubmit={handleFormSubmit} 
                onClose={closeForm} />;
    }
    if (modalType === 'TASK') {
       return <TaskAssignmentForm 
                initialData={initialData} 
                allEmployees={employees} 
                allCommonAreas={allCommonAreas} 
                onSubmit={handleFormSubmit} 
                onClose={closeForm} />;
    }
    return null;
  };

  return (
    <div className="employees-page container mx-auto p-6">
      
      {/* --- MODALS --- */}
      {renderModal()}

      {/* --- Tiêu đề Trang & Nút bấm (Không đổi) --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          👷‍♂️ Quản lý Nhân sự
        </h1>
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
      </div>
      <hr className="mb-6" />

      {/* --- Hiển thị Lỗi chung (Không đổi) --- */}
      {error && <div className="p-6 text-red-600 text-center font-semibold">❌ Lỗi API: {error}.</div>}

      {/* --- Hiển thị các danh sách (Không đổi) --- */}
      {loading ? (
        <div className="p-6 text-center text-blue-500">Đang tải toàn bộ dữ liệu nhân sự...</div>
      ) : (
        <>
          <EmployeeList
            employees={employees}
            onEdit={(data) => openForm('EMPLOYEE', data)}
            onDelete={(id) => handleDelete('EMPLOYEE', id)}
          />
          <WorkScheduleList
            schedules={schedules}
            onEdit={(data) => openForm('SCHEDULE', data)}
            onDelete={(id) => handleDelete('SCHEDULE', id)}
          />
          <TaskAssignmentList
            tasks={tasks}
            onEdit={(data) => openForm('TASK', data)}
            onDelete={(id) => handleDelete('TASK', id)}
          />
        </>
      )}
    </div>
  );
};

export default EmployeesPage;