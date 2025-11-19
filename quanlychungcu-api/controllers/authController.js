// controllers/authController.js
const mssql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

//IMPORT DỊCH VỤ EMAIL MỚI
const { sendPasswordResetEmail } = require('../services/emailService');
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

const forgotPassword = async (req, res) => {
    try {
        const { Email } = req.body;
        const pool = req.pool;

        // 1. Tìm người dùng
        const userResult = await pool.request()
            .input('Email', mssql.NVarChar, Email)
            .query('SELECT MaNguoiDung, Email, HoTen FROM dbo.NguoiDung WHERE Email = @Email');

        // 2. Luôn trả về 200 (OK)
        // (Đây là biện pháp bảo mật để tránh kẻ tấn công dò email nào đã tồn tại)
        if (userResult.recordset.length === 0) {
            return res.status(200).json({ 
                message: "Nếu email này tồn tại trong hệ thống, một link reset sẽ được gửi." 
            });
        }
        
        const user = userResult.recordset[0];

        // 3. Tạo Token Reset (dùng JWT_RESET_SECRET, 15 phút)
        const tokenPayload = { id: user.MaNguoiDung, email: user.Email };
        const resetToken = jwt.sign(
            tokenPayload, 
            process.env.JWT_RESET_SECRET, // 👈 Dùng chìa khóa Reset
            { expiresIn: '15m' } // 👈 Chỉ có hiệu lực 15 phút
        );

        // =============================================
        // ⭐ LOGIC MỚI: GỬI EMAIL THẬT
        // =============================================
        try {
            await sendPasswordResetEmail(user.Email, resetToken);
            
            // 4. Trả về thông báo thành công
            res.json({
                message: "Yêu cầu thành công. Vui lòng kiểm tra email để đặt lại mật khẩu."
            });
            
        } catch (emailError) {
             // Nếu emailService.js bị lỗi (ví dụ: sai mật khẩu App, Gmail sập)
             console.error('Lỗi Backend khi gửi email:', emailError);
             res.status(500).send('Lỗi máy chủ khi gửi email. Vui lòng thử lại sau.');
        }

    } catch (err) {
        console.error('Lỗi Forgot Password:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/auth/reset-password/:token - Người dùng đặt mật khẩu mới
 * (Hàm này giữ nguyên logic, không cần sửa)
 */
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const pool = req.pool;

        if (!newPassword) {
            return res.status(400).send('Thiếu mật khẩu mới');
        }

        // 1. Xác thực Token Reset
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_RESET_SECRET); // 👈 Dùng chìa khóa Reset
        } catch (err) {
            return res.status(401).send('Token không hợp lệ hoặc đã hết hạn');
        }

        // 2. Băm mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const matKhauHash = await bcrypt.hash(newPassword, salt);

        // 3. Cập nhật mật khẩu trong DB
        await pool.request()
            .input('MaNguoiDung', mssql.Int, decoded.id)
            .input('MatKhauHash', mssql.NVarChar, matKhauHash)
            .query('UPDATE dbo.NguoiDung SET MatKhauHash = @MatKhauHash WHERE MaNguoiDung = @MaNguoiDung');

        res.status(200).send('Mật khẩu đã được cập nhật thành công');

    } catch (err) {
        console.error('Lỗi Reset Password:', err);
        res.status(500).send(err.message);
    }
};

const verifyGoogleToken = async (token) => {
    try {
        // Gọi Google API để lấy thông tin user
        const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return {
            email: res.data.email,
            name: res.data.name,
            // Google có trả về picture, nhưng DB ta chưa có cột Avatar nên tạm bỏ qua
        };
    } catch (error) {
        console.error("Lỗi verify Google:", error.response?.data || error.message);
        return null;
    }
};

// --- HÀM HỖ TRỢ: Lấy thông tin từ Facebook ---
const verifyFacebookToken = async (token) => {
    try {
        // Gọi Facebook Graph API để lấy id, name, email, picture
        const res = await axios.get(`https://graph.facebook.com/me`, {
            params: {
                fields: 'id,name,email,picture',
                access_token: token
            }
        });
        
        const { id, name, email, picture } = res.data;
        
        return {
            id: id, // Facebook ID
            name: name,
            email: email,
            picture: picture?.data?.url
        };
    } catch (error) {
        console.error("Lỗi verify Facebook:", error.response?.data || error.message);
        return null;
    }
};

