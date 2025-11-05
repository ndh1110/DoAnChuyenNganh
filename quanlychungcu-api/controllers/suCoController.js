// controllers/suCoController.js
const mssql = require('mssql');

/**
 * GET /api/suco - Lấy tất cả sự cố
 * (JOIN KhuVucChung, Block, NhanVien, NguoiDung)
 */
const getAllSuCo = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    sc.MaSuCo, sc.MucDo, sc.MoTa, sc.TrangThai, sc.ThoiGianPhatHien, sc.ThoiGianXuLy,
                    kvc.MaKhuVucChung, kvc.Ten AS TenKhuVuc,
                    b.TenBlock,
                    nv.MaNhanVien, nd.HoTen AS TenNhanVienXuLy
                FROM dbo.SuCo sc
                JOIN dbo.KhuVucChung kvc ON sc.MaKhuVucChung = kvc.MaKhuVucChung
                JOIN dbo.Block b ON kvc.MaBlock = b.MaBlock
                LEFT JOIN dbo.NhanVien nv ON sc.MaNhanVienXuLy = nv.MaNhanVien -- LEFT JOIN vì có thể chưa ai xử lý
                LEFT JOIN dbo.NguoiDung nd ON nv.MaNguoiDung = nd.MaNguoiDung
                ORDER BY sc.ThoiGianPhatHien DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all SuCo:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/suco/:id - Lấy 1 sự cố theo ID (MaSuCo)
 */
const getSuCoById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaSuCo', mssql.Int, id)
            .query(`
                SELECT 
                    sc.MaSuCo, sc.MucDo, sc.MoTa, sc.TrangThai, sc.ThoiGianPhatHien, sc.ThoiGianXuLy,
                    kvc.MaKhuVucChung, kvc.Ten AS TenKhuVuc,
                    b.TenBlock,
                    nv.MaNhanVien, nd.HoTen AS TenNhanVienXuLy
                FROM dbo.SuCo sc
                JOIN dbo.KhuVucChung kvc ON sc.MaKhuVucChung = kvc.MaKhuVucChung
                JOIN dbo.Block b ON kvc.MaBlock = b.MaBlock
                LEFT JOIN dbo.NhanVien nv ON sc.MaNhanVienXuLy = nv.MaNhanVien
                LEFT JOIN dbo.NguoiDung nd ON nv.MaNguoiDung = nd.MaNguoiDung
                WHERE sc.MaSuCo = @MaSuCo
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy sự cố');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET SuCo by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/suco - Báo cáo sự cố mới
 * Cần: MaKhuVucChung, MucDo, MoTa
 */
const createSuCo = async (req, res) => {
    try {
        const { MaKhuVucChung, MucDo, MoTa, TrangThai } = req.body; 

        if (!MaKhuVucChung || !MucDo || !MoTa) {
            return res.status(400).send('Thiếu MaKhuVucChung, MucDo hoặc MoTa');
        }

        const trangThaiValue = TrangThai ? TrangThai : 'Mới'; // Default

        const result = await req.pool.request()
            .input('MaKhuVucChung', mssql.Int, MaKhuVucChung)
            .input('MucDo', mssql.NVarChar, MucDo)
            .input('MoTa', mssql.NVarChar, MoTa)
            .input('TrangThai', mssql.NVarChar, trangThaiValue)
            // ThoiGianPhatHien có DEFAULT GETDATE()
            .query(`INSERT INTO dbo.SuCo (MaKhuVucChung, MucDo, MoTa, TrangThai) 
                    OUTPUT Inserted.* VALUES (@MaKhuVucChung, @MucDo, @MoTa, @TrangThai)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST SuCo:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaKhuVucChung không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/suco/:id - Cập nhật sự cố
 * (Thường là để gán NV xử lý, cập nhật Trạng Thái, ThoiGianXuLy)
 */
const updateSuCo = async (req, res) => {
    try {
        const { id } = req.params; // MaSuCo
        const pool = req.pool;

        const oldDataResult = await pool.request()
            .input('MaSuCo', mssql.Int, id)
            .query('SELECT * FROM dbo.SuCo WHERE MaSuCo = @MaSuCo');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy sự cố để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu
        const { TrangThai, ThoiGianXuLy, MaNhanVienXuLy } = req.body;
        const newTrangThai = TrangThai !== undefined ? TrangThai : oldData.TrangThai;
        const newThoiGianXuLy = ThoiGianXuLy !== undefined ? ThoiGianXuLy : oldData.ThoiGianXuLy;
        const newMaNhanVienXuLy = MaNhanVienXuLy !== undefined ? MaNhanVienXuLy : oldData.MaNhanVienXuLy;

        const result = await pool.request()
            .input('MaSuCo', mssql.Int, id)
            .input('TrangThai', mssql.NVarChar, newTrangThai)
            .input('ThoiGianXuLy', mssql.DateTime, newThoiGianXuLy)
            .input('MaNhanVienXuLy', mssql.Int, newMaNhanVienXuLy)
            .query(`UPDATE dbo.SuCo 
                    SET TrangThai = @TrangThai, ThoiGianXuLy = @ThoiGianXuLy, 
                        MaNhanVienXuLy = @MaNhanVienXuLy
                    OUTPUT Inserted.* WHERE MaSuCo = @MaSuCo`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT SuCo:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaNhanVienXuLy không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/suco/:id - Xóa sự cố
 */
const deleteSuCo = async (req, res) => {
    try {
        const { id } = req.params; // MaSuCo
        const result = await req.pool.request()
            .input('MaSuCo', mssql.Int, id)
            .query('DELETE FROM dbo.SuCo OUTPUT Deleted.* WHERE MaSuCo = @MaSuCo');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy sự cố để xóa');
        }
        res.json({ message: 'Đã xóa sự cố thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE SuCo:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllSuCo,
    getSuCoById,
    createSuCo,
    updateSuCo,
    deleteSuCo
};