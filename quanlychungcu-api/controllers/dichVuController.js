// controllers/dichVuController.js
const mssql = require('mssql');

// ==========================================
// PHẦN 1: QUẢN LÝ DỊCH VỤ (DichVu)
// ==========================================

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
 * GET /api/dichvu/:id
 */
const getDichVuById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaDichVu', mssql.Int, id)
            .query('SELECT * FROM dbo.DichVu WHERE MaDichVu = @MaDichVu');
        
        if (result.recordset.length === 0) return res.status(404).send('Không tìm thấy dịch vụ');
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET DichVu by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/dichvu
 */
const createDichVu = async (req, res) => {
    try {
        const { TenDichVu, KieuTinh, DonViMacDinh } = req.body; 

        if (!TenDichVu || !KieuTinh) return res.status(400).send('Thiếu TenDichVu hoặc KieuTinh');
        if (KieuTinh !== 'FIXED' && KieuTinh !== 'METERED') return res.status(400).send("KieuTinh phải là 'FIXED' hoặc 'METERED'");

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
 * PUT /api/dichvu/:id
 * (Đã Fix: Nhận diện linh hoạt tên biến Đơn Vị Tính)
 */
const updateDichVu = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        // 1. Hứng dữ liệu linh hoạt từ Frontend
        const { TenDichVu, KieuTinh, DonViMacDinh, DonViTinh, donViTinh } = req.body;
        
        // Ưu tiên: DonViMacDinh > DonViTinh > donViTinh
        const inputDonVi = DonViMacDinh || DonViTinh || donViTinh;

        // 2. Lấy dữ liệu cũ
        const oldDataResult = await pool.request()
            .input('MaDichVu', mssql.Int, id)
            .query('SELECT * FROM dbo.DichVu WHERE MaDichVu = @MaDichVu');

        if (oldDataResult.recordset.length === 0) return res.status(404).send('Không tìm thấy dịch vụ');
        const oldData = oldDataResult.recordset[0];

        // 3. Trộn dữ liệu
        const finalTenDichVu = TenDichVu !== undefined ? TenDichVu : oldData.TenDichVu;
        const finalKieuTinh = KieuTinh !== undefined ? KieuTinh : oldData.KieuTinh;
        const finalDonVi = inputDonVi !== undefined ? inputDonVi : oldData.DonViMacDinh;

        if (finalKieuTinh !== 'FIXED' && finalKieuTinh !== 'METERED') return res.status(400).send("KieuTinh lỗi");

        const result = await pool.request()
            .input('MaDichVu', mssql.Int, id)
            .input('TenDichVu', mssql.NVarChar, finalTenDichVu)
            .input('KieuTinh', mssql.NVarChar, finalKieuTinh)
            .input('DonViMacDinh', mssql.NVarChar, finalDonVi)
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
 * DELETE /api/dichvu/:id
 */
const deleteDichVu = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaDichVu', mssql.Int, id)
            .query('DELETE FROM dbo.DichVu OUTPUT Deleted.* WHERE MaDichVu = @MaDichVu');

        if (result.recordset.length === 0) return res.status(404).send('Không tìm thấy');
        res.json({ message: 'Đã xóa dịch vụ', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE DichVu:', err);
        if (err.number === 547) return res.status(400).send('Dịch vụ này đang được sử dụng, không thể xóa.');
        res.status(500).send(err.message);
    }
};


// ==========================================
// PHẦN 2: QUẢN LÝ BẢNG GIÁ (BangGia) - MỚI BỔ SUNG
// ==========================================

/**
 * GET /api/banggia - Lấy danh sách bảng giá (Kèm tên dịch vụ)
 */
const getAllPrices = async (req, res) => {
    try {
        const result = await req.pool.request().query(`
            SELECT bg.*, dv.TenDichVu 
            FROM dbo.BangGia bg
            JOIN dbo.DichVu dv ON bg.MaDichVu = dv.MaDichVu
            ORDER BY bg.HieuLucTu DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET BangGia:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/banggia - Tạo giá mới
 */
const createPrice = async (req, res) => {
    try {
        const { MaDichVu, DonGia, HieuLucTu, HieuLucDen } = req.body;
        
        // Fix lỗi DonGia = 0: Ép kiểu số
        const finalPrice = isNaN(parseFloat(DonGia)) ? 0 : parseFloat(DonGia);

        const result = await req.pool.request()
            .input('MaDichVu', mssql.Int, MaDichVu)
            .input('DonGia', mssql.Decimal(18, 0), finalPrice)
            .input('HieuLucTu', mssql.Date, HieuLucTu)
            .input('HieuLucDen', mssql.Date, HieuLucDen)
            .query(`
                INSERT INTO dbo.BangGia (MaDichVu, DonGia, HieuLucTu, HieuLucDen)
                OUTPUT Inserted.* VALUES (@MaDichVu, @DonGia, @HieuLucTu, @HieuLucDen)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST BangGia:', err);
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/banggia/:id - Cập nhật giá
 * (FIX LỖI QUAN TRỌNG: DonGia bị về 0)
 */
const updatePrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { MaDichVu, DonGia, HieuLucTu, HieuLucDen } = req.body;

        // Fix logic: Frontend gửi "DonGia" nhưng code cũ có thể bắt nhầm tên
        const finalPrice = isNaN(parseFloat(DonGia)) ? 0 : parseFloat(DonGia);

        const result = await req.pool.request()
            .input('MaBangGia', mssql.Int, id)
            .input('MaDichVu', mssql.Int, MaDichVu)
            .input('DonGia', mssql.Decimal(18, 0), finalPrice) // Map đúng biến DonGia
            .input('HieuLucTu', mssql.Date, HieuLucTu)
            .input('HieuLucDen', mssql.Date, HieuLucDen)
            .query(`
                UPDATE dbo.BangGia 
                SET MaDichVu = @MaDichVu, DonGia = @DonGia, HieuLucTu = @HieuLucTu, HieuLucDen = @HieuLucDen
                OUTPUT Inserted.* WHERE MaBangGia = @MaBangGia
            `);
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT BangGia:', err);
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/banggia/:id
 */
const deletePrice = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaBangGia', mssql.Int, id)
            .query('DELETE FROM dbo.BangGia OUTPUT Deleted.* WHERE MaBangGia = @MaBangGia');
        if (result.recordset.length === 0) return res.status(404).send('Không tìm thấy');
        res.json({ message: 'Đã xóa giá', data: result.recordset[0] });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// ĐỪNG QUÊN EXPORT TẤT CẢ CÁC HÀM
module.exports = {
    // Dịch vụ
    getAllDichVu,
    getDichVuById,
    createDichVu,
    updateDichVu,
    deleteDichVu,
    
    // Bảng Giá (Mới thêm)
    getAllPrices,
    createPrice,
    updatePrice,
    deletePrice
};