// controllers/dieuKhoanController.js
const mssql = require('mssql');

/**
 * GET /api/dieukhoan/hopdong/:id - Lấy tất cả điều khoản của 1 hợp đồng
 */
const getDieuKhoanByHopDongId = async (req, res) => {
    try {
        const { id } = req.params; // Đây là MaHopDong
        const result = await req.pool.request()
            .input('MaHopDong', mssql.Int, id)
            .query('SELECT * FROM dbo.DieuKhoan WHERE MaHopDong = @MaHopDong');
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET DieuKhoan by HopDong ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/dieukhoan - Thêm một điều khoản mới
 * Cần: MaHopDong, NoiDung
 */
const createDieuKhoan = async (req, res) => {
    try {
        const { MaHopDong, NoiDung } = req.body; 

        if (!MaHopDong || !NoiDung) {
            return res.status(400).send('Thiếu MaHopDong hoặc NoiDung');
        }

        const result = await req.pool.request()
            .input('MaHopDong', mssql.Int, MaHopDong)
            .input('NoiDung', mssql.NVarChar, NoiDung)
            .query(`INSERT INTO dbo.DieuKhoan (MaHopDong, NoiDung) 
                    OUTPUT Inserted.* VALUES (@MaHopDong, @NoiDung)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST DieuKhoan:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaHopDong không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/dieukhoan/:id - Cập nhật nội dung điều khoản
 * :id ở đây là MaDieuKhoan
 */
const updateDieuKhoan = async (req, res) => {
    try {
        const { id } = req.params; // MaDieuKhoan
        const { NoiDung } = req.body;

        if (!NoiDung) {
            return res.status(400).send('Thiếu NoiDung');
        }

         const result = await req.pool.request()
            .input('MaDieuKhoan', mssql.Int, id)
            .input('NoiDung', mssql.NVarChar, NoiDung)
            .query(`UPDATE dbo.DieuKhoan 
                    SET NoiDung = @NoiDung
                    OUTPUT Inserted.* WHERE MaDieuKhoan = @MaDieuKhoan`);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy điều khoản để cập nhật');
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT DieuKhoan:', err);
        res.status(500).send(err.message);
    }
};


/**
 * DELETE /api/dieukhoan/:id - Xóa một điều khoản
 * :id ở đây là MaDieuKhoan
 */
const deleteDieuKhoan = async (req, res) => {
    try {
        const { id } = req.params; // MaDieuKhoan
        const result = await req.pool.request()
            .input('MaDieuKhoan', mssql.Int, id)
            .query('DELETE FROM dbo.DieuKhoan OUTPUT Deleted.* WHERE MaDieuKhoan = @MaDieuKhoan');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy điều khoản để xóa');
        }
        res.json({ message: 'Đã xóa điều khoản thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE DieuKhoan:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getDieuKhoanByHopDongId,
    createDieuKhoan,
    updateDieuKhoan,
    deleteDieuKhoan
};