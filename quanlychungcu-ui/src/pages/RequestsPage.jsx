// src/pages/RequestsPage.jsx (PREMIUM RESIDENT SUPPORT CENTER)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as requestService from '../services/requestService';
import api from '../services/api'; 
import RequestDetails from '../components/RequestDetails.jsx';
import RequestForm from '../components/RequestForm.jsx';
import AppointmentForm from '../components/AppointmentForm.jsx';
import toast, { Toaster } from 'react-hot-toast';

// --- UI COMPONENTS NHỎ ---
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-105">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const map = {
        'OPEN': { color: 'bg-blue-100 text-blue-700', label: 'Mới gửi' },
        'IN_PROGRESS': { color: 'bg-yellow-100 text-yellow-700', label: 'Đang xử lý' },
        'PENDING': { color: 'bg-orange-100 text-orange-700', label: 'Chờ duyệt' },
        'RESOLVED': { color: 'bg-green-100 text-green-700', label: 'Hoàn thành' },
        'CLOSED': { color: 'bg-gray-100 text-gray-600', label: 'Đã đóng' },
        'REJECTED': { color: 'bg-red-100 text-red-700', label: 'Từ chối' },
        'SCHEDULED': { color: 'bg-purple-100 text-purple-700', label: 'Đã lên lịch' }
    };
    const style = map[status] || { color: 'bg-gray-100', label: status };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.color}`}>{style.label}</span>;
};

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [activeTab, setActiveTab] = useState('COMPLAINTS'); // 'COMPLAINTS' | 'APPOINTMENTS'
  const [detailData, setDetailData] = useState(null); 
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form State
  const [formState, setFormState] = useState({ modalType: null, initialData: null });
  const [supportData, setSupportData] = useState({ users: [], apartments: [] });

  // --- FETCH DATA ---
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await requestService.getAllRequests();
      setRequests(response.data);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // --- FILTER DATA THÔNG MINH ---
  // Tách dữ liệu thành 2 luồng: Khiếu nại/Góp ý vs Lịch hẹn (Tham quan)
  const { complaints, appointments, stats } = useMemo(() => {
      const _complaints = requests.filter(r => r.Loai !== 'Tham quan' && r.Loai !== 'Bàn giao');
      const _appointments = requests.filter(r => r.Loai === 'Tham quan' || r.Loai === 'Bàn giao');
      
      return {
          complaints: _complaints,
          appointments: _appointments,
          stats: {
              totalOpen: requests.filter(r => r.TrangThai === 'OPEN').length,
              totalPending: requests.filter(r => r.TrangThai === 'IN_PROGRESS').length,
              totalToday: _appointments.filter(r => new Date(r.NgayTao).toDateString() === new Date().toDateString()).length // Giả lập ngày hẹn
          }
      };
  }, [requests]);

  // --- HANDLERS ---
  const handleFormSubmit = async (formData) => {
    const { modalType, initialData } = formState;
    try {
        if (modalType === 'REQUEST') {
            if (initialData) await requestService.updateRequest(initialData.MaYeuCau, formData);
            else await requestService.createRequest(formData);
            toast.success("Đã gửi yêu cầu thành công!");
        } else if (modalType === 'APPOINTMENT') {
            // Logic 2 bước: Tạo Yêu cầu -> Tạo Lịch hẹn
            const reqRes = await requestService.createRequest({
                MaNguoiDung: formData.MaNguoiDung,
                MaCanHo: formData.MaCanHo,
                Loai: 'Tham quan',
                TrangThaiThanhChung: 'OPEN',
                MoTa: `Đặt lịch tham quan vào lúc ${new Date(formData.ThoiGian).toLocaleString('vi-VN')}`
            });
            await requestService.createAppointment({
                MaYeuCau: reqRes.data.MaYeuCau,
                ThoiGian: formData.ThoiGian,
                MaNguoiDung: formData.MaNguoiDung,
                TrangThai: 'SCHEDULED',
            });
            toast.success("Đã đặt lịch hẹn thành công!");
        }
        closeForm();
        fetchRequests();
    } catch (err) {
        toast.error("Lỗi: " + (err.response?.data || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Xóa yêu cầu #${id}?`)) return;
    try {
        await requestService.deleteRequest(id);
        toast.success("Đã xóa yêu cầu");
        fetchRequests();
        setIsDetailOpen(false);
    } catch (err) { toast.error(err.message); }
  };

  const loadSupportData = async () => {
    if (supportData.users.length === 0) {
        try {
            const [u, a] = await Promise.all([api.get('/nguoidung'), api.get('/canho')]);
            setSupportData({ users: u.data, apartments: a.data });
        } catch (e) { console.error(e); }
    }
  };

  const openForm = async (type, data = null) => {
      await loadSupportData();
      setFormState({ modalType: type, initialData: data });
  };
  const closeForm = () => setFormState({ modalType: null, initialData: null });

  const handleViewDetails = async (req) => {
      try {
          const res = await requestService.getRequestById(req.MaYeuCau);
          setDetailData(res.data);
          setIsDetailOpen(true);
      } catch (e) { toast.error("Không tải được chi tiết"); }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* DASHBOARD HEADER */}
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Trung tâm Hỗ trợ Cư dân</h1>
          <p className="text-slate-500">Tiếp nhận và xử lý mọi yêu cầu, phản ánh và lịch hẹn.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <StatCard title="Yêu cầu Mới" value={stats.totalOpen} icon="🔔" color="bg-blue-100 text-blue-600" />
              <StatCard title="Đang Xử Lý" value={stats.totalPending} icon="⚙️" color="bg-yellow-100 text-yellow-600" />
              <StatCard title="Lịch hẹn Mới" value={appointments.length} icon="📅" color="bg-green-100 text-green-600" />
          </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
          
          {/* TABS & ACTIONS */}
          <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('COMPLAINTS')}
                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'COMPLAINTS' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      📩 Hộp thư Cư dân ({complaints.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('APPOINTMENTS')}
                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'APPOINTMENTS' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      📅 Lịch hẹn & Tham quan ({appointments.length})
                  </button>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0">
                  <button onClick={() => openForm('REQUEST')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md flex items-center gap-2">
                      ✏️ Gửi Ý kiến
                  </button>
                  <button onClick={() => openForm('APPOINTMENT')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md flex items-center gap-2">
                      ➕ Đặt Lịch Hẹn
                  </button>
              </div>
          </div>

          {/* TAB CONTENT 1: DANH SÁCH YÊU CẦU */}
          {activeTab === 'COMPLAINTS' && (
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                          <tr>
                              <th className="p-4 w-20">Mã</th>
                              <th className="p-4">Người gửi / Căn hộ</th>
                              <th className="p-4">Nội dung yêu cầu</th>
                              <th className="p-4">Ngày gửi</th>
                              <th className="p-4">Trạng thái</th>
                              <th className="p-4 text-right">Hành động</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {complaints.length === 0 ? (
                              <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">Chưa có yêu cầu nào.</td></tr>
                          ) : (
                              complaints.map(req => (
                                  <tr key={req.MaYeuCau} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => handleViewDetails(req)}>
                                      <td className="p-4 font-mono text-blue-600 font-bold">#{req.MaYeuCau}</td>
                                      <td className="p-4">
                                          <div className="font-bold text-gray-800">{req.TenNguoiGui || 'Ẩn danh'}</div>
                                          <div className="text-xs text-gray-500 flex items-center gap-1">
                                              🏠 {req.SoCanHo ? `Căn ${req.SoCanHo}` : 'Chưa rõ'}
                                          </div>
                                      </td>
                                      <td className="p-4">
                                          <span className="inline-block bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded border border-gray-200 mb-1 font-bold uppercase">{req.Loai}</span>
                                          <p className="text-sm text-gray-600 line-clamp-1">{req.MoTa}</p>
                                      </td>
                                      <td className="p-4 text-sm text-gray-500">
                                          {new Date(req.NgayTao).toLocaleDateString('vi-VN')}
                                          <br/><span className="text-xs opacity-70">{new Date(req.NgayTao).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                                      </td>
                                      <td className="p-4"><StatusBadge status={req.TrangThai} /></td>
                                      <td className="p-4 text-right">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); openForm('REQUEST', req); }}
                                            className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >Sửa</button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(req.MaYeuCau); }}
                                            className="text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >Xóa</button>
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          )}

          {/* TAB CONTENT 2: LỊCH HẸN (TIMELINE STYLE) */}
          {activeTab === 'APPOINTMENTS' && (
              <div className="p-6 bg-gray-50/50 min-h-[400px]">
                  {appointments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <span className="text-4xl mb-2">📅</span>
                          <p>Chưa có lịch hẹn nào sắp tới.</p>
                      </div>
                  ) : (
                      <div className="space-y-4 max-w-4xl mx-auto">
                          {appointments.map(apt => (
                              <div key={apt.MaYeuCau} onClick={() => handleViewDetails(apt)} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                                  {/* Dải màu trạng thái bên trái */}
                                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${apt.TrangThai === 'CLOSED' ? 'bg-gray-300' : 'bg-green-500'}`}></div>
                                  
                                  {/* Thời gian */}
                                  <div className="flex flex-col items-center justify-center min-w-[80px] text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                                      <span className="text-2xl font-bold">{new Date(apt.NgayTao).getDate()}</span>
                                      <span className="text-xs uppercase font-bold">Tháng {new Date(apt.NgayTao).getMonth() + 1}</span>
                                  </div>

                                  {/* Nội dung */}
                                  <div className="flex-1 text-center sm:text-left">
                                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 justify-center sm:justify-start">
                                          {apt.MoTa}
                                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full border border-green-200">Khách tham quan</span>
                                      </h3>
                                      <p className="text-sm text-gray-500 mt-1">
                                          👤 Khách: <span className="font-medium text-gray-800">{apt.TenNguoiGui || 'Khách vãng lai'}</span> 
                                          <span className="mx-2">•</span> 
                                          🏠 Quan tâm: <span className="font-medium text-blue-600">{apt.SoCanHo ? `Căn ${apt.SoCanHo}` : 'Chưa rõ'}</span>
                                      </p>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-2">
                                      <StatusBadge status={apt.TrangThai || 'SCHEDULED'} />
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(apt.MaYeuCau); }}
                                        className="text-gray-400 hover:text-red-500 p-2"
                                        title="Hủy lịch"
                                      >✕</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}
      </div>

      {/* --- MODAL FORMS --- */}
      {formState.modalType === 'REQUEST' && (
        <RequestForm 
          initialData={formState.initialData}
          users={supportData.users}
          apartments={supportData.apartments}
          onSubmit={handleFormSubmit} 
          onClose={closeForm} 
        />
      )}
      {formState.modalType === 'APPOINTMENT' && (
        <AppointmentForm 
          allUsers={supportData.users}
          allApartments={supportData.apartments}
          onSubmit={handleFormSubmit} 
          onClose={closeForm} 
        />
      )}

      {/* --- MODAL CHI TIẾT --- */}
      {isDetailOpen && detailData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <RequestDetails 
                      request={detailData} 
                      onBack={() => setIsDetailOpen(false)} 
                  />
              </div>
          </div>
      )}
    </div>
  );
};

export default RequestsPage;