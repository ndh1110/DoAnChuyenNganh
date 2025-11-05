// controllers/thongBaoController.js
const mssql = require('mssql');

/**
 * GET /api/thongbao - Lấy tất cả thông báo
 * (JOIN với người gửi)
 */
const getAllThongBao = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    tb.MaThongBao, tb.NoiDung, tb.NgayGui,
                    nd.MaNguoiDung AS MaNguoiGui, nd.HoTen AS TenNguoiGui
                FROM dbo.ThongBao tb
                JOIN dbo.NguoiDung nd ON tb.MaNguoiDung = nd.MaNguoiDung
                ORDER BY tb.NgayGui DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all ThongBao:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/thongbao - Tạo một thông báo mới
 * (Việc gửi đến người dùng sẽ do API ThongBaoNguoiDung xử lý)
 * Cần: MaNguoiDung (người gửi), NoiDung
 */
const createThongBao = async (req, res) => {
    try {
        const { MaNguoiDung, NoiDung } = req.body; 

        if (!MaNguoiDung || !NoiDung) {
            return res.status(400).send('Thiếu MaNguoiDung (người gửi) hoặc NoiDung');
        }

        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, MaNguoiDung)
            .input('NoiDung', mssql.NVarChar, NoiDung)
            // NgayGui có DEFAULT GETDATE()
            .query(`INSERT INTO dbo.ThongBao (MaNguoiDung, NoiDung) 
                    OUTPUT Inserted.* VALUES (@MaNguoiDung, @NoiDung)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST ThongBao:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaNguoiDung không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/thongbao/:id - Xóa thông báo
 * (Sẽ xóa cả các bản ghi ThongBaoNguoiDung liên quan vì có ON DELETE CASCADE)
 */
const deleteThongBao = async (req, res) => {
    try {
        const { id } = req.params; // MaThongBao
        
        // Cảnh báo: ThongBaoNguoiDung có ON DELETE CASCADE
        
        const result = await req.pool.request()
            .input('MaThongBao', mssql.Int, id)
            .query('DELETE FROM dbo.ThongBao OUTPUT Deleted.* WHERE MaThongBao = @MaThongBao');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy thông báo để xóa');
        }
        res.json({ message: 'Đã xóa thông báo (và các bản ghi gửi) thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE ThongBao:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllThongBao,
    createThongBao,
    deleteThongBao
    // (Thường không Update thông báo, chỉ POST và DELETE)
};