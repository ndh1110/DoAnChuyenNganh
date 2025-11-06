// controllers/hoaDonController.js
const mssql = require('mssql');

/**
 * GET /api/hoadon - Láº¥y táº¥t cáº£ hĂ³a Ä‘Æ¡n
 */
const getAllHoaDon = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    hd.MaHoaDon, hd.KyThang, hd.NgayPhatHanh, hd.NgayDenHan, hd.TongTien,
                    hd.TrangThai, -- đŸ‘ˆ ÄĂƒ THĂM
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
        console.error('Lá»—i GET all HoaDon:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/hoadon/:id - Láº¥y 1 hĂ³a Ä‘Æ¡n theo ID
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
                    hd.TrangThai, -- đŸ‘ˆ ÄĂƒ THĂM
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
            return res.status(404).send('KhĂ´ng tĂ¬m tháº¥y hĂ³a Ä‘Æ¡n');
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
        console.error('Lá»—i GET HoaDon by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/hoadon - Táº¡o hĂ³a Ä‘Æ¡n má»›i
 */
const createHoaDon = async (req, res) => {
    try {
        const { MaCanHo, KyThang, NgayPhatHanh, NgayDenHan } = req.body; 

        if (!MaCanHo || !KyThang || !NgayPhatHanh || !NgayDenHan) {
            return res.status(400).send('Thiáº¿u thĂ´ng tin báº¯t buá»™c');
        }

        const result = await req.pool.request()
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('KyThang', mssql.Date, KyThang)
            .input('NgayPhatHanh', mssql.Date, NgayPhatHanh)
            .input('NgayDenHan', mssql.Date, NgayDenHan)
            .input('TongTien', mssql.Decimal(18, 2), 0)
            // TrangThai sáº½ tá»± Ä‘á»™ng láº¥y DEFAULT N'Chá» thanh toĂ¡n'
            .query(`INSERT INTO dbo.HoaDon (MaCanHo, KyThang, NgayPhatHanh, NgayDenHan, TongTien) 
                    OUTPUT Inserted.* VALUES (@MaCanHo, @KyThang, @NgayPhatHanh, @NgayDenHan, @TongTien)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lá»—i POST HoaDon:', err);
        if (err.number === 547) {
            return res.status(400).send('Lá»—i KhĂ³a Ngoáº¡i: MaCanHo khĂ´ng tá»“n táº¡i.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/hoadon/:id - XĂ³a hĂ³a Ä‘Æ¡n
 */
const deleteHoaDon = async (req, res) => {
    // ... (Giá»¯ nguyĂªn code cá»§a hĂ m deleteHoaDon, khĂ´ng cáº§n thay Ä‘á»•i)
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .query('DELETE FROM dbo.HoaDon OUTPUT Deleted.* WHERE MaHoaDon = @MaHoaDon');

        if (result.recordset.length === 0) {
            return res.status(404).send('KhĂ´ng tĂ¬m tháº¥y hĂ³a Ä‘Æ¡n Ä‘á»ƒ xĂ³a');
        }
        res.json({ message: 'ÄĂ£ xĂ³a hĂ³a Ä‘Æ¡n (vĂ  cĂ¡c chi tiáº¿t, thanh toĂ¡n liĂªn quan) thĂ nh cĂ´ng', data: result.recordset[0] });
    } catch (err) {
        console.error('Lá»—i DELETE HoaDon:', err);
        res.status(500).send(err.message);
    }
};

// =============================================
// â­ HĂ€M Má»I: Cáº­p nháº­t tráº¡ng thĂ¡i HĂ³a ÄÆ¡n
// =============================================
/**
 * PUT /api/hoadon/:id/status - Cáº­p nháº­t tráº¡ng thĂ¡i
 */
const updateHoaDonStatus = async (req, res) => {
    try {
        const { id } = req.params; // MaHoaDon
        const { TrangThai } = req.body;

        if (!TrangThai) {
            return res.status(400).send('Thiáº¿u TrangThai');
        }

        const result = await req.pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .input('TrangThai', mssql.NVarChar, TrangThai)
            .query(`UPDATE dbo.HoaDon 
                    SET TrangThai = @TrangThai
                    OUTPUT Inserted.* WHERE MaHoaDon = @MaHoaDon`);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('KhĂ´ng tĂ¬m tháº¥y hĂ³a Ä‘Æ¡n Ä‘á»ƒ cáº­p nháº­t');
        }
        
        res.json(result.recordset[0]);

    } catch (err) {
        console.error('Lá»—i PUT HoaDon Status:', err);
        res.status(500).send(err.message);
    }
};


module.exports = {
    getAllHoaDon,
    getHoaDonById,
    createHoaDon,
    deleteHoaDon,
    updateHoaDonStatus
};