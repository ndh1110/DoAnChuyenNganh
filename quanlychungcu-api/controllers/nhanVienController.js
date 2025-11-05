// controllers/nhanVienController.js
const mssql = require('mssql');

/**
 * GET /api/nhanvien - Lấy tất cả nhân viên
 * (JOIN với NguoiDung)
 */
const getAllNhanVien = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    nv.MaNhanVien, nv.ChucVu, nv.TrangThai,
                    nd.MaNguoiDung, nd.HoTen, nd.Email, nd.SoDienThoai
                FROM dbo.NhanVien nv
                JOIN dbo.NguoiDung nd ON nv.MaNguoiDung = nd.MaNguoiDung
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all NhanVien:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/nhanvien/:id - Lấy 1 nhân viên theo ID (MaNhanVien)
 */
const getNhanVienById = async (req, res) => {
    try {
        const { id } = req.params; // MaNhanVien
        const result = await req.pool.request()
            .input('MaNhanVien', mssql.Int, id)
            .query(`
                SELECT 
                    nv.MaNhanVien, nv.ChucVu, nv.TrangThai,
                    nd.MaNguoiDung, nd.HoTen, nd.Email, nd.SoDienThoai
                FROM dbo.NhanVien nv
                JOIN dbo.NguoiDung nd ON nv.MaNguoiDung = nd.MaNguoiDung
                WHERE nv.MaNhanVien = @MaNhanVien
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy nhân viên');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET NhanVien by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/nhanvien - Tạo (thêm) nhân viên mới
 * Cần: MaNguoiDung (chỉ định người dùng nào là NV), ChucVu
 */
const createNhanVien = async (req, res) => {
    try {
        const { MaNguoiDung, ChucVu, TrangThai } = req.body; 

        if (!MaNguoiDung || !ChucVu) {
            return res.status(400).send('Thiếu MaNguoiDung hoặc ChucVu');
        }
        
        // TrangThai có DEFAULT 'Active'
        const trangThaiValue = TrangThai ? TrangThai : 'Active';

        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, MaNguoiDung)
            .input('ChucVu', mssql.NVarChar, ChucVu)
            .input('TrangThai', mssql.NVarChar, trangThaiValue)
            .query(`INSERT INTO dbo.NhanVien (MaNguoiDung, ChucVu, TrangThai) 
                    OUTPUT Inserted.* VALUES (@MaNguoiDung, @ChucVu, @TrangThai)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST NhanVien:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaNguoiDung không tồn tại.');
        }
        // Lỗi UNIQUE (Người này đã là nhân viên rồi)
        if (err.number === 2601 || err.number === 2627) {
            return res.status(400).send('Lỗi Unique: Người dùng này đã là nhân viên.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/nhanvien/:id - Cập nhật nhân viên
 * :id là MaNhanVien
 */
const updateNhanVien = async (req, res) => {
    try {
        const { id } = req.params; // MaNhanVien
        const { ChucVu, TrangThai } = req.body;
        const pool = req.pool;

        if (!ChucVu && !TrangThai) {
            return res.status(400).send('Phải cung cấp ChucVu hoặc TrangThai để cập nhật');
        }

        const oldDataResult = await pool.request()
            .input('MaNhanVien', mssql.Int, id)
            .query('SELECT * FROM dbo.NhanVien WHERE MaNhanVien = @MaNhanVien');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy nhân viên để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu
        const newChucVu = ChucVu !== undefined ? ChucVu : oldData.ChucVu;
        const newTrangThai = TrangThai !== undefined ? TrangThai : oldData.TrangThai;

        const result = await pool.request()
            .input('MaNhanVien', mssql.Int, id)
            .input('ChucVu', mssql.NVarChar, newChucVu)
            .input('TrangThai', mssql.NVarChar, newTrangThai)
            .query(`UPDATE dbo.NhanVien 
                    SET ChucVu = @ChucVu, TrangThai = @TrangThai
                    OUTPUT Inserted.* WHERE MaNhanVien = @MaNhanVien`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT NhanVien:', err);
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/nhanvien/:id - Xóa nhân viên
 * :id là MaNhanVien
 */
const deleteNhanVien = async (req, res) => {
    try {
        const { id } = req.params; // MaNhanVien
        
        // Cảnh báo: PhanCong, LichTruc có ON DELETE CASCADE [cite: 151, 153]
        // KiemTraKhuVuc, SuCo có ON DELETE SET NULL [cite: 166, 168]
        // Xóa NhanVien sẽ xóa toàn bộ Lịch Trực và Phân Công của họ.
        
        const result = await req.pool.request()
            .input('MaNhanVien', mssql.Int, id)
            .query('DELETE FROM dbo.NhanVien OUTPUT Deleted.* WHERE MaNhanVien = @MaNhanVien');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy nhân viên để xóa');
        }
        res.json({ message: 'Đã xóa nhân viên (và các lịch trực, phân công liên quan) thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE NhanVien:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllNhanVien,
    getNhanVienById,
    createNhanVien,
    updateNhanVien,
    deleteNhanVien
};