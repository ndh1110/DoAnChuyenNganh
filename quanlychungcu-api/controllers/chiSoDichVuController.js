// controllers/chiSoDichVuController.js
const mssql = require('mssql');

/**
 * GET /api/chisodichvu - Lấy tất cả chỉ số (JOIN Căn Hộ và Dịch Vụ)
 */
const getAllChiSoDichVu = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    cs.MaChiSo, cs.KyThang, cs.ChiSoCu, cs.ChiSoMoi,
                    ch.MaCanHo, ch.SoCanHo,
                    dv.MaDichVu, dv.TenDichVu
                FROM dbo.ChiSoDichVu cs
                JOIN dbo.CanHo ch ON cs.MaCanHo = ch.MaCanHo
                JOIN dbo.DichVu dv ON cs.MaDichVu = dv.MaDichVu
                ORDER BY cs.KyThang DESC, ch.SoCanHo
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all ChiSoDichVu:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/chisodichvu/:id - Lấy 1 chỉ số theo ID
 */
const getChiSoDichVuById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaChiSo', mssql.Int, id)
            .query(`
                SELECT 
                    cs.MaChiSo, cs.KyThang, cs.ChiSoCu, cs.ChiSoMoi,
                    ch.MaCanHo, ch.SoCanHo,
                    dv.MaDichVu, dv.TenDichVu
                FROM dbo.ChiSoDichVu cs
                JOIN dbo.CanHo ch ON cs.MaCanHo = ch.MaCanHo
                JOIN dbo.DichVu dv ON cs.MaDichVu = dv.MaDichVu
                WHERE cs.MaChiSo = @MaChiSo
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi chỉ số');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET ChiSoDichVu by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/chisodichvu - Ghi chỉ số mới
 * Cần: MaCanHo, MaDichVu, KyThang, ChiSoCu, ChiSoMoi
 */
const createChiSoDichVu = async (req, res) => {
    try {
        const { MaCanHo, MaDichVu, KyThang, ChiSoCu, ChiSoMoi } = req.body; 

        if (MaCanHo === undefined || MaDichVu === undefined || !KyThang || ChiSoCu === undefined || ChiSoMoi === undefined) {
            return res.status(400).send('Thiếu thông tin bắt buộc');
        }
        
        // Kiểm tra ràng buộc từ DB
        if (ChiSoMoi < ChiSoCu) {
             return res.status(400).send('ChiSoMoi phải lớn hơn hoặc bằng ChiSoCu');
        }

        const result = await req.pool.request()
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('MaDichVu', mssql.Int, MaDichVu)
            .input('KyThang', mssql.Date, KyThang)
            .input('ChiSoCu', mssql.Decimal(12, 2), ChiSoCu)
            .input('ChiSoMoi', mssql.Decimal(12, 2), ChiSoMoi)
            .query(`INSERT INTO dbo.ChiSoDichVu (MaCanHo, MaDichVu, KyThang, ChiSoCu, ChiSoMoi) 
                    OUTPUT Inserted.* VALUES (@MaCanHo, @MaDichVu, @KyThang, @ChiSoCu, @ChiSoMoi)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST ChiSoDichVu:', err);
        // Lỗi Khóa Ngoại
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaCanHo hoặc MaDichVu không tồn tại.');
        }
        // Lỗi Unique (MaCanHo, MaDichVu, KyThang)
        if (err.number === 2601 || err.number === 2627) {
            return res.status(400).send('Lỗi Unique: Đã tồn tại chỉ số cho Căn Hộ này, Dịch Vụ này, trong Kỳ Tháng này.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/chisodichvu/:id - Cập nhật chỉ số
 */
const updateChiSoDichVu = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        const oldDataResult = await pool.request()
            .input('MaChiSo', mssql.Int, id)
            .query('SELECT * FROM dbo.ChiSoDichVu WHERE MaChiSo = @MaChiSo');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi chỉ số để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu
        const { MaCanHo, MaDichVu, KyThang, ChiSoCu, ChiSoMoi } = req.body;
        const newMaCanHo = MaCanHo !== undefined ? MaCanHo : oldData.MaCanHo;
        const newMaDichVu = MaDichVu !== undefined ? MaDichVu : oldData.MaDichVu;
        const newKyThang = KyThang !== undefined ? KyThang : oldData.KyThang;
        const newChiSoCu = ChiSoCu !== undefined ? ChiSoCu : oldData.ChiSoCu;
        const newChiSoMoi = ChiSoMoi !== undefined ? ChiSoMoi : oldData.ChiSoMoi;

        if (newChiSoMoi < newChiSoCu) {
             return res.status(400).send('ChiSoMoi phải lớn hơn hoặc bằng ChiSoCu');
        }

        const result = await pool.request()
            .input('MaChiSo', mssql.Int, id)
            .input('MaCanHo', mssql.Int, newMaCanHo)
            .input('MaDichVu', mssql.Int, newMaDichVu)
            .input('KyThang', mssql.Date, newKyThang)
            .input('ChiSoCu', mssql.Decimal(12, 2), newChiSoCu)
            .input('ChiSoMoi', mssql.Decimal(12, 2), newChiSoMoi)
            .query(`UPDATE dbo.ChiSoDichVu 
                    SET MaCanHo = @MaCanHo, MaDichVu = @MaDichVu, KyThang = @KyThang,
                        ChiSoCu = @ChiSoCu, ChiSoMoi = @ChiSoMoi
                    OUTPUT Inserted.* WHERE MaChiSo = @MaChiSo`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT ChiSoDichVu:', err);
        if (err.number === 547) return res.status(400).send('Lỗi Khóa Ngoại: MaCanHo hoặc MaDichVu không tồn tại.');
        if (err.number === 2601 || err.number === 2627) return res.status(400).send('Lỗi Unique: Đã tồn tại chỉ số cho Căn Hộ này, Dịch Vụ này, trong Kỳ Tháng này.');
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/chisodichvu/:id - Xóa chỉ số
 */
const deleteChiSoDichVu = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaChiSo', mssql.Int, id)
            .query('DELETE FROM dbo.ChiSoDichVu OUTPUT Deleted.* WHERE MaChiSo = @MaChiSo');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi chỉ số để xóa');
        }
        res.json({ message: 'Đã xóa bản ghi chỉ số thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE ChiSoDichVu:', err);
        // Lỗi FK (nếu ChiTietHoaDon đang tham chiếu đến MaChiSo này)
        if (err.number === 547) {
            return res.status(400).send('Không thể xóa: Chỉ số này đã được sử dụng trong một Hóa Đơn Chi Tiết.');
        }
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllChiSoDichVu,
    getChiSoDichVuById,
    createChiSoDichVu,
    updateChiSoDichVu,
    deleteChiSoDichVu
};