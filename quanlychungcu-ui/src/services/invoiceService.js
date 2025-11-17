// src/services/invoiceService.js
import api from './api'; // Import instance axios đã cấu hình

const API_ENDPOINT = '/hoadon';

/**
 * Lấy toàn bộ danh sách Hóa đơn
 */
export const getAllInvoices = async () => {
  try {
    const response = await api.get(API_ENDPOINT);
    return response.data; // <-- SỬA 1: Trả về .data
  } catch (error) { throw error; } // (Rút gọn)
};

/**
 * Lấy chi tiết một Hóa đơn (bao gồm các chi tiết dịch vụ)
 * @param {string} id - Mã Hóa đơn
 */
export const getInvoiceById = async (id) => {
  try {
    const response = await api.get(`${API_ENDPOINT}/${id}`);
    return response.data; // <-- SỬA 2: Trả về .data
  } catch (error) { throw error; }
};
/**
 * Tạo Hóa đơn mới (chỉ tạo "header" của hóa đơn)
 * @param {object} invoiceData - { MaCanHo, KyThang, NgayPhatHanh, NgayDenHan }
 */
export const createInvoice = async (invoiceData) => {
  try {
    const response = await api.post(API_ENDPOINT, invoiceData);
    return response.data; // <-- SỬA 3: Trả về .data
  } catch (error) { throw error; }
};
/**
 * Xóa một Hóa đơn
 * @param {string} id - Mã Hóa đơn
 */
export const deleteInvoice = async (id) => {
  try {
    const response = await api.delete(`${API_ENDPOINT}/${id}`);
    return response.data; // <-- SỬA 4: Trả về .data
  } catch (error) { throw error; }
};

// --- Các API liên quan ---

/**
 * Lấy lịch sử thanh toán của một Hóa đơn
 * @param {string} invoiceId - Mã Hóa đơn
 */
export const getPaymentsByInvoiceId = async (invoiceId) => {
  try {
    const response = await api.get(`/thanhtoan/hoadon/${invoiceId}`);
    return response.data; // <-- SỬA 5: Trả về .data
  } catch (error) { throw error; }
};

/**
 * Thêm một chi tiết (dịch vụ) vào Hóa đơn
 * @param {string} invoiceId - Mã Hóa đơn
 * @param {object} detailData - { MaDichVu, ThanhTien, MaChiSo? }
 */
export const addInvoiceDetail = async (invoiceId, detailData) => {
  try {
    const response = await api.post(`${API_ENDPOINT}/${invoiceId}/chitiet`, detailData);
    return response.data; // <-- SỬA 6: Trả về .data
  } catch (error) { throw error; }
};

const importInvoices = async (file) => {
  // 1. Tạo FormData
  const formData = new FormData();
  // 'excelFile' phải khớp với tên trường multer mong đợi ở backend
  formData.append('excelFile', file); 

  try {
    // 2. Gọi API billing (file api.js sẽ tự đính kèm token)
    const response = await api.post('/billing/import-excel', formData, {
      // 3. Bắt buộc: Ghi đè header cho file upload
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Trả về kết quả (message, failedRecords)
  } catch (error) {
    console.error("Lỗi khi import hóa đơn:", error.response || error);
    throw error;
  }
};

/**
 * [MỚI] Lấy hóa đơn CHƯA THANH TOÁN CỦA CƯ DÂN
 * Dành cho Dashboard Widget.
 * API: GET /api/my/hoadon?TrangThai=ChuaThanhToan
 */
export const getMyUnpaidInvoices = async () => {
  try {
    // Dùng API an toàn mới và bộ lọc trạng thái
    const response = await api.get('/my/hoadon?TrangThai=ChuaThanhToan');
    return response.data; // Trả về mảng hóa đơn chưa thanh toán
  } catch (error) {
    console.error("Lỗi khi lấy hóa đơn của tôi:", error.response || error);
    throw error;
  }
};

export const invoiceService = {
  getAll: getAllInvoices,
  getById: getInvoiceById,
  create: createInvoice,
  delete: deleteInvoice,
  getPayments: getPaymentsByInvoiceId,
  addDetail: addInvoiceDetail,
  importInvoices,
  getMyUnpaid: getMyUnpaidInvoices
};