// controllers/yeuCauController.js
const mssql = require('mssql');

/**
 * GET /api/yeucau - Lấy tất cả yêu cầu
 * (JOIN với Người Dùng và Căn Hộ)
 */
const getAllYeuCau = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    yc.MaYeuCau, yc.Loai, yc.NgayTao, yc.TrangThaiThanhChung, yc.SoTienThaiHoi,
                    nd.MaNguoiDung, nd.HoTen AS TenNguoiGui,
                    ch.MaCanHo, ch.SoCanHo
                FROM dbo.YeuCau yc
                JOIN dbo.NguoiDung nd ON yc.MaNguoiDung = nd.MaNguoiDung
                LEFT JOIN dbo.CanHo ch ON yc.MaCanHo = ch.MaCanHo -- Dùng LEFT JOIN vì MaCanHo có thể NULL
                ORDER BY yc.NgayTao DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all YeuCau:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/yeucau/:id - Lấy 1 yêu cầu theo ID
 * (Sẽ bao gồm cả Log và Lịch Hẹn liên quan)
 */
const getYeuCauById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        // 1. Lấy thông tin Yêu Cầu chính
        const yeuCauResult = await pool.request()
            .input('MaYeuCau', mssql.Int, id)
            .query(`
                SELECT 
                    yc.MaYeuCau, yc.Loai, yc.NgayTao, yc.TrangThaiThanhChung, yc.SoTienThaiHoi,
                    nd.MaNguoiDung, nd.HoTen AS TenNguoiGui,
                    ch.MaCanHo, ch.SoCanHo
                FROM dbo.YeuCau yc
                JOIN dbo.NguoiDung nd ON yc.MaNguoiDung = nd.MaNguoiDung
                LEFT JOIN dbo.CanHo ch ON yc.MaCanHo = ch.MaCanHo
                WHERE yc.MaYeuCau = @MaYeuCau
            `);
        
        if (yeuCauResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy yêu cầu');
        }
        const yeuCau = yeuCauResult.recordset[0];

        // 2. Lấy YeuCauLog (Nhật ký xử lý)
        const logResult = await pool.request()
            .input('MaYeuCau', mssql.Int, id)
            .query(`
                SELECT ycl.*, nd.HoTen AS TenNguoiXuLy 
                FROM dbo.YeuCauLog ycl
                LEFT JOIN dbo.NguoiDung nd ON ycl.NguoiXuLyId = nd.MaNguoiDung -- (NguoiXuLyId từ file patch)
                WHERE ycl.MaYeuCau = @MaYeuCau
                ORDER BY ycl.ThoiGian DESC
            `);
        yeuCau.Logs = logResult.recordset;
        
        // 3. Lấy LichHen (Lịch hẹn)
        const lichHenResult = await pool.request()
            .input('MaYeuCau', mssql.Int, id)
            .query(`
                SELECT lh.*, nd.HoTen AS TenNguoiHen
                FROM dbo.LichHen lh
                LEFT JOIN dbo.NguoiDung nd ON lh.MaNguoiDung = nd.MaNguoiDung
                WHERE lh.MaYeuCau = @MaYeuCau
                ORDER BY lh.ThoiGian DESC
            `);
        yeuCau.LichHen = lichHenResult.recordset;

        res.json(yeuCau);

    } catch (err) {
        console.error('Lỗi GET YeuCau by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/yeucau - Tạo yêu cầu mới
 * Cần: MaNguoiDung, Loai, TrangThaiThanhChung. (MaCanHo có thể NULL)
 */
const createYeuCau = async (req, res) => {
    try {
        // MaCanHo, SoTienThaiHoi có thể NULL
        const { MaNguoiDung, MaCanHo, Loai, SoTienThaiHoi, TrangThaiThanhChung } = req.body; 

        if (!MaNguoiDung || !Loai || !TrangThaiThanhChung) {
            return res.status(400).send('Thiếu MaNguoiDung, Loai hoặc TrangThaiThanhChung');
        }

        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, MaNguoiDung)
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('Loai', mssql.NVarChar, Loai)
            .input('SoTienThaiHoi', mssql.Decimal(18, 2), SoTienThaiHoi)
            .input('TrangThaiThanhChung', mssql.NVarChar, TrangThaiThanhChung)
            // NgayTao có DEFAULT GETDATE()
            .query(`INSERT INTO dbo.YeuCau (MaNguoiDung, MaCanHo, Loai, SoTienThaiHoi, TrangThaiThanhChung) 
                    OUTPUT Inserted.* VALUES (@MaNguoiDung, @MaCanHo, @Loai, @SoTienThaiHoi, @TrangThaiThanhChung)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST YeuCau:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaNguoiDung hoặc MaCanHo không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/yeucau/:id - Cập nhật yêu cầu
 * (Thường là chỉ cập nhật Trạng Thái)
 */
const updateYeuCau = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;
        
        // Chỉ cho phép cập nhật một số trường, ví dụ: Trạng Thái
        const { TrangThaiThanhChung } = req.body;
        if (!TrangThaiThanhChung) {
             return res.status(400).send('Chỉ hỗ trợ cập nhật TrangThaiThanhChung');
        }

        const result = await pool.request()
            .input('MaYeuCau', mssql.Int, id)
            .input('TrangThaiThanhChung', mssql.NVarChar, TrangThaiThanhChung)
            .query(`UPDATE dbo.YeuCau 
                    SET TrangThaiThanhChung = @TrangThaiThanhChung
                    OUTPUT Inserted.* WHERE MaYeuCau = @MaYeuCau`);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy yêu cầu để cập nhật');
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT YeuCau:', err);
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/yeucau/:id - Xóa yêu cầu
 * (Sẽ xóa cả YeuCauLog và LichHen liên quan vì có ON DELETE CASCADE)
 */
const deleteYeuCau = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cảnh báo: YeuCauLog và LichHen đều có ON DELETE CASCADE (theo file patch)
        
        const result = await req.pool.request()
            .input('MaYeuCau', mssql.Int, id)
            .query('DELETE FROM dbo.YeuCau OUTPUT Deleted.* WHERE MaYeuCau = @MaYeuCau');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy yêu cầu để xóa');
        }
        res.json({ message: 'Đã xóa yêu cầu (và các log, lịch hẹn liên quan) thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE YeuCau:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllYeuCau,
    getYeuCauById,
    createYeuCau,
    updateYeuCau,
    deleteYeuCau
};