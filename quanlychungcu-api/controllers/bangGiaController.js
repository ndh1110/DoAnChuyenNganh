// controllers/bangGiaController.js
const mssql = require('mssql');

/**
 * GET /api/banggia - Lấy tất cả bảng giá (JOIN với DichVu)
 */
const getAllBangGia = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    bg.MaBangGia, bg.HieuLucTu, bg.HieuLucDen, bg.DonGiaBien,
                    dv.MaDichVu, dv.TenDichVu, dv.KieuTinh, dv.DonViMacDinh
                FROM dbo.BangGia bg
                JOIN dbo.DichVu dv ON bg.MaDichVu = dv.MaDichVu
                ORDER BY dv.TenDichVu, bg.HieuLucTu DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all BangGia:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/banggia/:id - Lấy 1 bảng giá theo ID (JOIN)
 */
const getBangGiaById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaBangGia', mssql.Int, id)
            .query(`
                SELECT 
                    bg.MaBangGia, bg.HieuLucTu, bg.HieuLucDen, bg.DonGiaBien,
                    dv.MaDichVu, dv.TenDichVu, dv.KieuTinh, dv.DonViMacDinh
                FROM dbo.BangGia bg
                JOIN dbo.DichVu dv ON bg.MaDichVu = dv.MaDichVu
                WHERE bg.MaBangGia = @MaBangGia
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bảng giá');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET BangGia by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/banggia - Tạo bảng giá mới
 * Cần: MaDichVu, HieuLucTu, DonGiaBien. (HieuLucDen có thể NULL)
 */
const createBangGia = async (req, res) => {
    try {
        const { MaDichVu, HieuLucTu, HieuLucDen, DonGiaBien } = req.body; 

        if (!MaDichVu || !HieuLucTu || DonGiaBien === undefined) {
            return res.status(400).send('Thiếu MaDichVu, HieuLucTu hoặc DonGiaBien');
        }

        const result = await req.pool.request()
            .input('MaDichVu', mssql.Int, MaDichVu)
            .input('HieuLucTu', mssql.Date, HieuLucTu)
            .input('HieuLucDen', mssql.Date, HieuLucDen) // Có thể NULL
            .input('DonGiaBien', mssql.Decimal(18, 2), DonGiaBien)
            .query(`INSERT INTO dbo.BangGia (MaDichVu, HieuLucTu, HieuLucDen, DonGiaBien) 
                    OUTPUT Inserted.* VALUES (@MaDichVu, @HieuLucTu, @HieuLucDen, @DonGiaBien)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST BangGia:', err);
        // Lỗi khóa ngoại (MaDichVu không tồn tại)
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaDichVu không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/banggia/:id - Cập nhật bảng giá
 */
const updateBangGia = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        // 1. Lấy dữ liệu cũ
        const oldDataResult = await pool.request()
            .input('MaBangGia', mssql.Int, id)
            .query('SELECT * FROM dbo.BangGia WHERE MaBangGia = @MaBangGia');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bảng giá để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // 2. Trộn dữ liệu
        const { MaDichVu, HieuLucTu, HieuLucDen, DonGiaBien } = req.body;
        const newMaDichVu = MaDichVu !== undefined ? MaDichVu : oldData.MaDichVu;
        const newHieuLucTu = HieuLucTu !== undefined ? HieuLucTu : oldData.HieuLucTu;
        const newHieuLucDen = HieuLucDen !== undefined ? HieuLucDen : oldData.HieuLucDen;
        const newDonGiaBien = DonGiaBien !== undefined ? DonGiaBien : oldData.DonGiaBien;

        // 3. Thực thi UPDATE
        const result = await pool.request()
            .input('MaBangGia', mssql.Int, id)
            .input('MaDichVu', mssql.Int, newMaDichVu)
            .input('HieuLucTu', mssql.Date, newHieuLucTu)
            .input('HieuLucDen', mssql.Date, newHieuLucDen)
            .input('DonGiaBien', mssql.Decimal(18, 2), newDonGiaBien)
            .query(`UPDATE dbo.BangGia 
                    SET MaDichVu = @MaDichVu, HieuLucTu = @HieuLucTu, 
                        HieuLucDen = @HieuLucDen, DonGiaBien = @DonGiaBien
                    OUTPUT Inserted.* WHERE MaBangGia = @MaBangGia`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT BangGia:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaDichVu không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/banggia/:id - Xóa bảng giá
 */
const deleteBangGia = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaBangGia', mssql.Int, id)
            .query('DELETE FROM dbo.BangGia OUTPUT Deleted.* WHERE MaBangGia = @MaBangGia');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bảng giá để xóa');
        }
        res.json({ message: 'Đã xóa bảng giá thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE BangGia:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllBangGia,
    getBangGiaById,
    createBangGia,
    updateBangGia,
    deleteBangGia
};