// controllers/nguoiDungController.js
const mssql = require('mssql');

/**
 * 1. GET (Read) - Lấy tất cả người dùng
 * (SỬA: Thêm CCCD vào SELECT)
 */
const getAllNguoiDung = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`SELECT 
                        MaNguoiDung, HoTen, Email, SoDienThoai, CCCD, MatKhauHash 
                    FROM dbo.NguoiDung`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi truy vấn GET all:', err);
        res.status(500).send(err.message);
    }
};

/**
 * 2. GET (Read) - Lấy 1 người dùng theo ID
 * (SỬA: Thêm CCCD vào SELECT)
 */
const getNguoiDungById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, id)
            .query(`SELECT 
                        MaNguoiDung, HoTen, Email, SoDienThoai, CCCD, MatKhauHash 
                    FROM dbo.NguoiDung WHERE MaNguoiDung = @MaNguoiDung`);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy người dùng');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi truy vấn GET by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * 3. POST (Create) - Tạo người dùng mới
 * (SỬA: Thêm CCCD)
 */
const createNguoiDung = async (req, res) => {
    try {
        const { HoTen, Email, CCCD } = req.body;
        if (!HoTen || !Email) {
            return res.status(400).send('Thiếu Họ Tên hoặc Email');
        }

        const result = await req.pool.request()
            .input('HoTen', mssql.NVarChar, HoTen)
            .input('Email', mssql.NVarChar, Email)
            .input('CCCD', mssql.NVarChar, CCCD) // Thêm CCCD
            .query(`INSERT INTO dbo.NguoiDung (HoTen, Email, CCCD) 
                    OUTPUT Inserted.* VALUES (@HoTen, @Email, @CCCD)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi truy vấn POST:', err);
        res.status(500).send(err.message);
    }
};

/**
 * 4. PUT (Update) - Cập nhật người dùng
 * (SỬA: Thêm CCCD vào logic update)
 */
const updateNguoiDung = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Lấy dữ liệu mới từ body (Thêm CCCD)
        const { HoTen, Email, SoDienThoai, MatKhauHash, CCCD } = req.body;

        const pool = req.pool;
        const oldDataResult = await pool.request()
            .input('MaNguoiDung', mssql.Int, id)
            .query('SELECT * FROM dbo.NguoiDung WHERE MaNguoiDung = @MaNguoiDung');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy người dùng để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu
        const newHoTen = HoTen !== undefined ? HoTen : oldData.HoTen;
        const newEmail = Email !== undefined ? Email : oldData.Email;
        const newSoDienThoai = SoDienThoai !== undefined ? SoDienThoai : oldData.SoDienThoai;
        const newMatKhauHash = MatKhauHash !== undefined ? MatKhauHash : oldData.MatKhauHash;
        const newCCCD = CCCD !== undefined ? CCCD : oldData.CCCD; // Thêm CCCD
        
        const result = await pool.request()
            .input('MaNguoiDung', mssql.Int, id)
            .input('HoTen', mssql.NVarChar, newHoTen)
            .input('Email', mssql.NVarChar, newEmail)
            .input('SoDienThoai', mssql.NVarChar, newSoDienThoai)
            .input('MatKhauHash', mssql.NVarChar, newMatKhauHash)
            .input('CCCD', mssql.NVarChar, newCCCD) // Thêm CCCD
            .query(`UPDATE dbo.NguoiDung 
                    SET HoTen = @HoTen, 
                        Email = @Email, 
                        SoDienThoai = @SoDienThoai, 
                        MatKhauHash = @MatKhauHash,
                        CCCD = @CCCD
                    OUTPUT Inserted.* WHERE MaNguoiDung = @MaNguoiDung`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi truy vấn PUT:', err);
        res.status(500).send(err.message);
    }
};

/**
 * 5. DELETE (Delete) - Xóa người dùng
 */
const deleteNguoiDung = async (req, res) => {
    // ... (Giữ nguyên logic DELETE)
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, id)
            .query('DELETE FROM dbo.NguoiDung OUTPUT Deleted.* WHERE MaNguoiDung = @MaNguoiDung');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy người dùng để xóa');
        }
        res.json({ message: 'Đã xóa thành công', user: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi truy vấn DELETE:', err);
        if (err.number === 547) {
            return res.status(400).send('Không thể xóa: Người dùng này đang được liên kết bởi dữ liệu khác.');
        }
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllNguoiDung,
    getNguoiDungById,
    createNguoiDung,
    updateNguoiDung,
    deleteNguoiDung
};