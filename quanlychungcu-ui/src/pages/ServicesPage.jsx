// src/pages/ServicesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';

// 1. Import Services và Components
import * as serviceService from '../services/serviceService';
import ServiceList from '../components/ServiceList.jsx';
import PriceList from '../components/PriceList.jsx';
import ServiceForm from '../components/ServiceForm.jsx';
import PriceForm from '../components/PriceForm.jsx';

const ServicesPage = () => {
  // 2. Quản lý State
  const [services, setServices] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState({ services: true, prices: true });
  const [error, setError] = useState(null);

  // State cho Forms (quản lý 2 form riêng biệt)
  const [formState, setFormState] = useState({
    isServiceFormOpen: false,
    isPriceFormOpen: false,
    currentService: null,
    currentPrice: null,
  });

  // 3. Logic Fetch Data (Tải cả 2 danh sách)
  const fetchData = useCallback(async () => {
    try {
      setLoading({ services: true, prices: true });
      setError(null);
      
      const [servicesRes, pricesRes] = await Promise.all([
        serviceService.getAllServices(),
        serviceService.getAllPrices()
      ]);
      
      setServices(servicesRes.data);
      setPrices(pricesRes.data);

    } catch (err) {
      console.error("Lỗi khi tải Dịch vụ hoặc Bảng giá:", err);
      setError(err.message);
    } finally {
      setLoading({ services: false, prices: false });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 4. Logic CRUD Handlers
  
  // -- Service Handlers --
  const handleServiceSubmit = async (formData) => {
    try {
      if (formState.currentService) {
        await serviceService.updateService(formState.currentService.MaDichVu, formData);
      } else {
        await serviceService.createService(formData);
      }
      setFormState(prev => ({ ...prev, isServiceFormOpen: false }));
      fetchData(); // Tải lại tất cả
    } catch (err) {
      console.error("Lỗi khi lưu Dịch vụ:", err);
      setError(err.message);
    }
  };
  const handleDeleteService = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Dịch vụ (ID: ${id})? (Lưu ý: Có thể lỗi nếu Bảng giá đang dùng)`)) {
      try {
        await serviceService.deleteService(id);
        fetchData();
      } catch (err) {
        console.error("Lỗi khi xóa Dịch vụ:", err);
        setError(err.message);
      }
    }
  };

  // -- Price Handlers --
  const handlePriceSubmit = async (formData) => {
    try {
      if (formState.currentPrice) {
        await serviceService.updatePrice(formState.currentPrice.MaBangGia, formData);
      } else {
        await serviceService.createPrice(formData);
      }
      setFormState(prev => ({ ...prev, isPriceFormOpen: false }));
      fetchData(); // Tải lại tất cả
    } catch (err) {
      console.error("Lỗi khi lưu Bảng giá:", err);
      setError(err.message);
    }
  };
  const handleDeletePrice = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa Bảng giá (ID: ${id})?`)) {
      try {
        await serviceService.deletePrice(id);
        fetchData();
      } catch (err) {
        console.error("Lỗi khi xóa Bảng giá:", err);
        setError(err.message);
      }
    }
  };
  
  // -- Form Open/Close Handlers --
  const openForm = (type, data = null) => {
    if (type === 'service') setFormState(prev => ({ ...prev, isServiceFormOpen: true, currentService: data }));
    if (type === 'price') setFormState(prev => ({ ...prev, isPriceFormOpen: true, currentPrice: data }));
  };
  const closeForm = () => {
    setFormState({ isServiceFormOpen: false, isPriceFormOpen: false, currentService: null, currentPrice: null });
  };


  // 6. Render UI
  return (
    <div className="services-page container mx-auto p-6">
      
      {/* --- MODALS --- */}
      {formState.isServiceFormOpen && (
        <ServiceForm 
          initialData={formState.currentService}
          onSubmit={handleServiceSubmit}
          onClose={closeForm}
        />
      )}
      {formState.isPriceFormOpen && (
        <PriceForm 
          initialData={formState.currentPrice}
          services={services} // Truyền danh sách dịch vụ cho <select>
          onSubmit={handlePriceSubmit}
          onClose={closeForm}
        />
      )}

      {/* --- Tiêu đề Trang & Nút bấm --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          🔌 Quản lý Dịch vụ & Bảng giá
        </h1>
        <div className="flex gap-2">
          <button onClick={() => openForm('service')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md">
            + Thêm Dịch Vụ
          </button>
          <button onClick={() => openForm('price')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md">
            + Thêm Bảng Giá
          </button>
        </div>
      </div>
      <hr className="mb-6" />

      {/* --- Hiển thị Lỗi chung --- */}
      {error && <div className="p-6 text-red-600 text-center font-semibold">❌ Lỗi API: {error}.</div>}

      {/* --- Component 1: ServiceList --- */}
      {loading.services ? (
        <div className="p-6 text-center text-blue-500">Đang tải Dịch vụ...</div>
      ) : (
        <ServiceList
          services={services}
          onEdit={(service) => openForm('service', service)}
          onDelete={handleDeleteService}
        />
      )}

      {/* --- Component 2: PriceList --- */}
      {loading.prices ? (
        <div className="p-6 text-center text-blue-500">Đang tải Bảng giá...</div>
      ) : (
        <PriceList
          prices={prices}
          onEdit={(price) => openForm('price', price)}
          onDelete={handleDeletePrice}
        />
      )}
    </div>
  );
};

export default ServicesPage;