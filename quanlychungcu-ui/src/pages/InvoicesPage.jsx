// src/pages/InvoicesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';

// 1. Import Services và Components
import * as invoiceService from '../services/invoiceService';
import InvoiceList from '../components/InvoiceList.jsx';
import InvoiceDetails from '../components/InvoiceDetails.jsx';
import InvoiceForm from '../components/InvoiceForm.jsx';
// (Chúng ta tạm thời giữ ServiceMeterList, nó cũng cần refactor sau)
import ServiceMeterList from '../components/ServiceMeterList.jsx';

const InvoicesPage = () => {
  // 2. Quản lý State
  
  // State cho Danh sách
  const [invoices, setInvoices] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  // State cho Form
  const [isFormOpen, setIsFormOpen] = useState(false);

  // State cho Chi tiết
  const [viewMode, setViewMode] = useState('list'); // 'list' hoặc 'details'
  const [detailData, setDetailData] = useState({ invoice: null, payments: [] });
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // 3. Logic Fetch Data (Danh sách)
  const fetchInvoices = useCallback(async () => {
    try {
      setListLoading(true);
      setListError(null);
      const response = await invoiceService.getAllInvoices();
      setInvoices(response.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách Hóa đơn:", err);
      setListError(err.message);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchInvoices();
    }
  }, [fetchInvoices, viewMode]);

  // 4. Logic CRUD Handlers
  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Hóa đơn (ID: ${id})?`)) {
      try {
        await invoiceService.deleteInvoice(id);
        fetchInvoices(); // Tải lại danh sách
      } catch (err) {
        console.error("Lỗi khi xóa Hóa đơn:", err);
        setListError(err.message);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      await invoiceService.createInvoice(formData);
      setIsFormOpen(false); // Đóng form
      fetchInvoices(); // Tải lại danh sách
    } catch (err) {
      console.error("Lỗi khi tạo Hóa đơn:", err);
      setListError(err.message); // Hiển thị lỗi
    }
  };

  // 5. Logic View Details Handlers
  const handleViewDetails = async (id) => {
    setViewMode('details');
    setDetailLoading(true);
    setDetailError(null);
    try {
      // Gọi 2 API cùng lúc
      const [invoiceRes, paymentsRes] = await Promise.all([
        invoiceService.getInvoiceById(id),
        invoiceService.getPaymentsByInvoiceId(id)
      ]);
      
      setDetailData({
        invoice: invoiceRes.data,
        payments: paymentsRes.data
      });
    } catch (err) {
      console.error("Lỗi khi tải Chi tiết Hóa đơn:", err);
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setDetailData({ invoice: null, payments: [] }); // Xóa dữ liệu chi tiết
  };

  // 6. Render UI
  return (
    <div className="invoices-page container mx-auto p-6">
      
      {/* --- MODAL FORM (Tạo mới) --- */}
      {isFormOpen && (
        <InvoiceForm 
          onSubmit={handleFormSubmit} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
      
      {/* --- Tiêu đề Trang --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          {viewMode === 'list' ? '🧾 Quản lý Hóa đơn & Ghi chỉ số' : 'Chi tiết Hóa đơn'}
        </h1>
        {viewMode === 'list' && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md"
          >
            + Lập Hóa Đơn Mới
          </button>
        )}
      </div>
      <hr className="mb-6" />

      {/* --- Hiển thị DANH SÁCH hoặc CHI TIẾT --- */}
      {viewMode === 'list' ? (
        <>
          {listLoading && <div className="p-6 text-center text-blue-500">Đang tải danh sách Hóa đơn...</div>}
          {listError && <div className="p-6 text-red-600 text-center font-semibold">❌ Lỗi API: {listError}.</div>}
          
          {!listLoading && !listError && (
            <InvoiceList
              invoices={invoices}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
            />
          )}
          
          {/* (Component này vẫn đang tự gọi API, sẽ refactor sau) */}
          <ServiceMeterList />
        </>
      ) : (
        <>
          {detailLoading && <div className="p-6 text-center text-blue-500">Đang tải chi tiết...</div>}
          {detailError && <div className="p-6 text-red-600 text-center font-semibold">❌ Lỗi API: {detailError}.</div>}
          
          {!detailLoading && !detailError && (
            <InvoiceDetails
              invoice={detailData.invoice}
              payments={detailData.payments}
              onBack={handleBackToList}
            />
          )}
        </>
      )}
    </div>
  );
};

export default InvoicesPage;