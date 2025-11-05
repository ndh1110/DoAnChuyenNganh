// controllers/thongBaoNguoiDungController.js
const mssql = require('mssql');

/**
 * GET /api/thongbaonguoidung/user/:id - Lấy tất cả thông báo của 1 người dùng
 * (JOIN với nội dung thông báo gốc)
 */
const getThongBaoByUserId = async (req, res) => {
    try {
        const { id } = req.params; // Đây là MaNguoiDung
        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, id)
            .query(`
                SELECT 
                    tbnd.MaTB_ND, tbnd.DaDoc, tbnd.ThoiGianGui,
                    tb.MaThongBao, tb.NoiDung,
                    nguoiGui.HoTen AS TenNguoiGui
                FROM dbo.ThongBaoNguoiDung tbnd
                JOIN dbo.ThongBao tb ON tbnd.MaThongBao = tb.MaThongBao
                JOIN dbo.NguoiDung nguoiGui ON tb.MaNguoiDung = nguoiGui.MaNguoiDung
                WHERE tbnd.MaNguoiDung = @MaNguoiDung
                ORDER BY tbnd.ThoiGianGui DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET ThongBao by User ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/thongbaonguoidung/send - Gửi 1 thông báo đến 1 người dùng
 * Cần: MaThongBao, MaNguoiDung
 */
const sendThongBaoToUser = async (req, res) => {
    try {
        const { MaThongBao, MaNguoiDung } = req.body; 

        if (!MaThongBao || !MaNguoiDung) {
            return res.status(400).send('Thiếu MaThongBao hoặc MaNguoiDung');
        }

        const result = await req.pool.request()
            .input('MaThongBao', mssql.Int, MaThongBao)
            .input('MaNguoiDung', mssql.Int, MaNguoiDung)
            // ThoiGianGui và DaDoc có DEFAULT
            .query(`INSERT INTO dbo.ThongBaoNguoiDung (MaThongBao, MaNguoiDung) 
                    OUTPUT Inserted.* VALUES (@MaThongBao, @MaNguoiDung)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST ThongBaoNguoiDung:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaThongBao hoặc MaNguoiDung không tồn tại.');
        }
        // Lỗi UNIQUE (gửi trùng)
        if (err.number === 2601 || err.number === 2627) {
            return res.status(400).send('Lỗi Unique: Thông báo này đã được gửi cho người dùng này rồi.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/thongbaonguoidung/read/:id - Đánh dấu đã đọc
 * :id ở đây là MaTB_ND (ID của bảng ThongBaoNguoiDung)
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params; // Đây là MaTB_ND

        const result = await req.pool.request()
            .input('MaTB_ND', mssql.Int, id)
            .query(`UPDATE dbo.ThongBaoNguoiDung 
                    SET DaDoc = 1
                    OUTPUT Inserted.* WHERE MaTB_ND = @MaTB_ND`);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi thông báo để đánh dấu đã đọc');
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT MarkAsRead:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getThongBaoByUserId,
    sendThongBaoToUser,
    markAsRead
};