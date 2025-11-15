import api from './api.js';

/**
 * Lớp Service: Chứa tất cả các hàm gọi API liên quan đến "Kiểm Tra Khu Vực"
 */

// API cho Kiểm Tra Kỹ Thuật (GET /api/kiemtrakhuvuc)
const getAll = async () => {
  try {
    const response = await api.get('/kiemtra');
    return response.data; // Trả về data
  } catch (error) {
    console.error("Lỗi khi lấy Lịch sử kiểm tra:", error.response || error);
    throw error;
  }
};

/**
 * Lấy các lần kiểm tra của 1 khu vực (GET /api/kiemtrakhuvuc/khuvuc/:id)
 * (Lưu ý: API của bạn dùng /khuvuc/:id, không phải /:id)
 */
const getByKhuVucId = async (khuVucId) => {
    try {
        const response = await api.get(`${'/kiemtra'}/kiemtra/${khuVucId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy kiểm tra cho KVC ID ${khuVucId}:`, error.response || error);
        throw error;
    }
};

/**
 * Ghi nhận một lần kiểm tra mới (POST /api/kiemtrakhuvuc)
 * data: { MaKhuVucChung, MaNhanVien, DanhGia, GhiChu }
 */
const create = async (data) => {
    try {
        const response = await api.post('/kiemtra', data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo nhật ký kiểm tra:", error.response || error);
        throw error;
    }
};

/**
 * Xóa nhật ký kiểm tra (DELETE /api/kiemtrakhuvuc/:id)
 * id: MaKiemTraKVC
 */
const deleteById = async (id) => {
    try {
        const response = await api.delete(`${'/kiemtra'}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa nhật ký kiểm tra ID ${id}:`, error.response || error);
        throw error;
    }
};

// Gom tất cả các hàm vào object để export
export const inspectionService = { 
    getAll,
    getByKhuVucId,
    create,
    delete: deleteById
};