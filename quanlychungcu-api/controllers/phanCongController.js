// controllers/phanCongController.js
const mssql = require('mssql');

/**
 * GET /api/phancong - Lấy tất cả phân công
 * (JOIN NhanVien, NguoiDung, KhuVucChung, Block)
 */
const getAllPhanCong = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    pc.MaPhanCong, pc.Ngay, pc.Ca, pc.NoiDung, pc.TrangThai,
                    nv.MaNhanVien, nd.HoTen,
                    kvc.MaKhuVucChung, kvc.Ten AS TenKhuVuc,
                    b.TenBlock
                FROM dbo.PhanCong pc
                JOIN dbo.NhanVien nv ON pc.MaNhanVien = nv.MaNhanVien
                JOIN dbo.NguoiDung nd ON nv.MaNguoiDung = nd.MaNguoiDung
                JOIN dbo.KhuVucChung kvc ON pc.MaKhuVucChung = kvc.MaKhuVucChung
                JOIN dbo.Block b ON kvc.MaBlock = b.MaBlock
                ORDER BY pc.Ngay DESC, pc.Ca
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all PhanCong:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/phancong/nhanvien/:id - Lấy phân công của 1 nhân viên (MaNhanVien)
 */
const getPhanCongByNhanVienId = async (req, res) => {
    try {
        const { id } = req.params; // MaNhanVien
        const result = await req.pool.request()
            .input('MaNhanVien', mssql.Int, id)
            .query(`
                SELECT 
                    pc.MaPhanCong, pc.Ngay, pc.Ca, pc.NoiDung, pc.TrangThai,
                    kvc.MaKhuVucChung, kvc.Ten AS TenKhuVuc,
                    b.TenBlock
                FROM dbo.PhanCong pc
                JOIN dbo.KhuVucChung kvc ON pc.MaKhuVucChung = kvc.MaKhuVucChung
                JOIN dbo.Block b ON kvc.MaBlock = b.MaBlock
                WHERE pc.MaNhanVien = @MaNhanVien
                ORDER BY pc.Ngay DESC, pc.Ca
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET PhanCong by NhanVien ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/phancong - Tạo phân công mới
 * Cần: MaNhanVien, MaKhuVucChung, Ngay, Ca, NoiDung
 */
const createPhanCong = async (req, res) => {
    try {
        const { MaNhanVien, MaKhuVucChung, Ngay, Ca, NoiDung, TrangThai } = req.body; 

        if (!MaNhanVien || !MaKhuVucChung || !Ngay || !Ca) {
            return res.status(400).send('Thiếu MaNhanVien, MaKhuVucChung, Ngay hoặc Ca');
        }

        const trangThaiValue = TrangThai ? TrangThai : 'Đang phân công'; // Default

        const result = await req.pool.request()
            .input('MaNhanVien', mssql.Int, MaNhanVien)
            .input('MaKhuVucChung', mssql.Int, MaKhuVucChung)
            .input('Ngay', mssql.Date, Ngay)
            .input('Ca', mssql.NVarChar, Ca)
            .input('NoiDung', mssql.NVarChar, NoiDung)
            .input('TrangThai', mssql.NVarChar, trangThaiValue)
            .query(`INSERT INTO dbo.PhanCong (MaNhanVien, MaKhuVucChung, Ngay, Ca, NoiDung, TrangThai) 
                    OUTPUT Inserted.* VALUES (@MaNhanVien, @MaKhuVucChung, @Ngay, @Ca, @NoiDung, @TrangThai)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST PhanCong:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaNhanVien hoặc MaKhuVucChung không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/phancong/:id - Cập nhật phân công (MaPhanCong)
 * (Thường là cập nhật NoiDung hoặc TrangThai)
 */
const updatePhanCong = async (req, res) => {
    try {
        const { id } = req.params; // MaPhanCong
        const pool = req.pool;

        const oldDataResult = await pool.request()
            .input('MaPhanCong', mssql.Int, id)
            .query('SELECT * FROM dbo.PhanCong WHERE MaPhanCong = @MaPhanCong');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy phân công để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu
        const { NoiDung, TrangThai } = req.body;
        const newNoiDung = NoiDung !== undefined ? NoiDung : oldData.NoiDung;
        const newTrangThai = TrangThai !== undefined ? TrangThai : oldData.TrangThai;

        const result = await pool.request()
            .input('MaPhanCong', mssql.Int, id)
            .input('NoiDung', mssql.NVarChar, newNoiDung)
            .input('TrangThai', mssql.NVarChar, newTrangThai)
            .query(`UPDATE dbo.PhanCong 
                    SET NoiDung = @NoiDung, TrangThai = @TrangThai
                    OUTPUT Inserted.* WHERE MaPhanCong = @MaPhanCong`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT PhanCong:', err);
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/phancong/:id - Xóa phân công
 */
const deletePhanCong = async (req, res) => {
    try {
        const { id } = req.params; // MaPhanCong
        const result = await req.pool.request()
            .input('MaPhanCong', mssql.Int, id)
            .query('DELETE FROM dbo.PhanCong OUTPUT Deleted.* WHERE MaPhanCong = @MaPhanCong');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy phân công để xóa');
        }
        res.json({ message: 'Đã xóa phân công thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE PhanCong:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllPhanCong,
    getPhanCongByNhanVienId,
    createPhanCong,
    updatePhanCong,
    deletePhanCong
};