// controllers/yeuCauLogController.js
const mssql = require('mssql');

/**
 * POST /api/yeucaulog - Thêm một log vào YeuCau
 * Cần: MaYeuCau, GhiChu, NguoiXuLyId (có thể NULL)
 */
const addYeuCauLog = async (req, res) => {
    try {
        const { MaYeuCau, GhiChu, NguoiXuLyId, MaTrangThai } = req.body; 

        if (!MaYeuCau || !GhiChu) {
            return res.status(400).send('Thiếu MaYeuCau hoặc GhiChu');
        }

        const result = await req.pool.request()
            .input('MaYeuCau', mssql.Int, MaYeuCau)
            .input('GhiChu', mssql.NVarChar, GhiChu)
            .input('NguoiXuLyId', mssql.Int, NguoiXuLyId) // ID của admin/nhân viên
            .input('MaTrangThai', mssql.Int, MaTrangThai) // Trạng thái mới (ví dụ: ID của 'IN_PROGRESS')
            // ThoiGian có DEFAULT GETDATE()
            .query(`INSERT INTO dbo.YeuCauLog (MaYeuCau, GhiChu, NguoiXuLyId, MaTrangThai) 
                    OUTPUT Inserted.* VALUES (@MaYeuCau, @GhiChu, @NguoiXuLyId, @MaTrangThai)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST YeuCauLog:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaYeuCau hoặc NguoiXuLyId không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/yeucaulog/:id - Xóa một dòng log (MaLog)
 */
const deleteYeuCauLog = async (req, res) => {
    try {
        const { id } = req.params; // Đây là MaLog
        const result = await req.pool.request()
            .input('MaLog', mssql.Int, id)
            .query('DELETE FROM dbo.YeuCauLog OUTPUT Deleted.* WHERE MaLog = @MaLog');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy dòng log để xóa');
        }
        res.json({ message: 'Đã xóa log thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE YeuCauLog:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    addYeuCauLog,
    deleteYeuCauLog
    // (Chúng ta không cần GET all hoặc PUT)
};