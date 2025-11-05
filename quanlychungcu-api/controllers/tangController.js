// controllers/tangController.js
const mssql = require('mssql');

/**
 * GET /api/tang - Lấy tất cả tầng
 * (JOIN với Block)
 */
const getAllTangs = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    t.MaTang, t.SoTang,
                    b.MaBlock, b.TenBlock
                FROM dbo.Tang t
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                ORDER BY b.TenBlock, t.SoTang
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all Tangs:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/tang/block/:id - Lấy tất cả tầng của 1 Block (MaBlock)
 */
const getTangsByBlockId = async (req, res) => {
    try {
        const { id } = req.params; // MaBlock
        const result = await req.pool.request()
            .input('MaBlock', mssql.Int, id)
            .query(`
                SELECT 
                    t.MaTang, t.SoTang,
                    b.MaBlock, b.TenBlock
                FROM dbo.Tang t
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                WHERE t.MaBlock = @MaBlock
                ORDER BY t.SoTang
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET Tangs by Block ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/tang - Tạo tầng mới
 * Cần: MaBlock, SoTang
 */
const createTang = async (req, res) => {
    try {
        const { MaBlock, SoTang } = req.body; 

        if (!MaBlock || !SoTang) {
            return res.status(400).send('Thiếu MaBlock hoặc SoTang');
        }

        const result = await req.pool.request()
            .input('MaBlock', mssql.Int, MaBlock)
            .input('SoTang', mssql.Int, SoTang)
            .query('INSERT INTO dbo.Tang (MaBlock, SoTang) OUTPUT Inserted.* VALUES (@MaBlock, @SoTang)');
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST Tang:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaBlock không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/tang/:id - Xóa tầng (MaTang)
 */
const deleteTang = async (req, res) => {
    try {
        const { id } = req.params; // MaTang
        
        // Cảnh báo: Bảng CanHo (Căn Hộ) KHÔNG có ON DELETE CASCADE
        // Bạn sẽ không thể xóa Tầng nếu nó đang chứa Căn Hộ.
        
        const result = await req.pool.request()
            .input('MaTang', mssql.Int, id)
            .query('DELETE FROM dbo.Tang OUTPUT Deleted.* WHERE MaTang = @MaTang');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy tầng để xóa');
        }
        res.json({ message: 'Đã xóa tầng thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE Tang:', err);
        // Bắt lỗi FK (Constraint FK_CanHo_Tang)
        if (err.number === 547) {
            return res.status(400).send('Không thể xóa: Tầng này vẫn còn chứa Căn Hộ.');
        }
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllTangs,
    getTangsByBlockId,
    createTang,
    deleteTang
    // (Chúng ta không cần PUT (Update) cho Tầng, vì chỉ có 2 cột, 
    // nếu sai thì nên Xóa tạo lại)
};