// controllers/lichHenController.js
const mssql = require('mssql');

/**
 * POST /api/lichhen - Tạo lịch hẹn mới
 * Cần: MaYeuCau, ThoiGian, MaNguoiDung (người hẹn, có thể là KH hoặc NV), TrangThai
 */
const createLichHen = async (req, res) => {
    try {
        // MaNguoiDung là người liên quan đến lịch hẹn (ví dụ: KH xác nhận, hoặc NV đặt)
        const { MaYeuCau, ThoiGian, MaNguoiDung, TrangThai } = req.body; 

        if (!MaYeuCau || !ThoiGian || !TrangThai) {
            return res.status(400).send('Thiếu MaYeuCau, ThoiGian hoặc TrangThai');
        }

        const result = await req.pool.request()
            .input('MaYeuCau', mssql.Int, MaYeuCau)
            .input('ThoiGian', mssql.DateTime, ThoiGian)
            .input('MaNguoiDung', mssql.Int, MaNguoiDung) // Có thể NULL
            .input('TrangThai', mssql.NVarChar, TrangThai) // Ví dụ: 'SCHEDULED'
            .query(`INSERT INTO dbo.LichHen (MaYeuCau, ThoiGian, MaNguoiDung, TrangThai) 
                    OUTPUT Inserted.* VALUES (@MaYeuCau, @ThoiGian, @MaNguoiDung, @TrangThai)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST LichHen:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaYeuCau hoặc MaNguoiDung không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/lichhen/:id - Xóa (hủy) lịch hẹn (MaLichHen)
 */
const deleteLichHen = async (req, res) => {
    try {
        const { id } = req.params; // Đây là MaLichHen
        const result = await req.pool.request()
            .input('MaLichHen', mssql.Int, id)
            .query('DELETE FROM dbo.LichHen OUTPUT Deleted.* WHERE MaLichHen = @MaLichHen');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy lịch hẹn để xóa');
        }
        res.json({ message: 'Đã xóa (hủy) lịch hẹn thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE LichHen:', err);
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/lichhen/:id - Cập nhật trạng thái lịch hẹn
 * (Ví dụ: Chuyển từ 'SCHEDULED' -> 'DONE' hoặc 'CANCELED')
 */
const updateLichHenStatus = async (req, res) => {
    try {
        const { id } = req.params; // MaLichHen
        const { TrangThai } = req.body;

        if (!TrangThai) {
            return res.status(400).send('Thiếu TrangThai');
        }

         const result = await req.pool.request()
            .input('MaLichHen', mssql.Int, id)
            .input('TrangThai', mssql.NVarChar, TrangThai)
            .query(`UPDATE dbo.LichHen 
                    SET TrangThai = @TrangThai
                    OUTPUT Inserted.* WHERE MaLichHen = @MaLichHen`);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy lịch hẹn để cập nhật');
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT LichHen:', err);
        res.status(500).send(err.message);
    }
};


module.exports = {
    createLichHen,
    deleteLichHen,
    updateLichHenStatus
    // (Chúng ta không cần GET all vì LichHen được lấy chung với YeuCau)
};