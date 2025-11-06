// controllers/canHoController.js
const mssql = require('mssql');

/**
 * GET /api/canho - Lấy tất cả căn hộ (JOIN Tầng, Block, và Trạng Thái)
 */
const getAllCanHo = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    ch.MaCanHo, ch.SoCanHo,
                    t.MaTang, t.SoTang,
                    b.MaBlock, b.TenBlock,
                    ISNULL(tt.Ten, 'N/A') AS TenTrangThai -- 👈 ĐÃ THÊM JOIN
                FROM dbo.CanHo ch
                JOIN dbo.Tang t ON ch.MaTang = t.MaTang
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                LEFT JOIN dbo.TrangThai tt ON ch.MaTrangThai = tt.MaTrangThai -- 👈 ĐÃ THÊM JOIN
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all CanHo:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/canho/:id - Lấy 1 căn hộ theo ID (JOIN)
 */
const getCanHoById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaCanHo', mssql.Int, id)
            .query(`
                SELECT 
                    ch.MaCanHo, ch.SoCanHo, ch.MaTrangThai, 
                    t.MaTang, t.SoTang,
                    b.MaBlock, b.TenBlock,
                    ISNULL(tt.Ten, 'N/A') AS TenTrangThai -- 👈 ĐÃ THÊM JOIN
                FROM dbo.CanHo ch
                JOIN dbo.Tang t ON ch.MaTang = t.MaTang
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                LEFT JOIN dbo.TrangThai tt ON ch.MaTrangThai = tt.MaTrangThai -- 👈 ĐÃ THÊM JOIN
                WHERE ch.MaCanHo = @MaCanHo
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy căn hộ');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET CanHo by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/canho - Tạo căn hộ mới
 */
const createCanHo = async (req, res) => {
    try {
        const { SoCanHo, MaTang, MaTrangThai } = req.body; 

        if (!SoCanHo || !MaTang) {
            return res.status(400).send('Thiếu SoCanHo hoặc MaTang');
        }

        const result = await req.pool.request()
            .input('SoCanHo', mssql.NVarChar, SoCanHo)
            .input('MaTang', mssql.Int, MaTang)
            .input('MaTrangThai', mssql.Int, MaTrangThai) // 👈 Đã thêm
            .query(`INSERT INTO dbo.CanHo (SoCanHo, MaTang, MaTrangThai) 
                    OUTPUT Inserted.* VALUES (@SoCanHo, @MaTang, @MaTrangThai)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST CanHo:', err);
        if (err.number === 2627 || err.number === 2601) {
            return res.status(400).send('Số căn hộ này đã tồn tại trong tầng này.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/canho/:id - Cập nhật căn hộ
 */
const updateCanHo = async (req, res) => {
    try {
        const { id } = req.params;
        const { SoCanHo, MaTang, MaTrangThai } = req.body; // 👈 Đã thêm
        const pool = req.pool;

        const oldDataResult = await pool.request()
            .input('MaCanHo', mssql.Int, id)
            .query('SELECT * FROM dbo.CanHo WHERE MaCanHo = @MaCanHo');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy căn hộ để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu
        const newSoCanHo = SoCanHo !== undefined ? SoCanHo : oldData.SoCanHo;
        const newMaTang = MaTang !== undefined ? MaTang : oldData.MaTang;
        const newMaTrangThai = MaTrangThai !== undefined ? MaTrangThai : oldData.MaTrangThai; // 👈 Đã thêm

        const result = await pool.request()
            .input('MaCanHo', mssql.Int, id)
            .input('SoCanHo', mssql.NVarChar, newSoCanHo)
            .input('MaTang', mssql.Int, newMaTang)
            .input('MaTrangThai', mssql.Int, newMaTrangThai) // 👈 Đã thêm
            .query(`UPDATE dbo.CanHo 
                    SET SoCanHo = @SoCanHo, MaTang = @MaTang, MaTrangThai = @MaTrangThai
                    OUTPUT Inserted.* WHERE MaCanHo = @MaCanHo`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT CanHo:', err);
        if (err.number === 2627 || err.number === 2601) {
            return res.status(400).send('Số căn hộ này đã tồn tại trong tầng này.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/canho/:id - Xóa căn hộ
 */
const deleteCanHo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaCanHo', mssql.Int, id)
            .query('DELETE FROM dbo.CanHo OUTPUT Deleted.* WHERE MaCanHo = @MaCanHo');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy căn hộ để xóa');
        }
        res.json({ message: 'Đã xóa căn hộ thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE CanHo:', err);
        if (err.number === 547) {
            return res.status(400).send('Không thể xóa: Căn hộ này đang được liên kết bởi dữ liệu khác (Hợp Đồng, Hóa Đơn,...).');
        }
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllCanHo,
    getCanHoById,
    createCanHo,
    updateCanHo,
    deleteCanHo
};