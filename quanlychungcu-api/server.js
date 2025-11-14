// server.js (ĐÃ SỬA LỖI TRÙNG LẶP)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, poolConnect } = require('./dbConfig');

// =============================================
// ⭐ BƯỚC 1: IMPORT MIDDLEWARE BẢO VỆ
// =============================================
const { protect, authorize } = require('./middleware/authMiddleware');

// Import file route
const billingRoutes = require('./routes/billing')
const authRoutes = require('./routes/auth');

//new
const userRoleRoutes = require('./routes/userRole');
const vaiTroRoutes = require('./routes/vaiTro');

// (Các tuyến đường nghiệp vụ)
const nguoiDungRoutes = require('./routes/nguoiDung');
const blockRoutes = require('./routes/block');
const tangRoutes = require('./routes/tang');
const canHoRoutes = require('./routes/canHo');
const hopDongRoutes = require('./routes/hopDong');
const dieuKhoanRoutes = require('./routes/dieuKhoan');
const lichSuCuTruRoutes = require('./routes/lichSuCuTru');

const dichVuRoutes = require('./routes/dichVu');
const bangGiaRoutes = require('./routes/bangGia');
const chiSoDichVuRoutes = require('./routes/chiSoDichVu');
const hoaDonRoutes = require('./routes/hoaDon');
const chiTietHoaDonRoutes = require('./routes/chiTietHoaDon');
const thanhToanRoutes = require('./routes/thanhToan');
const giaoDichThanhToanRoutes = require('./routes/giaoDichThanhToan');

const yeuCauRoutes = require('./routes/yeuCau');
const yeuCauLogRoutes = require('./routes/yeuCauLog');
const lichHenRoutes = require('./routes/lichHen');

const nhanVienRoutes = require('./routes/nhanVien');
const khuVucChungRoutes = require('./routes/khuVucChung');
const lichTrucRoutes = require('./routes/lichTruc');
const phanCongRoutes = require('./routes/phanCong');
const suCoRoutes = require('./routes/suCo');
const kiemTraKhuVucRoutes = require('./routes/kiemTraKhuVuc');

const thongBaoRoutes = require('./routes/thongBao');
const thongBaoNguoiDungRoutes = require('./routes/thongBaoNguoiDung');
const thietBiNguoiDungRoutes = require('./routes/thietBiNguoiDung');
const auditLogRoutes = require('./routes/auditLog');
const trangThaiRoutes = require('./routes/trangThai');


const app = express();
const port = process.env.API_PORT || 5000;

// === Middlewares ===
app.use(cors());
app.use(express.json());

// Middleware tiêm (inject) pool vào mọi request
app.use(async (req, res, next) => {
    try {
        await poolConnect;
        req.pool = pool;
        next();
    } catch (err) {
        console.error('Lỗi khi kết nối pool SQL:', err);
        res.status(500).send('Lỗi máy chủ khi kết nối CSDL');
    }
});

// =============================================
// ⭐ BƯỚC 2: ĐỊNH NGHĨA CÁC NHÓM QUYỀN
// =============================================
// Chỉ 'Quản lý' (ví dụ: tạo block, tạo hóa đơn, quản lý nhân viên)
const roleQuanLy = authorize('Quản lý');

// 'Quản lý' và 'Kỹ thuật' (ví dụ: xử lý yêu cầu, phân công)
const roleQuanLyKyThuat = authorize('Quản lý', 'Kỹ thuật');

// =============================================
// ⭐ BƯỚC 3: ÁP DỤNG 'protect' VÀ 'authorize' VÀO ROUTES
// =============================================

// === Tuyến đường CÔNG KHAI (Không cần Token) ===
app.use('/api/auth', authRoutes);


// === NHÓM 1: CẤU TRÚC & TÀI CHÍNH (Chỉ Quản lý) ===
app.use('/api/block', protect, roleQuanLy, blockRoutes);
app.use('/api/tang', protect, roleQuanLy, tangRoutes);
app.use('/api/dichvu', protect, roleQuanLy, dichVuRoutes);
app.use('/api/banggia', protect, roleQuanLy, bangGiaRoutes);
app.use('/api/chitiethoadon', protect, roleQuanLy, chiTietHoaDonRoutes);
app.use('/api/chisodichvu', protect, roleQuanLy, chiSoDichVuRoutes);
app.use('/api/thanhtoan', protect, roleQuanLy, thanhToanRoutes);
app.use('/api/giaodich', protect, roleQuanLy, giaoDichThanhToanRoutes);
app.use('/api/billing', protect, roleQuanLy, billingRoutes);
app.use('/api/auditlog', protect, roleQuanLy, auditLogRoutes);
app.use('/api/nhanvien', protect, roleQuanLy, nhanVienRoutes);

// === NHÓM 2: VẬN HÀNH (Quản lý & Kỹ thuật) ===
app.use('/api/khuvucchung', protect, roleQuanLyKyThuat, khuVucChungRoutes);
app.use('/api/lichtruc', protect, roleQuanLyKyThuat, lichTrucRoutes);
app.use('/api/phancong', protect, roleQuanLyKyThuat, phanCongRoutes);
app.use('/api/suco', protect, roleQuanLyKyThuat, suCoRoutes);
app.use('/api/kiemtra', protect, roleQuanLyKyThuat, kiemTraKhuVucRoutes);
// (Cho phép Kỹ thuật/QL tạo Yêu cầu hộ cư dân, hoặc xử lý)
app.use('/api/yeucau', protect, roleQuanLyKyThuat, yeuCauRoutes); 
app.use('/api/yeucaulog', protect, roleQuanLyKyThuat, yeuCauLogRoutes);
app.use('/api/lichhen', protect, roleQuanLyKyThuat, lichHenRoutes);


// === NHÓM 3: CHUNG (Tất cả vai trò đã đăng nhập) ===
// (Chỉ cần 'protect'. Resident, Quản lý, Kỹ thuật đều có thể xem/dùng)
// (ĐÃ XÓA CÁC ROUTE BỊ TRÙNG LẶP)
app.use('/api/nguoidung', protect, nguoiDungRoutes);
app.use('/api/canho', protect, canHoRoutes);
app.use('/api/hopdong', protect, hopDongRoutes);
app.use('/api/dieukhoan', protect, dieuKhoanRoutes);
app.use('/api/lichsucutru', protect, lichSuCuTruRoutes);
app.use('/api/thongbao', protect, thongBaoRoutes);
app.use('/api/thongbaonguoidung', protect, thongBaoNguoiDungRoutes);
app.use('/api/thietbi', protect, thietBiNguoiDungRoutes);
app.use('/api/trangthai', protect, trangThaiRoutes);
app.use('/api/hoadon', protect, hoaDonRoutes);

//new
app.use('/api/vaitro', protect, roleQuanLy, vaiTroRoutes);
app.use('/api/user-roles', protect, roleQuanLy, userRoleRoutes);


// === Khởi động Server ===
app.listen(port, () => {
    console.log(`Backend API đang chạy tại http://localhost:${port}`);
    console.log('Đã kết nối CSDL và sẵn sàng nhận request.');
});