// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, poolConnect } = require('./dbConfig');

//Import các middleware
const { protect } = require('./middleware/authMiddleware');

// Import file route
const authRoutes = require('./routes/auth');
const nguoiDungRoutes = require('./routes/nguoiDung');
const blockRoutes = require('./routes/block');
const tangRoutes = require('./routes/tang');
const canHoRoutes = require('./routes/canHo');
const hopDongRoutes = require('./routes/hopDong');
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
const lichSuCuTruRoutes = require('./routes/lichSuCuTru');
const thongBaoRoutes = require('./routes/thongBao');
const thongBaoNguoiDungRoutes = require('./routes/thongBaoNguoiDung');
const thietBiNguoiDungRoutes = require('./routes/thietBiNguoiDung');
const auditLogRoutes = require('./routes/auditLog');
const dieuKhoanRoutes = require('./routes/dieuKhoan');
const nhanVienRoutes = require('./routes/nhanVien');
const khuVucChungRoutes = require('./routes/khuVucChung');
const lichTrucRoutes = require('./routes/lichTruc');
const phanCongRoutes = require('./routes/phanCong');
const suCoRoutes = require('./routes/suCo');
const kiemTraKhuVucRoutes = require('./routes/kiemTraKhuVuc');
const trangThaiRoutes = require('./routes/trangThai');
const billingRoutes = require('./routes/billing');
// Bạn có thể thêm các file route khác ở đây

const app = express();
const port = process.env.API_PORT || 5000;

// === Middlewares ===
app.use(cors());
app.use(express.json());

// Middleware để tiêm (inject) pool vào mọi request
// Bằng cách này, controller có thể truy cập qua req.pool
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

// === Routes ===
//Route công khai (không cần bảo vệ)
app.use('/api/auth', authRoutes);

// Khi có request đến /api/nguoidung, hãy dùng file nguoiDungRoutes
app.use('/api/nguoidung', protect, nguoiDungRoutes);
app.use('/api/block', protect, blockRoutes);
app.use('/api/tang', protect, tangRoutes);
app.use('/api/canho', protect, canHoRoutes);
app.use('/api/hopdong', protect, hopDongRoutes);
app.use('/api/dichvu', protect, dichVuRoutes);
app.use('/api/banggia', protect, bangGiaRoutes);
app.use('/api/chisodichvu', protect, chiSoDichVuRoutes);
app.use('/api/hoadon', protect, hoaDonRoutes);
app.use('/api/chitiethoadon', protect, chiTietHoaDonRoutes);
app.use('/api/thanhtoan', protect, thanhToanRoutes);
app.use('/api/giaodichthanhtoan', protect, giaoDichThanhToanRoutes);
app.use('/api/yeucau', protect, yeuCauRoutes);
app.use('/api/yeucaulog', protect, yeuCauLogRoutes);
app.use('/api/lichhen', protect, lichHenRoutes);
app.use('/api/lichsucutru', protect, lichSuCuTruRoutes);
app.use('/api/thongbao', protect, thongBaoRoutes);
app.use('/api/thongbaonguoidung', protect, thongBaoNguoiDungRoutes);
app.use('/api/thietbi', protect, thietBiNguoiDungRoutes);
app.use('/api/auditlog', protect, auditLogRoutes);
app.use('/api/dieukhoan', protect, dieuKhoanRoutes);
app.use('/api/nhanvien', protect, nhanVienRoutes);
app.use('/api/khuvucchung', protect, khuVucChungRoutes);
app.use('/api/lichtruc', protect, lichTrucRoutes);
app.use('/api/phancong', protect, phanCongRoutes);
app.use('/api/suco', protect, suCoRoutes);
app.use('/api/kiemtrakhuvuc', protect, kiemTraKhuVucRoutes);
app.use('/api/trangthai', protect, trangThaiRoutes);
app.use('/api/billing', protect, billingRoutes);
// Bạn có thể thêm các routes khác ở đây


// Khởi động server
app.listen(port, () => {
    console.log(`Backend API đang chạy tại http://localhost:${port}`);
    console.log('Đã kết nối CSDL và sẵn sàng nhận request.');
});