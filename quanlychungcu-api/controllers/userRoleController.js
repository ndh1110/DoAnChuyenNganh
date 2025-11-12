// controllers/userRoleController.js
const mssql = require('mssql');

/**
 * GET /api/user-roles - Lấy tất cả người dùng và vai trò của họ
 */
const getAllUsersWithRoles = async (req, res) => {
    try {
        // 1. Lấy tất cả người dùng
        const userResult = await req.pool.request()
            .query('SELECT MaNguoiDung, HoTen, Email, SoDienThoai FROM dbo.NguoiDung');
        
        // 2. Lấy tất cả liên kết vai trò
        const rolesResult = await req.pool.request()
            .query(`
                SELECT vt.MaVaiTro, vt.TenVaiTro, ndvt.MaNguoiDung
                FROM dbo.NguoiDung_VaiTro ndvt
                JOIN dbo.VaiTro vt ON ndvt.MaVaiTro = vt.MaVaiTro
            `);

        // 3. Tạo một Map để tra cứu vai trò
        const roleMap = new Map();
        for (const role of rolesResult.recordset) {
            if (!roleMap.has(role.MaNguoiDung)) {
                roleMap.set(role.MaNguoiDung, []);
            }
            roleMap.get(role.MaNguoiDung).push({ MaVaiTro: role.MaVaiTro, TenVaiTro: role.TenVaiTro });
        }

        // 4. Gắn vai trò vào người dùng
        const usersWithRoles = userResult.recordset.map(user => {
            return {
                ...user,
                Roles: roleMap.get(user.MaNguoiDung) || [] // Mặc định là mảng rỗng
            };
        });

        res.json(usersWithRoles);

    } catch (err) {
        console.error('Lỗi GET all UsersWithRoles:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/user-roles/:id/sync - Đồng bộ (Cập nhật) vai trò cho 1 user
 */
const syncUserRoles = async (req, res) => {
    try {
        const { id } = req.params; // MaNguoiDung
        const { roleIds } = req.body; // Mảng các MaVaiTro [1, 4]

        if (!Array.isArray(roleIds)) {
            return res.status(400).send('Dữ liệu vai trò (roleIds) phải là một mảng.');
        }

        const pool = req.pool;
        const transaction = new mssql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Xóa tất cả vai trò cũ của người dùng này
            const deleteRequest = transaction.request();
            await deleteRequest
                .input('MaNguoiDung', mssql.Int, id)
                .query('DELETE FROM dbo.NguoiDung_VaiTro WHERE MaNguoiDung = @MaNguoiDung');

            // 2. Thêm các vai trò mới
            if (roleIds.length > 0) {
                // Xây dựng câu lệnh INSERT động
                let values = [];
                for (const roleId of roleIds) {
                    // (Thêm kiểm tra bảo mật đơn giản)
                    if (Number.isInteger(parseInt(roleId))) {
                        values.push(`(${parseInt(id)}, ${parseInt(roleId)})`);
                    }
                }
                
                if (values.length > 0) {
                    const insertQuery = `
                        INSERT INTO dbo.NguoiDung_VaiTro (MaNguoiDung, MaVaiTro) 
                        VALUES ${values.join(', ')}
                    `;
                    const insertRequest = transaction.request();
                    await insertRequest.query(insertQuery);
                }
            }

            // 3. Commit
            await transaction.commit();
            res.status(200).send('Cập nhật vai trò thành công');

        } catch (err) {
            await transaction.rollback();
            console.error('Lỗi khi đồng bộ vai trò (Transaction):', err);
            res.status(500).send(err.message);
        }

    } catch (err) {
        console.error('Lỗi Sync Roles (ngoài transaction):', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllUsersWithRoles,
    syncUserRoles
};