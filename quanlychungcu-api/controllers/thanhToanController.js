// controllers/thanhToanController.js
const mssql = require('mssql');

/**
 * GET /api/thanhtoan/hoadon/:id - Lấy tất cả thanh toán của 1 hóa đơn
 */
const getThanhToanByHoaDonId = async (req, res) => {
    try {
        const { id } = req.params; // Đây là MaHoaDon
        const result = await req.pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .query(`
                SELECT 
                    tt.MaThanhToan, tt.NgayThanhToan, tt.ThanhTien,
                    hd.MaHoaDon, hd.KyThang
                FROM dbo.ThanhToan tt
                JOIN dbo.HoaDon hd ON tt.MaHoaDon = hd.MaHoaDon
                WHERE tt.MaHoaDon = @MaHoaDon
                ORDER BY tt.NgayThanhToan DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET ThanhToan by HoaDon ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/thanhtoan/:id - Lấy 1 thanh toán theo ID (MaThanhToan)
 */
const getThanhToanById = async (req, res) => {
    try {
        const { id } = req.params; // Đây là MaThanhToan
        const result = await req.pool.request()
            .input('MaThanhToan', mssql.Int, id)
            .query('SELECT * FROM dbo.ThanhToan WHERE MaThanhToan = @MaThanhToan');
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi thanh toán');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET ThanhToan by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/thanhtoan - Ghi nhận một thanh toán mới
 * Cần: MaHoaDon, NgayThanhToan, ThanhTien
 */
const createThanhToan = async (req, res) => {
    try {
        const { MaHoaDon, NgayThanhToan, ThanhTien } = req.body; 

        if (!MaHoaDon || !NgayThanhToan || ThanhTien === undefined) {
            return res.status(400).send('Thiếu MaHoaDon, NgayThanhToan hoặc ThanhTien');
        }
        if (ThanhTien <= 0) {
            return res.status(400).send('ThanhTien phải lớn hơn 0');
        }

        const result = await req.pool.request()
            .input('MaHoaDon', mssql.Int, MaHoaDon)
            .input('NgayThanhToan', mssql.Date, NgayThanhToan)
            .input('ThanhTien', mssql.Decimal(18, 2), ThanhTien)
            .query(`INSERT INTO dbo.ThanhToan (MaHoaDon, NgayThanhToan, ThanhTien) 
                    OUTPUT Inserted.* VALUES (@MaHoaDon, @NgayThanhToan, @ThanhTien)`);
        
        // Lưu ý: Việc này không cập nhật TongTien của HoaDon.
        // TongTien là tổng nợ, còn ThanhToan là số tiền đã trả.
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST ThanhToan:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaHoaDon không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/thanhtoan/:id - Xóa/Hủy một thanh toán
 * (Sẽ xóa cả GiaoDichThanhToan liên quan vì có FK)
 */
const deleteThanhToan = async (req, res) => {
    try {
        const { id } = req.params; // Đây là MaThanhToan
        
        // Cảnh báo: GiaoDichThanhToan có thể tham chiếu đến ThanhToan.
        // Chúng ta cần xóa GiaoDichThanhToan trước, hoặc đảm bảo FK có ON DELETE CASCADE
        // File "Cập nhật và sửa.txt" KHÔNG CÓ "ON DELETE CASCADE" cho GiaoDichThanhToan [cite: 167]
        // Vì vậy, chúng ta phải xóa thủ công GiaoDichThanhToan trước.

        const pool = req.pool;
        // 1. Xóa GiaoDichThanhToan con
        await pool.request()
            .input('MaThanhToan', mssql.Int, id)
            .query('DELETE FROM dbo.GiaoDichThanhToan WHERE MaThanhToan = @MaThanhToan');
            
        // 2. Xóa ThanhToan cha
        const result = await pool.request()
            .input('MaThanhToan', mssql.Int, id)
            .query('DELETE FROM dbo.ThanhToan OUTPUT Deleted.* WHERE MaThanhToan = @MaThanhToan');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy thanh toán để xóa');
        }
        res.json({ message: 'Đã xóa thanh toán (và giao dịch con) thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE ThanhToan:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getThanhToanByHoaDonId,
    getThanhToanById,
    createThanhToan,
    deleteThanhToan
};