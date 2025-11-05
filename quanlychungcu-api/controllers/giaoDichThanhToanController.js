// controllers/giaoDichThanhToanController.js
const mssql = require('mssql');

/**
 * GET /api/giaodich/thanhtoan/:id - Lấy các giao dịch của 1 thanh toán
 */
const getGiaoDichByThanhToanId = async (req, res) => {
    try {
        const { id } = req.params; // Đây là MaThanhToan
        const result = await req.pool.request()
            .input('MaThanhToan', mssql.Int, id)
            .query('SELECT * FROM dbo.GiaoDichThanhToan WHERE MaThanhToan = @MaThanhToan');
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET GiaoDich by ThanhToan ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/giaodich - Tạo một giao dịch cho một thanh toán
 * Cần: MaThanhToan, MaGiaoDich, Cong, Kenh, TrangThai
 */
const createGiaoDichThanhToan = async (req, res) => {
    try {
        const { MaThanhToan, MaGiaoDich, Cong, Kenh, TrangThai } = req.body; 

        if (!MaThanhToan || !MaGiaoDich || !TrangThai) {
            return res.status(400).send('Thiếu MaThanhToan, MaGiaoDich hoặc TrangThai');
        }

        const result = await req.pool.request()
            .input('MaThanhToan', mssql.Int, MaThanhToan)
            .input('MaGiaoDich', mssql.NVarChar, MaGiaoDich)
            .input('Cong', mssql.NVarChar, Cong)
            .input('Kenh', mssql.NVarChar, Kenh)
            .input('TrangThai', mssql.NVarChar, TrangThai)
            .query(`INSERT INTO dbo.GiaoDichThanhToan (MaThanhToan, MaGiaoDich, Cong, Kenh, TrangThai) 
                    OUTPUT Inserted.* VALUES (@MaThanhToan, @MaGiaoDich, @Cong, @Kenh, @TrangThai)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST GiaoDichThanhToan:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaThanhToan không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

module.exports = {
    getGiaoDichByThanhToanId,
    createGiaoDichThanhToan
    // (Thường không ai Update/Delete GiaoDichThanhToan, chỉ GET và POST)
};