import React, { useState, useEffect, useCallback } from 'react';

// 1. Import Services
// (Lưu ý: Đảm bảo bạn đã sửa file 'invoiceService.js' để nó export object 'invoiceService'
// và các hàm trả về .data như tôi hướng dẫn)
import { invoiceService } from '../services/invoiceService';
import { serviceMeterService } from '../services/serviceMeterService';

// 2. Import Components
import InvoiceList from '../components/InvoiceList.jsx';
import InvoiceDetails from '../components/InvoiceDetails.jsx'; // (Bạn đã có file này)
import InvoiceForm from '../components/InvoiceForm.jsx'; // (Bạn đã có file này)
import ServiceMeterList from '../components/ServiceMeterList.jsx';

const InvoicesPage = () => {
  // 3. Quản lý State
  const [invoices, setInvoices] = useState([]);
  const [meters, setMeters] = useState([]); // <-- State cho Chỉ số
  
  const [loading, setLoading] = useState(true); // <-- Dùng 1 state loading chung
  const [error, setError] = useState(null);

  // (Các state cho Form và Details)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' hoặc 'details'
  const [detailData, setDetailData] = useState({ invoice: null, payments: [] });
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // 4. Logic Fetch Data (Danh sách)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch 2 API song song
      const [invoiceData, meterData] = await Promise.all([
        invoiceService.getAll(), // Gọi hàm từ service đã sửa
        serviceMeterService.getAll()
      ]);
      
      setInvoices(invoiceData); // (service đã trả về .data)
      setMeters(meterData); // (service đã trả về .data)

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Hóa đơn/Chỉ số:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'list') {
      loadData();
    }
  }, [loadData, viewMode]);

  // 5. Logic CRUD Handlers
  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Hóa đơn (ID: ${id})?`)) {
      try {
        await invoiceService.delete(id);
        loadData(); // Tải lại cả 2
      } catch (err) {
        console.error("Lỗi khi xóa Hóa đơn:", err);
        setError(err.message);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      await invoiceService.create(formData);
      setIsFormOpen(false);
      loadData(); // Tải lại cả 2
    } catch (err) {
      console.error("Lỗi khi tạo Hóa đơn:", err);
      setError(err.message); // Hiển thị lỗi
    }
  };

  // 6. Logic View Details Handlers
  const handleViewDetails = async (id) => {
    setViewMode('details');
    setDetailLoading(true);
    setDetailError(null);
    try {
      const [invoiceRes, paymentsRes] = await Promise.all([
        invoiceService.getById(id), 
        invoiceService.getPayments(id) 
      ]);
      
      setDetailData({
        invoice: invoiceRes,
        payments: paymentsRes
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
    setDetailData({ invoice: null, payments: [] });
  };

  // 7. Render UI
  return (
    <div className="invoices-page container mx-auto p-6">
      
      {isFormOpen && (
        <InvoiceForm 
          onSubmit={handleFormSubmit} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
      
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

      {viewMode === 'list' ? (
        <>
          {loading && <div className="p-6 text-center text-blue-500">Đang tải dữ liệu...</div>}
          {error && <div className="p-6 text-red-600 text-center font-semibold">❌ Lỗi API: {error}.</div>}
          
          {!loading && !error && (
            <>
              {/* Truyền props cho InvoiceList */}
              <InvoiceList
                invoices={invoices}
                onViewDetails={handleViewDetails}
                onDelete={handleDelete}
                isLoading={false} // Tắt loading riêng
              />
              
              {/* Truyền props cho ServiceMeterList */}
              <ServiceMeterList 
                meters={meters} 
                isLoading={false} // Tắt loading riêng
              />
            </>
          )}
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