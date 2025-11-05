// controllers/lichTrucController.js
const mssql = require('mssql');

/**
 * GET /api/lichtruc - Lấy tất cả lịch trực
 * (JOIN với Nhân Viên và Người Dùng)
 */
const getAllLichTruc = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    lt.MaLichTruc, lt.Ngay, lt.Ca, lt.GhiChu,
                    nv.MaNhanVien,
                    nd.HoTen
                FROM dbo.LichTruc lt
                JOIN dbo.NhanVien nv ON lt.MaNhanVien = nv.MaNhanVien
                JOIN dbo.NguoiDung nd ON nv.MaNguoiDung = nd.MaNguoiDung
                ORDER BY lt.Ngay DESC, lt.Ca
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all LichTruc:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/lichtruc/nhanvien/:id - Lấy lịch trực của 1 nhân viên (MaNhanVien)
 */
const getLichTrucByNhanVienId = async (req, res) => {
    try {
        const { id } = req.params; // MaNhanVien
        const result = await req.pool.request()
            .input('MaNhanVien', mssql.Int, id)
            .query(`
                SELECT 
                    lt.MaLichTruc, lt.Ngay, lt.Ca, lt.GhiChu,
                    nv.MaNhanVien,
                    nd.HoTen
                FROM dbo.LichTruc lt
                JOIN dbo.NhanVien nv ON lt.MaNhanVien = nv.MaNhanVien
                JOIN dbo.NguoiDung nd ON nv.MaNguoiDung = nd.MaNguoiDung
                WHERE lt.MaNhanVien = @MaNhanVien
                ORDER BY lt.Ngay DESC, lt.Ca
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET LichTruc by NhanVien ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/lichtruc - Tạo lịch trực mới
 * Cần: MaNhanVien, Ngay, Ca
 */
const createLichTruc = async (req, res) => {
    try {
        const { MaNhanVien, Ngay, Ca, GhiChu } = req.body; 

        if (!MaNhanVien || !Ngay || !Ca) {
            return res.status(400).send('Thiếu MaNhanVien, Ngay hoặc Ca');
        }

        const result = await req.pool.request()
            .input('MaNhanVien', mssql.Int, MaNhanVien)
            .input('Ngay', mssql.Date, Ngay)
            .input('Ca', mssql.NVarChar, Ca)
            .input('GhiChu', mssql.NVarChar, GhiChu)
            .query(`INSERT INTO dbo.LichTruc (MaNhanVien, Ngay, Ca, GhiChu) 
                    OUTPUT Inserted.* VALUES (@MaNhanVien, @Ngay, @Ca, @GhiChu)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST LichTruc:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaNhanVien không tồn tại.');
        }
        // Lỗi Unique (UQ_LichTruc_Unique)
        if (err.number === 2601 || err.number === 2627) {
            return res.status(400).send('Lỗi Unique: Nhân viên này đã có lịch trực vào Ngày/Ca này.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/lichtruc/:id - Cập nhật lịch trực (MaLichTruc)
 */
const updateLichTruc = async (req, res) => {
    try {
        const { id } = req.params; // MaLichTruc
        const pool = req.pool;

        const oldDataResult = await pool.request()
            .input('MaLichTruc', mssql.Int, id)
            .query('SELECT * FROM dbo.LichTruc WHERE MaLichTruc = @MaLichTruc');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy lịch trực để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu
        const { MaNhanVien, Ngay, Ca, GhiChu } = req.body;
        const newMaNhanVien = MaNhanVien !== undefined ? MaNhanVien : oldData.MaNhanVien;
        const newNgay = Ngay !== undefined ? Ngay : oldData.Ngay;
        const newCa = Ca !== undefined ? Ca : oldData.Ca;
        const newGhiChu = GhiChu !== undefined ? GhiChu : oldData.GhiChu;

        const result = await pool.request()
            .input('MaLichTruc', mssql.Int, id)
            .input('MaNhanVien', mssql.Int, newMaNhanVien)
            .input('Ngay', mssql.Date, newNgay)
            .input('Ca', mssql.NVarChar, newCa)
            .input('GhiChu', mssql.NVarChar, newGhiChu)
            .query(`UPDATE dbo.LichTruc 
                    SET MaNhanVien = @MaNhanVien, Ngay = @Ngay, Ca = @Ca, GhiChu = @GhiChu
                    OUTPUT Inserted.* WHERE MaLichTruc = @MaLichTruc`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT LichTruc:', err);
        if (err.number === 547) return res.status(400).send('Lỗi Khóa Ngoại: MaNhanVien không tồn tại.');
        if (err.number === 2601 || err.number === 2627) return res.status(400).send('Lỗi Unique: Nhân viên này đã có lịch trực vào Ngày/Ca này.');
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/lichtruc/:id - Xóa lịch trực
 */
const deleteLichTruc = async (req, res) => {
    try {
        const { id } = req.params; // MaLichTruc
        const result = await req.pool.request()
            .input('MaLichTruc', mssql.Int, id)
            .query('DELETE FROM dbo.LichTruc OUTPUT Deleted.* WHERE MaLichTruc = @MaLichTruc');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy lịch trực để xóa');
        }
        res.json({ message: 'Đã xóa lịch trực thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE LichTruc:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllLichTruc,
    getLichTrucByNhanVienId,
    createLichTruc,
    updateLichTruc,
    deleteLichTruc
};