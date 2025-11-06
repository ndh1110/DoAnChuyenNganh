// src/services/invoiceService.js
import api from './api'; // Import instance axios đã cấu hình

const API_ENDPOINT = '/hoadon';

/**
 * Lấy toàn bộ danh sách Hóa đơn
 */
export const getAllInvoices = () => {
  return api.get(API_ENDPOINT);
};

/**
 * Lấy chi tiết một Hóa đơn (bao gồm các chi tiết dịch vụ)
 * @param {string} id - Mã Hóa đơn
 */
export const getInvoiceById = (id) => {
  return api.get(`${API_ENDPOINT}/${id}`);
};

/**
 * Tạo Hóa đơn mới (chỉ tạo "header" của hóa đơn)
 * @param {object} invoiceData - { MaCanHo, KyThang, NgayPhatHanh, NgayDenHan }
 */
export const createInvoice = (invoiceData) => {
  return api.post(API_ENDPOINT, invoiceData);
};

/**
 * Xóa một Hóa đơn
 * @param {string} id - Mã Hóa đơn
 */
export const deleteInvoice = (id) => {
  return api.delete(`${API_ENDPOINT}/${id}`);
};

// --- Các API liên quan ---

/**
 * Lấy lịch sử thanh toán của một Hóa đơn
 * @param {string} invoiceId - Mã Hóa đơn
 */
export const getPaymentsByInvoiceId = (invoiceId) => {
  return api.get(`/thanhtoan/hoadon/${invoiceId}`);
};

/**
 * Thêm một chi tiết (dịch vụ) vào Hóa đơn
 * @param {string} invoiceId - Mã Hóa đơn
 * @param {object} detailData - { MaDichVu, ThanhTien, MaChiSo? }
 */
export const addInvoiceDetail = (invoiceId, detailData) => {
  return api.post(`${API_ENDPOINT}/${invoiceId}/chitiet`, detailData);
};