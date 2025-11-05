// controllers/lichSuCuTruController.js
const mssql = require('mssql');

/**
 * GET /api/lichsucutru - Lấy tất cả lịch sử cư trú
 * (JOIN với Người Dùng, Căn Hộ, Tầng, Block)
 */
const getAllLichSuCuTru = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    ls.MaLichSu, ls.TuNgay, ls.DenNgay, ls.VaiTroCuTru,
                    nd.MaNguoiDung, nd.HoTen,
                    ch.MaCanHo, ch.SoCanHo,
                    t.SoTang,
                    b.TenBlock
                FROM dbo.LichSuCuTru ls
                JOIN dbo.NguoiDung nd ON ls.MaNguoiDung = nd.MaNguoiDung
                JOIN dbo.CanHo ch ON ls.MaCanHo = ch.MaCanHo
                JOIN dbo.Tang t ON ch.MaTang = t.MaTang
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                ORDER BY ls.TuNgay DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all LichSuCuTru:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/lichsucutru/:id - Lấy 1 lịch sử theo ID (MaLichSu)
 */
const getLichSuCuTruById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaLichSu', mssql.Int, id)
            .query(`
                SELECT 
                    ls.MaLichSu, ls.TuNgay, ls.DenNgay, ls.VaiTroCuTru,
                    nd.MaNguoiDung, nd.HoTen,
                    ch.MaCanHo, ch.SoCanHo
                FROM dbo.LichSuCuTru ls
                JOIN dbo.NguoiDung nd ON ls.MaNguoiDung = nd.MaNguoiDung
                JOIN dbo.CanHo ch ON ls.MaCanHo = ch.MaCanHo
                WHERE ls.MaLichSu = @MaLichSu
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi lịch sử cư trú');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET LichSuCuTru by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/lichsucutru - Thêm bản ghi lịch sử cư trú mới
 * Cần: MaNguoiDung, MaCanHo, TuNgay, VaiTroCuTru (DenNgay có thể NULL)
 */
const createLichSuCuTru = async (req, res) => {
    try {
        const { MaNguoiDung, MaCanHo, TuNgay, DenNgay, VaiTroCuTru } = req.body; 

        if (!MaNguoiDung || !MaCanHo || !TuNgay) {
            return res.status(400).send('Thiếu MaNguoiDung, MaCanHo hoặc TuNgay');
        }

        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, MaNguoiDung)
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('TuNgay', mssql.Date, TuNgay)
            .input('DenNgay', mssql.Date, DenNgay) // Có thể NULL (nghĩa là đang ở)
            .input('VaiTroCuTru', mssql.NVarChar, VaiTroCuTru)
            .query(`INSERT INTO dbo.LichSuCuTru (MaNguoiDung, MaCanHo, TuNgay, DenNgay, VaiTroCuTru) 
                    OUTPUT Inserted.* VALUES (@MaNguoiDung, @MaCanHo, @TuNgay, @DenNgay, @VaiTroCuTru)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST LichSuCuTru:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaNguoiDung hoặc MaCanHo không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/lichsucutru/:id - Cập nhật lịch sử cư trú
 * (Thường là để cập nhật DenNgay khi chuyển đi, hoặc sửa VaiTroCuTru)
 */
const updateLichSuCuTru = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        const oldDataResult = await pool.request()
            .input('MaLichSu', mssql.Int, id)
            .query('SELECT * FROM dbo.LichSuCuTru WHERE MaLichSu = @MaLichSu');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi lịch sử để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu
        const { MaNguoiDung, MaCanHo, TuNgay, DenNgay, VaiTroCuTru } = req.body;
        const newMaNguoiDung = MaNguoiDung !== undefined ? MaNguoiDung : oldData.MaNguoiDung;
        const newMaCanHo = MaCanHo !== undefined ? MaCanHo : oldData.MaCanHo;
        const newTuNgay = TuNgay !== undefined ? TuNgay : oldData.TuNgay;
        const newDenNgay = DenNgay !== undefined ? DenNgay : oldData.DenNgay;
        const newVaiTroCuTru = VaiTroCuTru !== undefined ? VaiTroCuTru : oldData.VaiTroCuTru;

        const result = await pool.request()
            .input('MaLichSu', mssql.Int, id)
            .input('MaNguoiDung', mssql.Int, newMaNguoiDung)
            .input('MaCanHo', mssql.Int, newMaCanHo)
            .input('TuNgay', mssql.Date, newTuNgay)
            .input('DenNgay', mssql.Date, newDenNgay)
            .input('VaiTroCuTru', mssql.NVarChar, newVaiTroCuTru)
            .query(`UPDATE dbo.LichSuCuTru 
                    SET MaNguoiDung = @MaNguoiDung, MaCanHo = @MaCanHo, TuNgay = @TuNgay,
                        DenNgay = @DenNgay, VaiTroCuTru = @VaiTroCuTru
                    OUTPUT Inserted.* WHERE MaLichSu = @MaLichSu`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT LichSuCuTru:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaNguoiDung hoặc MaCanHo không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/lichsucutru/:id - Xóa bản ghi lịch sử
 */
const deleteLichSuCuTru = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaLichSu', mssql.Int, id)
            .query('DELETE FROM dbo.LichSuCuTru OUTPUT Deleted.* WHERE MaLichSu = @MaLichSu');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi lịch sử để xóa');
        }
        res.json({ message: 'Đã xóa bản ghi lịch sử cư trú thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE LichSuCuTru:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllLichSuCuTru,
    getLichSuCuTruById,
    createLichSuCuTru,
    updateLichSuCuTru,
    deleteLichSuCuTru
};