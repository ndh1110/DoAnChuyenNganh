// controllers/blockController.js
const mssql = require('mssql');

/**
 * GET /api/block - Lấy tất cả block
 */
const getAllBlocks = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query('SELECT * FROM dbo.Block ORDER BY TenBlock');
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all Blocks:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/block/:id - Lấy 1 block theo ID (MaBlock)
 */
const getBlockById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaBlock', mssql.Int, id)
            .query('SELECT * FROM dbo.Block WHERE MaBlock = @MaBlock');
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy block');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET Block by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/block - Tạo block mới
 * Cần: TenBlock, SoTang
 */
const createBlock = async (req, res) => {
    try {
        const { TenBlock, SoTang } = req.body; 

        if (!TenBlock || !SoTang) {
            return res.status(400).send('Thiếu TenBlock hoặc SoTang');
        }

        const result = await req.pool.request()
            .input('TenBlock', mssql.NVarChar, TenBlock)
            .input('SoTang', mssql.Int, SoTang)
            .query('INSERT INTO dbo.Block (TenBlock, SoTang) OUTPUT Inserted.* VALUES (@TenBlock, @SoTang)');
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST Block:', err);
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/block/:id - Cập nhật block (MaBlock)
 */
const updateBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        const oldDataResult = await pool.request()
            .input('MaBlock', mssql.Int, id)
            .query('SELECT * FROM dbo.Block WHERE MaBlock = @MaBlock');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy block để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu (partial update)
        const { TenBlock, SoTang } = req.body;
        const newTenBlock = TenBlock !== undefined ? TenBlock : oldData.TenBlock;
        const newSoTang = SoTang !== undefined ? SoTang : oldData.SoTang;

        const result = await pool.request()
            .input('MaBlock', mssql.Int, id)
            .input('TenBlock', mssql.NVarChar, newTenBlock)
            .input('SoTang', mssql.Int, newSoTang)
            .query(`UPDATE dbo.Block 
                    SET TenBlock = @TenBlock, SoTang = @SoTang
                    OUTPUT Inserted.* WHERE MaBlock = @MaBlock`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT Block:', err);
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/block/:id - Xóa block (MaBlock)
 */
const deleteBlock = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cảnh báo: Bảng Tang (Tầng) có ON DELETE CASCADE [cite: 1946]
        // Xóa Block sẽ xóa tất cả Tầng, Căn Hộ, Hóa Đơn, Hợp Đồng... liên quan đến Block đó.
        
        const result = await req.pool.request()
            .input('MaBlock', mssql.Int, id)
            .query('DELETE FROM dbo.Block OUTPUT Deleted.* WHERE MaBlock = @MaBlock');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy block để xóa');
        }
        res.json({ message: 'Đã xóa block (và tất cả Tầng, Căn Hộ liên quan) thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE Block:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllBlocks,
    getBlockById,
    createBlock,
    updateBlock,
    deleteBlock
};