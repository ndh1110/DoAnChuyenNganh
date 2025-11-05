// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, poolConnect } = require('./dbConfig');

// Import file route
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
// Khi có request đến /api/nguoidung, hãy dùng file nguoiDungRoutes
app.use('/api/nguoidung', nguoiDungRoutes);
app.use('/api/block', blockRoutes);
app.use('/api/tang', tangRoutes);
app.use('/api/canho', canHoRoutes);
app.use('/api/hopdong', hopDongRoutes);
app.use('/api/dichvu', dichVuRoutes);
app.use('/api/banggia', bangGiaRoutes);
app.use('/api/chisodichvu', chiSoDichVuRoutes);
app.use('/api/hoadon', hoaDonRoutes);
app.use('/api/chitiethoadon', chiTietHoaDonRoutes);
app.use('/api/thanhtoan', thanhToanRoutes);
app.use('/api/giaodichthanhtoan', giaoDichThanhToanRoutes);
app.use('/api/yeucau', yeuCauRoutes);
app.use('/api/yeucaulog', yeuCauLogRoutes);
app.use('/api/lichhen', lichHenRoutes);
app.use('/api/lichsucutru', lichSuCuTruRoutes);
app.use('/api/thongbao', thongBaoRoutes);
app.use('/api/thongbaonguoidung', thongBaoNguoiDungRoutes);
app.use('/api/thietbi', thietBiNguoiDungRoutes);
app.use('/api/auditlog', auditLogRoutes);
app.use('/api/dieukhoan', dieuKhoanRoutes);
app.use('/api/nhanvien', nhanVienRoutes);
app.use('/api/khuvucchung', khuVucChungRoutes);
app.use('/api/lichtruc', lichTrucRoutes);
app.use('/api/phancong', phanCongRoutes);
app.use('/api/suco', suCoRoutes);
app.use('/api/kiemtrakhuvuc', kiemTraKhuVucRoutes);
// Bạn có thể thêm các routes khác ở đây


// Khởi động server
app.listen(port, () => {
    console.log(`Backend API đang chạy tại http://localhost:${port}`);
    console.log('Đã kết nối CSDL và sẵn sàng nhận request.');
});