// controllers/authController.js
const mssql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/register - Tạo tài khoản NguoiDung mới
 */
const registerUser = async (req, res) => {
    try {
        const { HoTen, Email, SoDienThoai, Password } = req.body;

        if (!HoTen || !Email || !Password) {
            return res.status(400).send('Thiếu Họ Tên, Email hoặc Mật khẩu');
        }

        const pool = req.pool;
        
        // 1. Kiểm tra xem Email đã tồn tại chưa
        const userExists = await pool.request()
            .input('Email', mssql.NVarChar, Email)
            .query('SELECT MaNguoiDung FROM dbo.NguoiDung WHERE Email = @Email');

        if (userExists.recordset.length > 0) {
            return res.status(400).send('Email đã tồn tại');
        }

        // 2. Băm mật khẩu
        const salt = await bcrypt.genSalt(10);
        const matKhauHash = await bcrypt.hash(Password, salt);

        // 3. Tạo người dùng mới
        const result = await pool.request()
            .input('HoTen', mssql.NVarChar, HoTen)
            .input('Email', mssql.NVarChar, Email)
            .input('SoDienThoai', mssql.NVarChar, SoDienThoai)
            .input('MatKhauHash', mssql.NVarChar, matKhauHash) // 👈 Lưu mật khẩu đã băm
            .query(`INSERT INTO dbo.NguoiDung (HoTen, Email, SoDienThoai, MatKhauHash) 
                    OUTPUT Inserted.MaNguoiDung, Inserted.HoTen, Inserted.Email 
                    VALUES (@HoTen, @Email, @SoDienThoai, @MatKhauHash)`);
        
        res.status(201).json(result.recordset[0]);

    } catch (err) {
        console.error('Lỗi Register:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/auth/login - Đăng nhập
 */
const loginUser = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const pool = req.pool;

        // 1. Tìm người dùng
        const userResult = await pool.request()
            .input('Email', mssql.NVarChar, Email)
            .query('SELECT * FROM dbo.NguoiDung WHERE Email = @Email');

        if (userResult.recordset.length === 0) {
            return res.status(401).send('Email hoặc Mật khẩu không đúng');
        }
        
        const user = userResult.recordset[0];

        // 2. So sánh mật khẩu
        const isMatch = await bcrypt.compare(Password, user.MatKhauHash);

        if (!isMatch) {
            return res.status(401).send('Email hoặc Mật khẩu không đúng');
        }

        // =============================================
        // ⭐ LOGIC MỚI: LẤY VAI TRÒ (ROLE)
        // =============================================
        let userRole = "Resident"; // Mặc định là Cư dân

        const roleResult = await pool.request()
            .input('MaNguoiDung', mssql.Int, user.MaNguoiDung)
            .query('SELECT ChucVu FROM dbo.NhanVien WHERE MaNguoiDung = @MaNguoiDung'); // [cite: 35]

        if (roleResult.recordset.length > 0) {
            userRole = roleResult.recordset[0].ChucVu; // Ví dụ: "Kỹ thuật", "Quản lý"
        }
        // (Nếu bạn muốn có "Admin", bạn cần thêm 1 người dùng với ChucVu = 'Admin')

        // 3. Tạo và trả về JWT (Đã thêm 'role' vào payload)
        const tokenPayload = {
            id: user.MaNguoiDung,
            email: user.Email,
            name: user.HoTen,
            role: userRole // 👈 ĐÃ THÊM VAI TRÒ VÀO TOKEN
        };
        
        const token = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            message: "Đăng nhập thành công",
            token: token,
            user: tokenPayload // Gửi kèm thông tin user để Frontend sử dụng
        });

    } catch (err) {
        console.error('Lỗi Login:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    registerUser,
    loginUser
};