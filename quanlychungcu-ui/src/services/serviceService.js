// src/services/serviceService.js
import api from './api'; // Import instance axios đã cấu hình

// --- Dịch Vụ ---
export const getAllServices = () => {
  return api.get('/dichvu');
};
export const createService = (serviceData) => {
  return api.post('/dichvu', serviceData);
};
export const updateService = (id, serviceData) => {
  return api.put(`/dichvu/${id}`, serviceData);
};
export const deleteService = (id) => {
  return api.delete(`/dichvu/${id}`);
};

// --- Bảng Giá ---
export const getAllPrices = () => {
  return api.get('/banggia');
};
export const createPrice = (priceData) => {
  return api.post('/banggia', priceData);
};
export const updatePrice = (id, priceData) => {
  return api.put(`/banggia/${id}`, priceData);
};
export const deletePrice = (id) => {
  return api.delete(`/banggia/${id}`);
};