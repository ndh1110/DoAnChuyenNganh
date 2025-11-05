// controllers/kiemTraKhuVucController.js
const mssql = require('mssql');

/**
 * GET /api/kiemtra - Lấy tất cả nhật ký kiểm tra
 * (JOIN KhuVucChung, Block, NhanVien, NguoiDung)
 */
const getAllKiemTra = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    kt.MaKiemTraKVC, kt.ThoiGian, kt.DanhGia, kt.GhiChu,
                    kvc.MaKhuVucChung, kvc.Ten AS TenKhuVuc,
                    b.TenBlock,
                    nv.MaNhanVien, nd.HoTen AS TenNhanVien
                FROM dbo.KiemTraKhuVuc kt
                JOIN dbo.KhuVucChung kvc ON kt.MaKhuVucChung = kvc.MaKhuVucChung
                JOIN dbo.Block b ON kvc.MaBlock = b.MaBlock
                LEFT JOIN dbo.NhanVien nv ON kt.MaNhanVien = nv.MaNhanVien -- LEFT JOIN vì MaNhanVien có thể SET NULL
                LEFT JOIN dbo.NguoiDung nd ON nv.MaNguoiDung = nd.MaNguoiDung
                ORDER BY kt.ThoiGian DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all KiemTraKhuVuc:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/kiemtra/khuvuc/:id - Lấy các lần kiểm tra của 1 khu vực (MaKhuVucChung)
 */
const getKiemTraByKhuVucId = async (req, res) => {
    try {
        const { id } = req.params; // MaKhuVucChung
        const result = await req.pool.request()
            .input('MaKhuVucChung', mssql.Int, id)
            .query(`
                SELECT 
                    kt.MaKiemTraKVC, kt.ThoiGian, kt.DanhGia, kt.GhiChu,
                    nv.MaNhanVien, nd.HoTen AS TenNhanVien
                FROM dbo.KiemTraKhuVuc kt
                LEFT JOIN dbo.NhanVien nv ON kt.MaNhanVien = nv.MaNhanVien
                LEFT JOIN dbo.NguoiDung nd ON nv.MaNguoiDung = nd.MaNguoiDung
                WHERE kt.MaKhuVucChung = @MaKhuVucChung
                ORDER BY kt.ThoiGian DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET KiemTra by KhuVuc ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/kiemtra - Ghi nhận một lần kiểm tra mới
 * Cần: MaKhuVucChung, MaNhanVien, DanhGia
 */
const createKiemTra = async (req, res) => {
    try {
        const { MaKhuVucChung, MaNhanVien, DanhGia, GhiChu } = req.body; 

        if (!MaKhuVucChung || !MaNhanVien || !DanhGia) {
            return res.status(400).send('Thiếu MaKhuVucChung, MaNhanVien hoặc DanhGia');
        }

        const result = await req.pool.request()
            .input('MaKhuVucChung', mssql.Int, MaKhuVucChung)
            .input('MaNhanVien', mssql.Int, MaNhanVien)
            .input('DanhGia', mssql.NVarChar, DanhGia)
            .input('GhiChu', mssql.NVarChar, GhiChu)
            // ThoiGian có DEFAULT GETDATE()
            .query(`INSERT INTO dbo.KiemTraKhuVuc (MaKhuVucChung, MaNhanVien, DanhGia, GhiChu) 
                    OUTPUT Inserted.* VALUES (@MaKhuVucChung, @MaNhanVien, @DanhGia, @GhiChu)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST KiemTraKhuVuc:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaKhuVucChung hoặc MaNhanVien không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/kiemtra/:id - Xóa nhật ký kiểm tra
 */
const deleteKiemTra = async (req, res) => {
    try {
        const { id } = req.params; // MaKiemTraKVC
        const result = await req.pool.request()
            .input('MaKiemTraKVC', mssql.Int, id)
            .query('DELETE FROM dbo.KiemTraKhuVuc OUTPUT Deleted.* WHERE MaKiemTraKVC = @MaKiemTraKVC');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy nhật ký kiểm tra để xóa');
        }
        res.json({ message: 'Đã xóa nhật ký kiểm tra thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE KiemTraKhuVuc:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllKiemTra,
    getKiemTraByKhuVucId,
    createKiemTra,
    deleteKiemTra
    // (Không cần PUT, nếu sai thì Xóa và POST lại)
};