/**
 * POST /api/auth/social-login
 * Body: { provider: 'google' | 'facebook', token: '...' }
 */
const socialLogin = async (req, res) => {
    try {
        const { provider, token } = req.body;

        if (!provider || !token) {
            return res.status(400).send('Thiếu provider hoặc token');
        }

        // 1. Xác thực token với bên thứ 3
        let profile = null;
        if (provider === 'google') {
            profile = await verifyGoogleToken(token);
        } else if (provider === 'facebook') {
            profile = await verifyFacebookToken(token);
        } else {
            return res.status(400).send('Provider không hỗ trợ');
        }

        if (!profile) {
            return res.status(401).send('Token không hợp lệ');
        }

        // Xử lý trường hợp Facebook không trả về email
        let userEmail = profile.email;
        if (!userEmail && provider === 'facebook') {
            // Tạo email giả lập nếu không có email (ví dụ: user đăng ký FB bằng SĐT)
            userEmail = `${profile.id}@facebook.com`;
        }

        if (!userEmail) {
             return res.status(400).send('Không thể lấy được thông tin Email từ nhà cung cấp.');
        }

        const pool = req.pool;

        // 2. Kiểm tra xem Email đã tồn tại chưa
        const userResult = await pool.request()
            .input('Email', mssql.NVarChar, userEmail)
            .query('SELECT * FROM dbo.NguoiDung WHERE Email = @Email');

        let user = null;

        if (userResult.recordset.length > 0) {
            // --- TRƯỜNG HỢP A: ĐÃ CÓ TÀI KHOẢN ---
            user = userResult.recordset[0];
        } else {
            // --- TRƯỜNG HỢP B: CHƯA CÓ -> TẠO MỚI (Tự động Role 'Khách') ---
            const transaction = new mssql.Transaction(pool);
            await transaction.begin();

            try {
                // Tạo User (Không cần mật khẩu)
                const requestUser = transaction.request();
                const insertResult = await requestUser
                    .input('HoTen', mssql.NVarChar, profile.name)
                    .input('Email', mssql.NVarChar, userEmail)
                    // SoDienThoai, MatKhauHash, CCCD để NULL
                    .query(`INSERT INTO dbo.NguoiDung (HoTen, Email) 
                            OUTPUT Inserted.MaNguoiDung, Inserted.HoTen, Inserted.Email 
                            VALUES (@HoTen, @Email)`);
                
                user = insertResult.recordset[0];

                // Gán Role 'Khách' (ID = 4)
                const requestRole = transaction.request();
                await requestRole
                    .input('MaNguoiDung', mssql.Int, user.MaNguoiDung)
                    .input('MaVaiTro', mssql.Int, 4) // 4 là Khách/Resident
                    .query(`INSERT INTO dbo.NguoiDung_VaiTro (MaNguoiDung, MaVaiTro) 
                            VALUES (@MaNguoiDung, @MaVaiTro)`);

                await transaction.commit();
            } catch (err) {
                await transaction.rollback();
                throw err; 
            }
        }

        // 3. Lấy Role để tạo JWT
        const roleResult = await pool.request()
            .input('MaNguoiDung', mssql.Int, user.MaNguoiDung)
            .query(`
                SELECT vt.TenVaiTro 
                FROM dbo.NguoiDung_VaiTro ndvt
                JOIN dbo.VaiTro vt ON ndvt.MaVaiTro = vt.MaVaiTro
                WHERE ndvt.MaNguoiDung = @MaNguoiDung
            `);
        
        const roles = roleResult.recordset.map(r => r.TenVaiTro);
        
        let primaryRole = roles.length > 0 ? roles[0] : "Khách";
        if (roles.includes('Quản lý')) primaryRole = 'Quản lý';
        else if (roles.includes('Kỹ thuật')) primaryRole = 'Kỹ thuật';
        else if (roles.includes('Resident')) primaryRole = 'Resident';

        // 4. Tạo JWT
        const tokenPayload = {
            id: user.MaNguoiDung,
            email: user.Email,
            name: user.HoTen,
            role: primaryRole,
            roles: roles
        };

        const jwtToken = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            message: "Đăng nhập Social thành công",
            token: jwtToken,
            user: tokenPayload
        });

    } catch (err) {
        console.error('Lỗi Social Login:', err);
        res.status(500).send(err.message);
    }
};


module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    socialLogin
};