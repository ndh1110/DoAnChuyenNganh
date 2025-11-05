// controllers/dichVuController.js
const mssql = require('mssql');

/**
 * GET /api/dichvu - Lấy tất cả dịch vụ
 */
const getAllDichVu = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query('SELECT * FROM dbo.DichVu');
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all DichVu:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/dichvu/:id - Lấy 1 dịch vụ theo ID
 */
const getDichVuById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaDichVu', mssql.Int, id)
            .query('SELECT * FROM dbo.DichVu WHERE MaDichVu = @MaDichVu');
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy dịch vụ');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET DichVu by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/dichvu - Tạo dịch vụ mới
 * Cần: TenDichVu, KieuTinh ('FIXED' hoặc 'METERED'), DonViMacDinh
 */
const createDichVu = async (req, res) => {
    try {
        const { TenDichVu, KieuTinh, DonViMacDinh } = req.body; 

        if (!TenDichVu || !KieuTinh) {
            return res.status(400).send('Thiếu TenDichVu hoặc KieuTinh');
        }
        
        // Bảng DichVu có CHECK KieuTinh IN ('FIXED', 'METERED')
        if (KieuTinh !== 'FIXED' && KieuTinh !== 'METERED') {
            return res.status(400).send("KieuTinh phải là 'FIXED' hoặc 'METERED'");
        }

        const result = await req.pool.request()
            .input('TenDichVu', mssql.NVarChar, TenDichVu)
            .input('KieuTinh', mssql.NVarChar, KieuTinh)
            .input('DonViMacDinh', mssql.NVarChar, DonViMacDinh)
            .query(`INSERT INTO dbo.DichVu (TenDichVu, KieuTinh, DonViMacDinh) 
                    OUTPUT Inserted.* VALUES (@TenDichVu, @KieuTinh, @DonViMacDinh)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST DichVu:', err);
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/dichvu/:id - Cập nhật dịch vụ
 */
const updateDichVu = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        // 1. Lấy dữ liệu cũ
        const oldDataResult = await pool.request()
            .input('MaDichVu', mssql.Int, id)
            .query('SELECT * FROM dbo.DichVu WHERE MaDichVu = @MaDichVu');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy dịch vụ để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // 2. Trộn dữ liệu
        const { TenDichVu, KieuTinh, DonViMacDinh } = req.body;
        const newTenDichVu = TenDichVu !== undefined ? TenDichVu : oldData.TenDichVu;
        const newKieuTinh = KieuTinh !== undefined ? KieuTinh : oldData.KieuTinh;
        const newDonViMacDinh = DonViMacDinh !== undefined ? DonViMacDinh : oldData.DonViMacDinh;

        // 3. Kiểm tra logic (nếu KieuTinh được cập nhật)
        if (newKieuTinh !== 'FIXED' && newKieuTinh !== 'METERED') {
            return res.status(400).send("KieuTinh phải là 'FIXED' hoặc 'METERED'");
        }

        // 4. Thực thi UPDATE
        const result = await pool.request()
            .input('MaDichVu', mssql.Int, id)
            .input('TenDichVu', mssql.NVarChar, newTenDichVu)
            .input('KieuTinh', mssql.NVarChar, newKieuTinh)
            .input('DonViMacDinh', mssql.NVarChar, newDonViMacDinh)
            .query(`UPDATE dbo.DichVu 
                    SET TenDichVu = @TenDichVu, KieuTinh = @KieuTinh, DonViMacDinh = @DonViMacDinh
                    OUTPUT Inserted.* WHERE MaDichVu = @MaDichVu`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT DichVu:', err);
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/dichvu/:id - Xóa dịch vụ
 */
const deleteDichVu = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaDichVu', mssql.Int, id)
            .query('DELETE FROM dbo.DichVu OUTPUT Deleted.* WHERE MaDichVu = @MaDichVu');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy dịch vụ để xóa');
        }
        res.json({ message: 'Đã xóa dịch vụ thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE DichVu:', err);
        // Bắt lỗi khóa ngoại (ví dụ: BangGia, ChiSoDichVu đang dùng MaDichVu này)
        if (err.number === 547) {
            return res.status(400).send('Không thể xóa: Dịch vụ này đang được liên kết (Bảng Giá, Hóa Đơn,...).');
        }
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllDichVu,
    getDichVuById,
    createDichVu,
    updateDichVu,
    deleteDichVu
};