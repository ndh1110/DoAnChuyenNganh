// src/pages/InvoicesPage.jsx (PREMIUM BILLING UI)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { invoiceService } from '../services/invoiceService';
import { serviceMeterService } from '../services/serviceMeterService';
import { blockService } from '../services/blockService';
import InvoiceForm from '../components/InvoiceForm.jsx';
import ImportExcelModal from '../components/ImportExcelModal.jsx';
import InvoiceDetails from '../components/InvoiceDetails.jsx';
import ServiceMeterList from '../components/ServiceMeterList.jsx'; 
import toast, { Toaster } from 'react-hot-toast';

// --- HELPERS ---
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

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

const PaymentStatusBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    if (s.includes('chờ') || s.includes('unpaid')) return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">⏳ Chờ thanh toán</span>;
    if (s.includes('đủ') || s.includes('paid')) return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">✅ Đã thanh toán</span>;
    if (s.includes('thiếu') || s.includes('partial')) return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">⚠️ Thanh toán thiếu</span>;
    return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
};

const InvoicesPage = () => {
  // Data State
  const [invoices, setInvoices] = useState([]);
  const [meters, setMeters] = useState([]);
  const [allApartments, setAllApartments] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // View State
  const [activeTab, setActiveTab] = useState('INVOICES'); // 'INVOICES' | 'METERS'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'details'
  const [detailData, setDetailData] = useState({ invoice: null, payments: [] });
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Filter State
  const [filterPeriod, setFilterPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterStatus, setFilterStatus] = useState('All');

  // --- LOAD DATA ---
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [invoiceRes, meterRes, aptRes, floorRes, blockRes] = await Promise.all([
        invoiceService.getAll(),
        serviceMeterService.getAll(),
        blockService.getAllApartments(),
        blockService.getAllFloors(),
        blockService.getAll()
      ]);
      
      setInvoices(invoiceRes);
      setMeters(meterRes);
      setAllApartments(aptRes);
      setAllFloors(floorRes);
      setAllBlocks(blockRes);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (viewMode === 'list') loadData(); }, [loadData, viewMode]);

  // --- MEMOIZED DATA ---
  const hydratedApartments = useMemo(() => {
    const floorMap = new Map(allFloors.map(f => [f.MaTang, f]));
    const blockMap = new Map(allBlocks.map(b => [b.MaBlock, b]));
    return allApartments.map(apt => {
        const floor = floorMap.get(apt.MaTang);
        const block = floor ? blockMap.get(floor.MaBlock) : null;
        return { ...apt, SoTang: floor?.SoTang, TenBlock: block?.TenBlock };
    });
  }, [allApartments, allFloors, allBlocks]);

  const filteredInvoices = useMemo(() => {
      return invoices.filter(inv => {
          const matchPeriod = !filterPeriod || (inv.KyHoaDon === filterPeriod || (inv.KyHoaDon || '').includes(filterPeriod));
          let matchStatus = true;
          if (filterStatus !== 'All') {
              const s = (inv.TrangThai || '').toLowerCase();
              if (filterStatus === 'Unpaid') matchStatus = s.includes('chờ') || s.includes('thiếu');
              if (filterStatus === 'Paid') matchStatus = s.includes('đủ') || s.includes('đã');
          }
          return matchPeriod && matchStatus;
      });
  }, [invoices, filterPeriod, filterStatus]);

  const stats = useMemo(() => {
      const totalAmount = filteredInvoices.reduce((sum, i) => sum + (parseFloat(i.TongTien) || 0), 0);
      const paidAmount = filteredInvoices.filter(i => (i.TrangThai || '').includes('đủ')).reduce((sum, i) => sum + (parseFloat(i.TongTien) || 0), 0);
      const pendingCount = filteredInvoices.filter(i => (i.TrangThai || '').includes('chờ')).length;
      return { total: totalAmount, paid: paidAmount, pending: pendingCount };
  }, [filteredInvoices]);

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    if (!window.confirm(`Xóa hóa đơn ID: ${id}?`)) return;
    try {
        await invoiceService.delete(id);
        toast.success("Đã xóa hóa đơn");
        loadData(); 
    } catch (err) { toast.error(err.message); }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      await invoiceService.create(formData);
      toast.success("Lập hóa đơn thành công!");
      setIsFormOpen(false);
      loadData(); 
    } catch (err) {
      toast.error(err.response?.data || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleImportSubmit = async (file) => {
    try {
      setImportLoading(true);
      const result = await invoiceService.importInvoices(file);
      toast.success(`Import xong! ${result.message}`);
      setIsImportModalOpen(false); 
      loadData(); 
    } catch (err) {
      toast.error("Lỗi Import: " + (err.response?.data?.message || err.message));
    } finally {
      setImportLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    setViewMode('details');
    setDetailLoading(true);
    try {
      const [invoiceRes, paymentsRes] = await Promise.all([
        invoiceService.getById(id), 
        invoiceService.getPayments(id) 
      ]);
      setDetailData({ invoice: invoiceRes, payments: paymentsRes });
    } catch (err) { toast.error("Không tải được chi tiết"); } 
    finally { setDetailLoading(false); }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* MODALS */}
      <InvoiceForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
        allApartments={hydratedApartments} 
      />
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleImportSubmit}
        isLoading={importLoading}
      />

      {viewMode === 'list' ? (
        <>
          {/* HEADER DASHBOARD */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Tài chính & Chỉ số</h1>
                <p className="text-slate-500 mt-1">Quản lý thu phí, ghi điện nước và công nợ</p>
            </div>
            
            {/* TABS SWITCHER */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
                <button 
                    onClick={() => setActiveTab('INVOICES')}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'INVOICES' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    🧾 Hóa đơn Thu phí
                </button>
                <button 
                    onClick={() => setActiveTab('METERS')}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'METERS' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    ⚡ Chỉ số Điện/Nước
                </button>
            </div>
          </div>

          {activeTab === 'INVOICES' ? (
              <>
                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Tổng Phải Thu (Tháng)" value={formatCurrency(stats.total)} icon="💰" color="bg-blue-100 text-blue-600" />
                    <StatCard title="Đã Thu được" value={formatCurrency(stats.paid)} icon="✅" color="bg-green-100 text-green-600" />
                    <StatCard title="Hóa đơn Treo" value={stats.pending} icon="⏳" color="bg-yellow-100 text-yellow-600" subText="Chưa thanh toán" />
                </div>

                {/* FILTERS & ACTIONS */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-4 w-full md:w-auto">
                        <input 
                            type="month" 
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={filterPeriod}
                            onChange={(e) => setFilterPeriod(e.target.value)}
                        />
                        <select 
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">Tất cả Trạng thái</option>
                            <option value="Unpaid">⏳ Chưa thanh toán</option>
                            <option value="Paid">✅ Đã thanh toán</option>
                        </select>
                    </div>
                    
                    <div className="flex gap-2">
                        <button onClick={() => setIsImportModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md flex items-center gap-2">
                            📥 Import Excel
                        </button>
                        <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md flex items-center gap-2">
                            + Lập Hóa Đơn
                        </button>
                    </div>
                </div>

                {/* LIST TABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? <div className="p-12 text-center text-slate-500">⏳ Đang tải dữ liệu...</div> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 pl-6">Mã HĐ</th>
                                        <th className="p-4">Căn hộ</th>
                                        <th className="p-4">Kỳ HĐ</th>
                                        <th className="p-4">Tổng tiền</th>
                                        <th className="p-4">Hạn đóng</th>
                                        <th className="p-4">Trạng thái</th>
                                        <th className="p-4 text-right pr-6">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredInvoices.map(inv => (
                                        <tr key={inv.MaHoaDon} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="p-4 pl-6 font-mono font-bold text-blue-600">#{inv.MaHoaDon}</td>
                                            <td className="p-4 font-bold text-gray-800">{inv.SoCanHo || '---'}</td>
                                            <td className="p-4 text-gray-600">{inv.KyHoaDon}</td>
                                            <td className={`p-4 font-bold text-lg ${(inv.TrangThai||'').includes('đủ') ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(inv.TongTien)}
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">{inv.NgayDenHan ? formatDate(inv.NgayDenHan) : '--'}</td>
                                            <td className="p-4"><PaymentStatusBadge status={inv.TrangThai} /></td>
                                            <td className="p-4 text-right pr-6 space-x-2">
                                                <button onClick={() => handleViewDetails(inv.MaHoaDon)} className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg font-bold text-sm">Xem</button>
                                                <button onClick={() => handleDelete(inv.MaHoaDon)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg font-bold text-sm">Xóa</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredInvoices.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-400">Không có dữ liệu.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
              </>
          ) : (
              /* TAB METERS (CHỈ SỐ) */
              <div className="animate-fade-in">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-gray-700">Lịch sử Ghi chỉ số Điện / Nước</h3>
                          {/* Có thể thêm nút Ghi chỉ số hàng loạt ở đây nếu cần */}
                      </div>
                      <ServiceMeterList meters={meters} isLoading={loading} />
                  </div>
              </div>
          )}
        </>
      ) : (
        /* DETAIL VIEW */
        <InvoiceDetails 
            invoice={detailData.invoice} 
            payments={detailData.payments} 
            onBack={() => { setViewMode('list'); setDetailData({ invoice: null, payments: [] }); }} 
        />
      )}
    </div>
  );
};

export default InvoicesPage;