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

        // =============================================
        // ⭐ LOGIC MỚI: SỬ DỤNG TRANSACTION
        // =============================================
        const transaction = new mssql.Transaction(pool);
        await transaction.begin();

        try {
            // 3. Tạo người dùng mới
            const requestNguoiDung = transaction.request(); // Phải dùng request của transaction
            const result = await requestNguoiDung
                .input('HoTen', mssql.NVarChar, HoTen)
                .input('Email', mssql.NVarChar, Email)
                .input('SoDienThoai', mssql.NVarChar, SoDienThoai)
                .input('MatKhauHash', mssql.NVarChar, matKhauHash)
                .query(`INSERT INTO dbo.NguoiDung (HoTen, Email, SoDienThoai, MatKhauHash) 
                        OUTPUT Inserted.MaNguoiDung, Inserted.HoTen, Inserted.Email 
                        VALUES (@HoTen, @Email, @SoDienThoai, @MatKhauHash)`);
            
            const newUser = result.recordset[0];
            const newUserId = newUser.MaNguoiDung;

            // 4. Tự động gán vai trò "Khách" (MaVaiTro = 4)
            const requestVaiTro = transaction.request(); // Request mới cho transaction
            const maVaiTroKhach = 4; // ID 'Khách' (Guest/Resident) từ DB

            await requestVaiTro
                .input('MaNguoiDung', mssql.Int, newUserId)
                .input('MaVaiTro', mssql.Int, maVaiTroKhach)
                .query(`INSERT INTO dbo.NguoiDung_VaiTro (MaNguoiDung, MaVaiTro) 
                        VALUES (@MaNguoiDung, @MaVaiTro)`);

            // 5. Hoàn tất transaction
            await transaction.commit();
            
            res.status(201).json(newUser);

        } catch (err) {
            await transaction.rollback(); // Rollback nếu có lỗi
            console.error('Lỗi khi đăng ký (Transaction):', err);
            // Lỗi 547 (FK) hoặc 2627 (Unique)
            if (err.number === 547 || err.number === 2627) {
                 return res.status(400).send('Lỗi ràng buộc CSDL khi tạo tài khoản hoặc gán vai trò.');
            }
            res.status(500).send(err.message);
        }

    } catch (err) {
        console.error('Lỗi Register (ngoài transaction):', err);
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
        // ⭐ LOGIC MỚI: LẤY VAI TRÒ (ROLE) TỪ BẢNG MỚI
        // =============================================
        // Lấy tất cả vai trò của người dùng
        const rolesResult = await pool.request()
            .input('MaNguoiDung', mssql.Int, user.MaNguoiDung)
            .query(`
                SELECT vt.TenVaiTro 
                FROM dbo.NguoiDung_VaiTro ndvt
                JOIN dbo.VaiTro vt ON ndvt.MaVaiTro = vt.MaVaiTro
                WHERE ndvt.MaNguoiDung = @MaNguoiDung
            `);

        // Lấy danh sách tên vai trò, ví dụ: ["Quản lý", "Resident"]
        const roles = rolesResult.recordset.map(r => r.TenVaiTro);
        
        // (Chúng ta sẽ dùng vai trò đầu tiên làm vai trò chính, hoặc bạn có thể chọn logic phức tạp hơn)
        // Nếu không có vai trò nào (ví dụ: lỗi đăng ký cũ), mặc định là "Khách"
        let primaryRole = roles.length > 0 ? roles[0] : "Khách";
        
        // (Logic ưu tiên: Nếu có 'Quản lý' hoặc 'Kỹ thuật', ưu tiên nó hơn 'Resident')
        if (roles.includes('Quản lý')) primaryRole = 'Quản lý';
        else if (roles.includes('Kỹ thuật')) primaryRole = 'Kỹ thuật';
        else if (roles.includes('Resident')) primaryRole = 'Resident';

        // 3. Tạo và trả về JWT
        const tokenPayload = {
            id: user.MaNguoiDung,
            email: user.Email,
            name: user.HoTen,
            role: primaryRole, // 👈 Gán vai trò chính
            roles: roles // 👈 Gửi tất cả vai trò (nếu cần)
        };
        
        const token = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            message: "Đăng nhập thành công",
            token: token,
            user: tokenPayload 
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