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
                    tb.MaThongBao, tb.NoiDung, tb.NgayGui, tb.MaTemplate, -- 👈 Quan trọng: Lấy MaTemplate
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
 * POST /api/thongbao - Tạo thông báo (Hỗ trợ loại tin tức)
 */
const createThongBao = async (req, res) => {
    try {
        // Cho phép gửi MaTemplate (ví dụ: 'NEWS') từ body
        const { MaNguoiDung, NoiDung, MaTemplate } = req.body; 

        if (!MaNguoiDung || !NoiDung) {
            return res.status(400).send('Thiếu MaNguoiDung hoặc NoiDung');
        }

        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, MaNguoiDung)
            .input('NoiDung', mssql.NVarChar, NoiDung)
            .input('MaTemplate', mssql.NVarChar, MaTemplate || null) // 👈 Thêm
            .query(`INSERT INTO dbo.ThongBao (MaNguoiDung, NoiDung, MaTemplate) 
                    OUTPUT Inserted.* VALUES (@MaNguoiDung, @NoiDung, @MaTemplate)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST ThongBao:', err);
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