// controllers/hoaDonController.js
const mssql = require('mssql');

/**
 * GET /api/hoadon - Lấy tất cả hóa đơn
 * (JOIN với Căn Hộ, Tầng, Block)
 */
const getAllHoaDon = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    hd.MaHoaDon, hd.KyThang, hd.NgayPhatHanh, hd.NgayDenHan, hd.TongTien,
                    ch.MaCanHo, ch.SoCanHo,
                    t.SoTang,
                    b.TenBlock
                FROM dbo.HoaDon hd
                JOIN dbo.CanHo ch ON hd.MaCanHo = ch.MaCanHo
                JOIN dbo.Tang t ON ch.MaTang = t.MaTang
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                ORDER BY hd.KyThang DESC, ch.SoCanHo
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all HoaDon:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/hoadon/:id - Lấy 1 hóa đơn theo ID (Bao gồm cả Chi Tiết)
 */
const getHoaDonById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        // 1. Lấy thông tin hóa đơn chính
        const hoaDonResult = await pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .query(`
                SELECT 
                    hd.MaHoaDon, hd.KyThang, hd.NgayPhatHanh, hd.NgayDenHan, hd.TongTien,
                    ch.MaCanHo, ch.SoCanHo,
                    t.SoTang,
                    b.TenBlock
                FROM dbo.HoaDon hd
                JOIN dbo.CanHo ch ON hd.MaCanHo = ch.MaCanHo
                JOIN dbo.Tang t ON ch.MaTang = t.MaTang
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                WHERE hd.MaHoaDon = @MaHoaDon
            `);
        
        if (hoaDonResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy hóa đơn');
        }

        // 2. Lấy thông tin chi tiết hóa đơn (JOIN với Dịch Vụ)
        const chiTietResult = await pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .query(`
                SELECT 
                    ct.MaCT, ct.ThanhTien, ct.MaChiSo,
                    dv.MaDichVu, dv.TenDichVu, dv.DonViMacDinh
                FROM dbo.ChiTietHoaDon ct
                JOIN dbo.DichVu dv ON ct.MaDichVu = dv.MaDichVu
                WHERE ct.MaHoaDon = @MaHoaDon
            `);

        // 3. Gộp kết quả
        const hoaDon = hoaDonResult.recordset[0];
        hoaDon.ChiTiet = chiTietResult.recordset;

        res.json(hoaDon);

    } catch (err) {
        console.error('Lỗi GET HoaDon by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/hoadon - Tạo hóa đơn mới (chỉ tạo phiếu, TongTien = 0)
 * Cần: MaCanHo, KyThang, NgayPhatHanh, NgayDenHan
 */
const createHoaDon = async (req, res) => {
    try {
        const { MaCanHo, KyThang, NgayPhatHanh, NgayDenHan } = req.body; 

        if (!MaCanHo || !KyThang || !NgayPhatHanh || !NgayDenHan) {
            return res.status(400).send('Thiếu thông tin bắt buộc (MaCanHo, KyThang, NgayPhatHanh, NgayDenHan)');
        }

        const result = await req.pool.request()
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('KyThang', mssql.Date, KyThang)
            .input('NgayPhatHanh', mssql.Date, NgayPhatHanh)
            .input('NgayDenHan', mssql.Date, NgayDenHan)
            .input('TongTien', mssql.Decimal(18, 2), 0) // Hóa đơn mới tạo TongTien = 0
            .query(`INSERT INTO dbo.HoaDon (MaCanHo, KyThang, NgayPhatHanh, NgayDenHan, TongTien) 
                    OUTPUT Inserted.* VALUES (@MaCanHo, @KyThang, @NgayPhatHanh, @NgayDenHan, @TongTien)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST HoaDon:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaCanHo không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/hoadon/:id - Xóa hóa đơn
 * (Sẽ xóa cả ChiTietHoaDon và ThanhToan liên quan vì có ON DELETE CASCADE)
 */
const deleteHoaDon = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cảnh báo: Bảng ChiTietHoaDon và ThanhToan đều có ON DELETE CASCADE
        // Xóa HoaDon sẽ xóa tất cả các dòng con liên quan.
        
        const result = await req.pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .query('DELETE FROM dbo.HoaDon OUTPUT Deleted.* WHERE MaHoaDon = @MaHoaDon');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy hóa đơn để xóa');
        }
        res.json({ message: 'Đã xóa hóa đơn (và các chi tiết, thanh toán liên quan) thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE HoaDon:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllHoaDon,
    getHoaDonById,
    createHoaDon,
    deleteHoaDon
    // Không làm PUT cho Hóa Đơn, vì TongTien được quản lý tự động
};