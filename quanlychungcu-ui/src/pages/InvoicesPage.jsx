// src/pages/InvoicesPage.jsx
import React, { useState, useEffect, useCallback, useMemo} from 'react';

import { invoiceService } from '../services/invoiceService';
import { serviceMeterService } from '../services/serviceMeterService';
// --- SỬA: Bỏ import apartmentService, floorService ---
import { blockService } from '../services/blockService';

import InvoiceList from '../components/InvoiceList.jsx';
import InvoiceDetails from '../components/InvoiceDetails.jsx';
import InvoiceForm from '../components/InvoiceForm.jsx';
import ServiceMeterList from '../components/ServiceMeterList.jsx';
import ImportExcelModal from '../components/ImportExcelModal.jsx';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [meters, setMeters] = useState([]);
  
  const [allApartments, setAllApartments] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const [viewMode, setViewMode] = useState('list');
  const [detailData, setDetailData] = useState({ invoice: null, payments: [] });
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // --- SỬA: Gọi blockService ---
      const [
        invoiceData, 
        meterData,
        aptData,
        floorData,
        blockData
      ] = await Promise.all([
        invoiceService.getAll(),
        serviceMeterService.getAll(),
        blockService.getAllApartments(), // Sửa tại đây
        blockService.getAllFloors(),     // Sửa tại đây
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

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Hóa đơn (ID: ${id})?`)) {
      try {
        await invoiceService.delete(id);
        loadData(); 
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
      loadData(); 
    } catch (err) {
      console.error("Lỗi khi tạo Hóa đơn:", err);
      setError(err.response?.data || err.message); 
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    setViewMode('details');
    setDetailLoading(true);
    setDetailError(null);
    try {
      const [invoiceRes, paymentsRes] = await Promise.all([
        invoiceService.getById(id), 
        invoiceService.getPayments(id) 
      ]);
      setDetailData({ invoice: invoiceRes, payments: paymentsRes });
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

  const handleImportSubmit = async (file) => {
    try {
      setImportLoading(true);
      setError(null);
      const result = await invoiceService.importInvoices(file);
      alert(result.message); 
      if (result.failed > 0) {
        alert(`Import thành công, nhưng có ${result.failed} dòng bị lỗi.`);
      }
      setIsImportModalOpen(false); 
      loadData(); 
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      setError(errorMsg); 
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      
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
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          {viewMode === 'list' ? '🧾 Quản lý Hóa đơn & Chỉ số' : 'Chi tiết Hóa đơn'}
        </h1>
        {viewMode === 'list' && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow"
            >
              Import Excel
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
            >
              + Lập Hóa Đơn
            </button>
          </div>
        )}
      </div>
      
      {viewMode === 'list' ? (
        <>
          {loading && <div className="p-6 text-center text-slate-500">Đang tải dữ liệu...</div>}
          {error && <div className="p-6 text-red-600 text-center font-semibold">❌ Lỗi API: {error}.</div>}
          
          {!loading && !error && (
            <>
              <InvoiceList
                invoices={invoices}
                onViewDetails={handleViewDetails}
                onDelete={handleDelete}
                isLoading={false} 
              />
              <ServiceMeterList 
                meters={meters} 
                isLoading={false} 
              />
            </>
          )}
        </>
      ) : (
        <InvoiceDetails
          invoice={detailData.invoice}
          payments={detailData.payments}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default InvoicesPage;