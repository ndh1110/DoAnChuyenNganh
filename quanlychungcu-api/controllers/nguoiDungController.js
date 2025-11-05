// controllers/nguoiDungController.js
const mssql = require('mssql');

/**
 * 1. GET (Read) - Lấy tất cả người dùng
 */
const getAllNguoiDung = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query('SELECT * FROM dbo.NguoiDung');
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi truy vấn GET all:', err);
        res.status(500).send(err.message);
    }
};

/**
 * 2. GET (Read) - Lấy 1 người dùng theo ID
 */
const getNguoiDungById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, id)
            .query('SELECT * FROM dbo.NguoiDung WHERE MaNguoiDung = @MaNguoiDung');
        
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
 */
const createNguoiDung = async (req, res) => {
    try {
        const { HoTen, Email } = req.body;
        if (!HoTen || !Email) {
            return res.status(400).send('Thiếu Họ Tên hoặc Email');
        }

        const result = await req.pool.request()
            .input('HoTen', mssql.NVarChar, HoTen)
            .input('Email', mssql.NVarChar, Email)
            .query('INSERT INTO dbo.NguoiDung (HoTen, Email) OUTPUT Inserted.* VALUES (@HoTen, @Email)');
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi truy vấn POST:', err);
        res.status(500).send(err.message);
    }
};

/**
 * 4. PUT (Update) - Cập nhật người dùng
 */
const updateNguoiDung = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Lấy dữ liệu mới từ body
        const { HoTen, Email, SoDienThoai, MatKhauHash } = req.body;

        // 1. Lấy dữ liệu cũ từ CSDL
        const pool = req.pool;
        const oldDataResult = await pool.request()
            .input('MaNguoiDung', mssql.Int, id)
            .query('SELECT * FROM dbo.NguoiDung WHERE MaNguoiDung = @MaNguoiDung');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy người dùng để cập nhật');
        }

        const oldData = oldDataResult.recordset[0];

        // 2. Trộn dữ liệu: Dùng dữ liệu MỚI nếu có, nếu không thì giữ dữ liệu CŨ
        //    (Kiểm tra `undefined` để cho phép gửi giá trị `null` nếu muốn)
        const newHoTen = HoTen !== undefined ? HoTen : oldData.HoTen;
        const newEmail = Email !== undefined ? Email : oldData.Email;
        const newSoDienThoai = SoDienThoai !== undefined ? SoDienThoai : oldData.SoDienThoai;
        const newMatKhauHash = MatKhauHash !== undefined ? MatKhauHash : oldData.MatKhauHash;
        
        // 3. Thực thi UPDATE với dữ liệu đã trộn
        const result = await pool.request()
            .input('MaNguoiDung', mssql.Int, id)
            .input('HoTen', mssql.NVarChar, newHoTen)
            .input('Email', mssql.NVarChar, newEmail)
            .input('SoDienThoai', mssql.NVarChar, newSoDienThoai) // Thêm SĐT
            .input('MatKhauHash', mssql.NVarChar, newMatKhauHash) // Thêm Hash
            .query(`UPDATE dbo.NguoiDung 
                    SET HoTen = @HoTen, 
                        Email = @Email, 
                        SoDienThoai = @SoDienThoai, 
                        MatKhauHash = @MatKhauHash
                    OUTPUT Inserted.* WHERE MaNguoiDung = @MaNguoiDung`);
        
        // 4. Trả về kết quả đã cập nhật
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

// Xuất tất cả các hàm controller
module.exports = {
    getAllNguoiDung,
    getNguoiDungById,
    createNguoiDung,
    updateNguoiDung,
    deleteNguoiDung
};