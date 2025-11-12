import React, { useState, useEffect, useCallback, useMemo} from 'react';

// 1. Import Services
import { invoiceService } from '../services/invoiceService';
import { serviceMeterService } from '../services/serviceMeterService';
import { apartmentService } from '../services/apartmentService';
import { floorService } from '../services/floorService';
import { blockService } from '../services/blockService';

// 2. Import Components
import InvoiceList from '../components/InvoiceList.jsx';
import InvoiceDetails from '../components/InvoiceDetails.jsx';
import InvoiceForm from '../components/InvoiceForm.jsx';
import ServiceMeterList from '../components/ServiceMeterList.jsx';
import ImportExcelModal from '../components/ImportExcelModal.jsx';

const InvoicesPage = () => {
  // 3. Quản lý State
  const [invoices, setInvoices] = useState([]);
  const [meters, setMeters] = useState([]);
  
  const [allApartments, setAllApartments] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho Form Lập hóa đơn (cũ)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // --- XÓA BẢN TRÙNG LẶP ---
  // State cho Modal Import (Giữ lại bản mới nhất)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // State cho View Details
  const [viewMode, setViewMode] = useState('list');
  const [detailData, setDetailData] = useState({ invoice: null, payments: [] });
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // 4. Logic Fetch Data (Danh sách)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        invoiceData, 
        meterData,
        aptData,
        floorData,
        blockData
      ] = await Promise.all([
        invoiceService.getAll(),
        serviceMeterService.getAll(),
        apartmentService.getAll(),
        floorService.getAll(),
        blockService.getAll()
      ]);
      
      setInvoices(invoiceData);
      setMeters(meterData);
      setAllApartments(aptData);
      setAllFloors(floorData);
      setAllBlocks(blockData);

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Hóa đơn:", err);
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

  // 5. Logic "Làm giàu" Căn hộ (cho Form)
  const hydratedApartments = useMemo(() => {
    const floorMap = new Map(allFloors.map(f => [f.MaTang, f]));
    const blockMap = new Map(allBlocks.map(b => [b.MaBlock, b]));
    
    return allApartments.map(apt => {
        const floor = floorMap.get(apt.MaTang);
        const block = floor ? blockMap.get(floor.MaBlock) : null;
        return {
          ...apt,
          SoTang: floor ? floor.SoTang : null,
          TenBlock: block ? block.TenBlock : null,
        };
      });
  }, [allApartments, allFloors, allBlocks]);

  // 6. Logic CRUD Handlers
  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Hóa đơn (ID: ${id})?`)) {
      try {
        await invoiceService.delete(id);
        loadData(); // Tải lại
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      await invoiceService.create(formData);
      setIsFormOpen(false);
      loadData(); // Tải lại cả 2
    } catch (err) {
      console.error("Lỗi khi tạo Hóa đơn:", err);
      setError(err.response?.data || err.message); // Hiển thị lỗi
    } finally {
      setFormLoading(false);
    }
  };

  // 7. Logic View Details Handlers
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

  // 8. Handler cho Submit Excel (Giữ lại bản mới nhất)
  const handleImportSubmit = async (file) => {
    try {
      setImportLoading(true);
      setError(null);
      
      const result = await invoiceService.importInvoices(file);
      
      alert(result.message); // Hiển thị thông báo thành công
      
      if (result.failed > 0) {
        console.warn('Các dòng bị lỗi khi import:', result.failedRecords);
        alert(`Import thành công, nhưng có ${result.failed} dòng bị lỗi. Vui lòng kiểm tra Console (F12).`);
      }

      setIsImportModalOpen(false); // Đóng modal
      loadData(); // Tải lại toàn bộ danh sách
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      console.error("Lỗi khi import:", err);
      setError(errorMsg); // Hiển thị lỗi
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setImportLoading(false);
    }
  };
  
  // --- XÓA BẢN TRÙNG LẶP CỦA handleImportSubmit ---

  // 9. Render UI
  return (
    <div className="invoices-page container mx-auto p-6">
      
      {/* Modal Lập Hóa Đơn (cũ) */}
      <InvoiceForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
        allApartments={hydratedApartments} 
      />
      
      {/* Modal Import Mới */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleImportSubmit}
        isLoading={importLoading}
      />
      
      {/* Tiêu đề Trang */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          {viewMode === 'list' ? '🧾 Quản lý Hóa đơn & Ghi chỉ số' : 'Chi tiết Hóa đơn'}
        </h1>
        {viewMode === 'list' && (
          <div className="page-header-actions">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="btn-add-new"
              style={{backgroundColor: '#1a734d', marginRight: '10px'}} // Màu xanh lá
            >
              Import Excel
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-add-new"
            >
              + Lập Hóa Đơn Mới
            </button>
          </div>
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