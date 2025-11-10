// src/pages/RequestsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';

// 1. Import Services và Components
import * as requestService from '../services/requestService';
import api from '../services/api'; 

import RequestList from '../components/RequestList.jsx';
import RequestDetails from '../components/RequestDetails.jsx';
import RequestForm from '../components/RequestForm.jsx';
import AppointmentForm from '../components/AppointmentForm.jsx';

const RequestsPage = () => {
  // 2. Quản lý State
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState('list');
  const [detailData, setDetailData] = useState(null); 
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);

  const [formState, setFormState] = useState({
    modalType: null, // 'REQUEST' (Gửi ý kiến) hoặc 'APPOINTMENT' (Đặt lịch)
    initialData: null,
  });
  
  // State dữ liệu phụ trợ (Dùng chung cho cả 2 form)
  const [formSupportData, setFormSupportData] = useState({ users: [], apartments: [] });

  // 3. Logic Fetch Data
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestService.getAllRequests();
      setRequests(response.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách Yêu cầu:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchRequests();
    }
  }, [fetchRequests, viewMode]);

  // 4. Logic CRUD Handlers
  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Yêu cầu (ID: ${id})?`)) {
      try {
        await requestService.deleteRequest(id);
        fetchRequests(); 
      } catch (err) {
        console.error("Lỗi khi xóa Yêu cầu:", err);
        setError(err.message);
      }
    }
  };
  
  // --- THAY ĐỔI 1: Tách logic Submit ---
  const handleFormSubmit = async (formData) => {
    const { modalType, initialData } = formState;

    if (modalType === 'REQUEST') {
      // Logic cho Cư dân Gửi Ý Kiến
      await handleSubmitRequest(formData, initialData);
    } else if (modalType === 'APPOINTMENT') {
      // Logic cho Khách hàng Đặt Lịch Hẹn
      await handleSubmitAppointment(formData);
    }
  };

  // Logic 1: Gửi Ý kiến/Khiếu nại (Cũ)
  const handleSubmitRequest = async (formData, initialData) => {
    try {
      if (initialData) {
        await requestService.updateRequest(initialData.MaYeuCau, formData);
      } else {
        await requestService.createRequest(formData);
      }
      closeForm();
      fetchRequests(); // Tải lại danh sách
    } catch (err) {
       console.error("Lỗi khi lưu Yêu cầu:", err);
       setError(err.response?.data || err.message);
    }
  };

  // --- THAY ĐỔI 2: Logic 2-bước cho Đặt Lịch Hẹn (Mới) ---
  const handleSubmitAppointment = async (formData) => {
    // formData = { MaNguoiDung, MaCanHo, ThoiGian }
    try {
      // Bước 1: Ngầm tạo một 'YeuCau' loại 'Tham quan'
      const requestPayload = {
        MaNguoiDung: formData.MaNguoiDung,
        MaCanHo: formData.MaCanHo,
        Loai: 'Tham quan', // Hardcode loại yêu cầu
        TrangThaiThanhChung: 'OPEN',
      };
      const requestRes = await requestService.createRequest(requestPayload);
      const newMaYeuCau = requestRes.data.MaYeuCau;

      // Bước 2: Dùng MaYeuCau mới để tạo 'LichHen'
      const appointmentPayload = {
        MaYeuCau: newMaYeuCau,
        ThoiGian: formData.ThoiGian,
        MaNguoiDung: formData.MaNguoiDung, // Người hẹn (Khách)
        TrangThai: 'SCHEDULED', // Hardcode trạng thái
      };
      await requestService.createAppointment(appointmentPayload);
      
      closeForm();
      fetchRequests(); // Tải lại danh sách
    } catch (err) {
       console.error("Lỗi khi Đặt lịch hẹn:", err);
       setError(err.response?.data || err.message);
    }
  };
  
  // Tải dữ liệu phụ trợ (Users, Apartments)
  const loadSupportData = async () => {
    try {
      if (formSupportData.users.length === 0) {
          const [usersRes, aptsRes] = await Promise.all([
              api.get('/nguoidung'), 
              api.get('/canho')       
          ]);
          setFormSupportData({ users: usersRes.data, apartments: aptsRes.data });
      }
    } catch (err) {
        setError("Lỗi khi tải dữ liệu cho form. " + err.message);
    }
  };

  // Mở Form Gửi Ý Kiến
  const openRequestForm = async (data = null) => {
    await loadSupportData();
    setFormState({ initialData: data, modalType: 'REQUEST' });
  };

  // Mở Form Đặt Lịch Hẹn
  const openAppointmentForm = async () => {
    await loadSupportData();
    setFormState({ initialData: null, modalType: 'APPOINTMENT' });
  };

  const closeForm = () => {
    setFormState({ modalType: null, initialData: null });
  };

  // 5. Logic View Details Handlers (Không đổi)
  const handleViewDetails = async (id) => {
    setViewMode('details');
    setCurrentRequestId(id); 
    setDetailLoading(true);
    setError(null);
    try {
      const reqRes = await requestService.getRequestById(id);
      setDetailData(reqRes.data); 
    } catch (err) {
      console.error("Lỗi khi tải Chi tiết Yêu cầu:", err);
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setDetailData(null); 
    setCurrentRequestId(null);
  };

  // 6. Render UI
  return (
    <div className="requests-page container mx-auto p-6">
      
      {/* --- MODAL (Tạo/Sửa Yêu Cầu) --- */}
      {formState.modalType === 'REQUEST' && (
        <RequestForm 
          initialData={formState.initialData}
          users={formSupportData.users}
          apartments={formSupportData.apartments}
          onSubmit={handleFormSubmit} 
          onClose={closeForm} 
        />
      )}
      
      {/* --- MODAL (Đặt Lịch Hẹn) --- */}
      {formState.modalType === 'APPOINTMENT' && (
        <AppointmentForm 
          allUsers={formSupportData.users}
          allApartments={formSupportData.apartments}
          onSubmit={handleFormSubmit} 
          onClose={closeForm} 
        />
      )}

      {/* --- THAY ĐỔI 3: Hiển thị 2 Nút --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          {viewMode === 'list' ? '📣 Yêu cầu & Phản ánh' : `Chi tiết Yêu cầu #${currentRequestId}`}
        </h1>
        {viewMode === 'list' && (
          <div className="flex gap-3">
            <button
              onClick={() => openRequestForm(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md"
            >
              + Gửi Ý kiến/Khiếu nại
            </button>
            <button
              onClick={openAppointmentForm}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md"
            >
              + Đặt Lịch Hẹn Tham Quan
            </button>
          </div>
        )}
      </div>
      <hr className="mb-6" />

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">Lỗi: {error}</div>}

      {/* --- Hiển thị DANH SÁCH hoặc CHI TIẾT (Logic không đổi) --- */}
      {viewMode === 'list' ? (
        <>
          {loading && <div className="p-6 text-center text-blue-500">Đang tải danh sách Yêu cầu...</div>}
          {!loading && !error && (
            <RequestList
              requests={requests}
              onViewDetails={handleViewDetails}
              onEdit={openRequestForm} 
              onDelete={handleDelete}
            />
          )}
        </>
      ) : (
        <>
          {detailLoading && <div className="p-6 text-center text-blue-500">Đang tải chi tiết...</div>}
          {!detailLoading && !error && detailData && (
            <RequestDetails
              request={detailData} 
              onBack={handleBackToList}
              // Tạm thời vô hiệu hóa 2 nút này vì chúng dành cho Admin
              // onAddLog={() => alert('Chức năng Thêm Log (Admin)')}
              // onAddAppointment={() => alert('Chức năng Đặt Lịch Hẹn (Admin)')}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RequestsPage;