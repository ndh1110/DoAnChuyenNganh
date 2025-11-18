// src/services/contractService.js
import api from './api';

/**
 * Lớp Service: Chứa tất cả các hàm gọi API liên quan đến "Hợp Đồng"
 */

// --- CÁC HÀM CƠ BẢN (Giữ nguyên) ---
const getAllContracts = async () => {
  try {
    const response = await api.get('/hopdong');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hợp đồng:", error.response || error);
    throw error;
  }
};

const getContractById = async (id) => {
  try {
    const response = await api.get(`/hopdong/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy hợp đồng ${id}:`, error.response || error);
    throw error;
  }
};

const createContract = async (contractData) => {
  try {
    const response = await api.post('/hopdong', contractData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo hợp đồng:", error.response || error);
    throw error;
  }
};

const updateContract = async (id, contractData) => {
  try {
    const response = await api.put(`/hopdong/${id}`, contractData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật hợp đồng ${id}:`, error.response || error);
    throw error;
  }
};

const deleteContract = async (id) => {
  try {
    const response = await api.delete(`/hopdong/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa hợp đồng ${id}:`, error.response || error);
    throw error;
  }
};

// --- CÁC HÀM MỚI CHO ĐIỀU KHOẢN (TERMS) ---

// Lấy danh sách điều khoản của 1 hợp đồng
const getContractTerms = async (contractId) => {
  try {
    const response = await api.get(`/dieukhoan/hopdong/${contractId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy điều khoản hợp đồng ${contractId}:`, error.response || error);
    throw error;
  }
};

// Thêm điều khoản mới
const addContractTerm = async (termData) => {
    // termData: { MaHopDong, NoiDung }
    try {
        const response = await api.post('/dieukhoan', termData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm điều khoản:", error.response || error);
        throw error;
    }
}

// Xóa điều khoản
const deleteContractTerm = async (termId) => {
    try {
        const response = await api.delete(`/dieukhoan/${termId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa điều khoản ${termId}:`, error.response || error);
        throw error;
    }
}

export const contractService = {
  getAll: getAllContracts,
  getById: getContractById,
  create: createContract,
  update: updateContract,
  delete: deleteContract,
  // Export thêm
  getTerms: getContractTerms,
  addTerm: addContractTerm,
  deleteTerm: deleteContractTerm
};