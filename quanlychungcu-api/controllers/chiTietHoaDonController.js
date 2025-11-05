// controllers/chiTietHoaDonController.js
const mssql = require('mssql');

/**
 * Hàm nội bộ: Cập nhật TongTien trong bảng HoaDon sau khi thêm/xóa/sửa ChiTiet
 */
const updateTongTienHoaDon = async (pool, maHoaDon) => {
    try {
        // Tính tổng tất cả ThanhTien của các ChiTiet thuộc MaHoaDon này
        // Nếu không có chi tiết nào (SUM trả về NULL), COALESCE sẽ đổi nó thành 0
        await pool.request()
            .input('MaHoaDon', mssql.Int, maHoaDon)
            .query(`
                UPDATE dbo.HoaDon
                SET TongTien = (
                    SELECT COALESCE(SUM(ThanhTien), 0) 
                    FROM dbo.ChiTietHoaDon 
                    WHERE MaHoaDon = @MaHoaDon
                )
                WHERE MaHoaDon = @MaHoaDon
            `);
    } catch (err) {
        console.error('Lỗi khi update TongTien:', err);
        // Ném lỗi ra ngoài để hàm gọi chính (addChiTiet/deleteChiTiet) biết và rollback
        throw err; 
    }
};

/**
 * POST /api/hoadon/:id/chitiet - Thêm chi tiết vào hóa đơn
 * Cần: MaDichVu, ThanhTien, MaChiSo (có thể NULL)
 */
const addChiTietHoaDon = async (req, res) => {
    const maHoaDon = req.params.id;
    const { MaDichVu, ThanhTien, MaChiSo } = req.body;
    const pool = req.pool;

    if (!MaDichVu || ThanhTien === undefined) {
        return res.status(400).send('Thiếu MaDichVu hoặc ThanhTien');
    }

    try {
        // 1. Thêm dòng ChiTietHoaDon
        const result = await pool.request()
            .input('MaHoaDon', mssql.Int, maHoaDon)
            .input('MaDichVu', mssql.Int, MaDichVu)
            .input('ThanhTien', mssql.Decimal(18, 2), ThanhTien)
            .input('MaChiSo', mssql.Int, MaChiSo) // Có thể NULL
            .query(`
                INSERT INTO dbo.ChiTietHoaDon (MaHoaDon, MaDichVu, ThanhTien, MaChiSo)
                OUTPUT Inserted.* VALUES (@MaHoaDon, @MaDichVu, @ThanhTien, @MaChiSo)
            `);
        
        const newChiTiet = result.recordset[0];

        // 2. Cập nhật lại TongTien ở bảng HoaDon
        await updateTongTienHoaDon(pool, maHoaDon);

        // 3. Trả về chi tiết vừa tạo
        res.status(201).json(newChiTiet);

    } catch (err) {
        console.error('Lỗi POST ChiTietHoaDon:', err);
        if (err.number === 547) {
            // Lỗi FK (MaHoaDon, MaDichVu, hoặc MaChiSo không tồn tại)
            return res.status(400).send('Lỗi Khóa Ngoại: MaHoaDon, MaDichVu hoặc MaChiSo không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/chitiet-hoadon/:maCT - Xóa một dòng chi tiết hóa đơn
 */
const deleteChiTietHoaDon = async (req, res) => {
    const { maCT } = req.params; // maCT là MaCT (Primary Key của ChiTietHoaDon)
    const pool = req.pool;

    try {
        // 1. Xóa dòng chi tiết và lấy về MaHoaDon của nó
        const result = await pool.request()
            .input('MaCT', mssql.Int, maCT)
            .query('DELETE FROM dbo.ChiTietHoaDon OUTPUT Deleted.* WHERE MaCT = @MaCT');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy dòng chi tiết hóa đơn để xóa');
        }

        const deletedChiTiet = result.recordset[0];
        const maHoaDon = deletedChiTiet.MaHoaDon;

        // 2. Cập nhật lại TongTien ở bảng HoaDon
        await updateTongTienHoaDon(pool, maHoaDon);

        res.json({ message: 'Đã xóa dòng chi tiết thành công', data: deletedChiTiet });

    } catch (err) {
        console.error('Lỗi DELETE ChiTietHoaDon:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    addChiTietHoaDon,
    deleteChiTietHoaDon
};