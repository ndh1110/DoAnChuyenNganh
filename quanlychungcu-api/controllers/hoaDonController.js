// controllers/hoaDonController.js
const mssql = require('mssql');

/**
 * GET /api/hoadon - Lấy tất cả hóa đơn
 */
const getAllHoaDon = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    hd.MaHoaDon, hd.KyThang, hd.NgayPhatHanh, hd.NgayDenHan, hd.TongTien,
                    hd.TrangThai, -- 👈 ĐÃ THÊM
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
 * GET /api/hoadon/:id - Lấy 1 hóa đơn theo ID
 */
const getHoaDonById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        const hoaDonResult = await pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .query(`
                SELECT 
                    hd.MaHoaDon, hd.KyThang, hd.NgayPhatHanh, hd.NgayDenHan, hd.TongTien,
                    hd.TrangThai, -- 👈 ĐÃ THÊM
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

        const hoaDon = hoaDonResult.recordset[0];
        hoaDon.ChiTiet = chiTietResult.recordset;

        res.json(hoaDon);

    } catch (err) {
        console.error('Lỗi GET HoaDon by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/hoadon - Tạo hóa đơn mới
 */
const createHoaDon = async (req, res) => {
    try {
        const { MaCanHo, KyThang, NgayPhatHanh, NgayDenHan } = req.body; 

        if (!MaCanHo || !KyThang || !NgayPhatHanh || !NgayDenHan) {
            return res.status(400).send('Thiếu thông tin bắt buộc');
        }

        const result = await req.pool.request()
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('KyThang', mssql.Date, KyThang)
            .input('NgayPhatHanh', mssql.Date, NgayPhatHanh)
            .input('NgayDenHan', mssql.Date, NgayDenHan)
            .input('TongTien', mssql.Decimal(18, 2), 0)
            // TrangThai sẽ tự động lấy DEFAULT N'Chờ thanh toán'
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
 */
const deleteHoaDon = async (req, res) => {
    // ... (Giữ nguyên code của hàm deleteHoaDon, không cần thay đổi)
    try {
        const { id } = req.params;
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

// =============================================
// ⭐ HÀM MỚI: Cập nhật trạng thái Hóa Đơn
// =============================================
/**
 * PUT /api/hoadon/:id/status - Cập nhật trạng thái
 */
const updateHoaDonStatus = async (req, res) => {
    try {
        const { id } = req.params; // MaHoaDon
        const { TrangThai } = req.body; // Ví dụ: "Đã thanh toán"

        if (!TrangThai) {
            return res.status(400).send('Thiếu TrangThai');
        }

        const result = await req.pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .input('TrangThai', mssql.NVarChar, TrangThai)
            .query(`UPDATE dbo.HoaDon 
                    SET TrangThai = @TrangThai
                    OUTPUT Inserted.* WHERE MaHoaDon = @MaHoaDon`);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy hóa đơn để cập nhật');
        }
        
        res.json(result.recordset[0]);

    } catch (err) {
        console.error('Lỗi PUT HoaDon Status:', err);
        res.status(500).send(err.message);
    }
};


module.exports = {
    getAllHoaDon,
    getHoaDonById,
    createHoaDon,
    deleteHoaDon,
    updateHoaDonStatus // 👈 Thêm hàm mới
};