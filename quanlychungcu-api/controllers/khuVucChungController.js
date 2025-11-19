// controllers/khuVucChungController.js
const mssql = require('mssql');

/**
 * GET /api/khuvucchung - Lấy tất cả khu vực chung
 * (JOIN với Block)
 */
const getAllKhuVucChung = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    kvc.MaKhuVucChung, kvc.Ten, kvc.Loai, kvc.MoTa, kvc.Tang, kvc.TrangThai,
                    b.MaBlock, b.TenBlock
                FROM dbo.KhuVucChung kvc
                JOIN dbo.Block b ON kvc.MaBlock = b.MaBlock
                -- Frontend sẽ tự lọc Loai='Tiện ích' hoặc chúng ta có thể lọc luôn ở đây nếu muốn
                ORDER BY kvc.Loai, kvc.Ten
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all KhuVucChung:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/khuvucchung/:id - Lấy 1 khu vực chung theo ID
 */
const getKhuVucChungById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaKhuVucChung', mssql.Int, id)
            .query(`
                SELECT 
                    kvc.MaKhuVucChung, kvc.Ten, kvc.Loai, kvc.MoTa, kvc.Tang, kvc.TrangThai,
                    b.MaBlock, b.TenBlock
                FROM dbo.KhuVucChung kvc
                JOIN dbo.Block b ON kvc.MaBlock = b.MaBlock
                WHERE kvc.MaKhuVucChung = @MaKhuVucChung
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy khu vực chung');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET KhuVucChung by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/khuvucchung - Tạo khu vực chung mới
 * Cần: MaBlock, Ten, Loai
 */
const createKhuVucChung = async (req, res) => {
    try {
        const { MaBlock, Ten, Loai, MoTa, Tang, TrangThai } = req.body; 

        if (!MaBlock || !Ten || !Loai) {
            return res.status(400).send('Thiếu MaBlock, Ten hoặc Loai');
        }
        
        const trangThaiValue = TrangThai ? TrangThai : 'Hoạt động'; // Default

        const result = await req.pool.request()
            .input('MaBlock', mssql.Int, MaBlock)
            .input('Ten', mssql.NVarChar, Ten)
            .input('Loai', mssql.NVarChar, Loai)
            .input('MoTa', mssql.NVarChar, MoTa)
            .input('Tang', mssql.Int, Tang)
            .input('TrangThai', mssql.NVarChar, trangThaiValue)
            .query(`INSERT INTO dbo.KhuVucChung (MaBlock, Ten, Loai, MoTa, Tang, TrangThai) 
                    OUTPUT Inserted.* VALUES (@MaBlock, @Ten, @Loai, @MoTa, @Tang, @TrangThai)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST KhuVucChung:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaBlock không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/khuvucchung/:id - Cập nhật khu vực chung
 */
const updateKhuVucChung = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        const oldDataResult = await pool.request()
            .input('MaKhuVucChung', mssql.Int, id)
            .query('SELECT * FROM dbo.KhuVucChung WHERE MaKhuVucChung = @MaKhuVucChung');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy khu vực chung để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu
        const { MaBlock, Ten, Loai, MoTa, Tang, TrangThai } = req.body;
        const newMaBlock = MaBlock !== undefined ? MaBlock : oldData.MaBlock;
        const newTen = Ten !== undefined ? Ten : oldData.Ten;
        const newLoai = Loai !== undefined ? Loai : oldData.Loai;
        const newMoTa = MoTa !== undefined ? MoTa : oldData.MoTa;
        const newTang = Tang !== undefined ? Tang : oldData.Tang;
        const newTrangThai = TrangThai !== undefined ? TrangThai : oldData.TrangThai;

        const result = await pool.request()
            .input('MaKhuVucChung', mssql.Int, id)
            .input('MaBlock', mssql.Int, newMaBlock)
            .input('Ten', mssql.NVarChar, newTen)
            .input('Loai', mssql.NVarChar, newLoai)
            .input('MoTa', mssql.NVarChar, newMoTa)
            .input('Tang', mssql.Int, newTang)
            .input('TrangThai', mssql.NVarChar, newTrangThai)
            .query(`UPDATE dbo.KhuVucChung 
                    SET MaBlock = @MaBlock, Ten = @Ten, Loai = @Loai, 
                        MoTa = @MoTa, Tang = @Tang, TrangThai = @TrangThai
                    OUTPUT Inserted.* WHERE MaKhuVucChung = @MaKhuVucChung`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT KhuVucChung:', err);
         if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaBlock không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/khuvucchung/:id - Xóa khu vực chung
 */
const deleteKhuVucChung = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cảnh báo: PhanCong, KiemTraKhuVuc, SuCo đều liên kết với bảng này
        // (đã có ON DELETE CASCADE / SET NULL)
        
        const result = await req.pool.request()
            .input('MaKhuVucChung', mssql.Int, id)
            .query('DELETE FROM dbo.KhuVucChung OUTPUT Deleted.* WHERE MaKhuVucChung = @MaKhuVucChung');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy khu vực chung để xóa');
        }
        res.json({ message: 'Đã xóa khu vực chung (và các phân công/sự cố liên quan) thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE KhuVucChung:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllKhuVucChung,
    getKhuVucChungById,
    createKhuVucChung,
    updateKhuVucChung,
    deleteKhuVucChung
};