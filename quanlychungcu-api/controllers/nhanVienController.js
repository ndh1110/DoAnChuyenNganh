// controllers/nhanVienController.js
const mssql = require('mssql');

/**
 * GET /api/nhanvien - Lấy tất cả nhân viên
 */
const getAllNhanVien = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    nv.MaNhanVien, nv.TrangThai, nv.NgayVaoLam, nv.MaSoThue,
                    nd.MaNguoiDung, nd.HoTen, nd.Email, nd.SoDienThoai
                FROM dbo.NhanVien nv
                JOIN dbo.NguoiDung nd ON nv.MaNguoiDung = nd.MaNguoiDung
            `);
        
        // (Lưu ý: API này giờ không trả về Chức vụ. 
        //  Chức vụ giờ được quản lý ở API /api/user-roles)
        
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
                    nv.MaNhanVien, nv.TrangThai, nv.NgayVaoLam, nv.MaSoThue,
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
 * POST /api/nhanvien - Tạo (thêm) hồ sơ nhân viên
 */
const createNhanVien = async (req, res) => {
    try {
        // Chức vụ (Vai trò) giờ được gán qua API /api/user-roles
        const { MaNguoiDung, TrangThai, NgayVaoLam, MaSoThue } = req.body; 

        if (!MaNguoiDung) {
            return res.status(400).send('Thiếu MaNguoiDung');
        }
        
        const trangThaiValue = TrangThai ? TrangThai : 'Active';

        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, MaNguoiDung)
            .input('TrangThai', mssql.NVarChar, trangThaiValue)
            .input('NgayVaoLam', mssql.Date, NgayVaoLam)
            .input('MaSoThue', mssql.NVarChar, MaSoThue)
            .query(`INSERT INTO dbo.NhanVien (MaNguoiDung, TrangThai, NgayVaoLam, MaSoThue) 
                    OUTPUT Inserted.* VALUES (@MaNguoiDung, @TrangThai, @NgayVaoLam, @MaSoThue)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST NhanVien:', err);
        if (err.number === 547) return res.status(400).send('Lỗi Khóa Ngoại: MaNguoiDung không tồn tại.');
        if (err.number === 2601 || err.number === 2627) return res.status(400).send('Lỗi Unique: Người dùng này đã là nhân viên.');
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/nhanvien/:id - Cập nhật nhân viên
 */
const updateNhanVien = async (req, res) => {
    try {
        const { id } = req.params; // MaNhanVien
        const { TrangThai, NgayVaoLam, MaSoThue } = req.body;
        const pool = req.pool;

        const oldDataResult = await pool.request()
            .input('MaNhanVien', mssql.Int, id)
            .query('SELECT * FROM dbo.NhanVien WHERE MaNhanVien = @MaNhanVien');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy nhân viên để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu
        const newTrangThai = TrangThai !== undefined ? TrangThai : oldData.TrangThai;
        const newNgayVaoLam = NgayVaoLam !== undefined ? NgayVaoLam : oldData.NgayVaoLam;
        const newMaSoThue = MaSoThue !== undefined ? MaSoThue : oldData.MaSoThue;

        const result = await pool.request()
            .input('MaNhanVien', mssql.Int, id)
            .input('TrangThai', mssql.NVarChar, newTrangThai)
            .input('NgayVaoLam', mssql.Date, newNgayVaoLam)
            .input('MaSoThue', mssql.NVarChar, newMaSoThue)
            .query(`UPDATE dbo.NhanVien 
                    SET TrangThai = @TrangThai, NgayVaoLam = @NgayVaoLam, MaSoThue = @MaSoThue
                    OUTPUT Inserted.* WHERE MaNhanVien = @MaNhanVien`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT NhanVien:', err);
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/nhanvien/:id - Xóa nhân viên
 */
const deleteNhanVien = async (req, res) => {
    // ... (Hàm này giữ nguyên, vì nó xóa theo MaNhanVien)
    try {
        const { id } = req.params; // MaNhanVien
        
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