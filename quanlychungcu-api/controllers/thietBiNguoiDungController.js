// controllers/thietBiNguoiDungController.js
const mssql = require('mssql');

/**
 * GET /api/thietbi/user/:id - Lấy tất cả thiết bị của 1 người dùng
 */
const getThietBiByUserId = async (req, res) => {
    try {
        const { id } = req.params; // Đây là MaNguoiDung
        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, id)
            .query('SELECT * FROM dbo.ThietBiNguoiDung WHERE MaNguoiDung = @MaNguoiDung');
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET ThietBi by User ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/thietbi - Đăng ký thiết bị mới (hoặc cập nhật token)
 * Cần: MaNguoiDung, DeviceToken
 * Logic: Tìm xem token đã tồn tại chưa, nếu rồi thì update, nếu chưa thì tạo mới.
 */
const registerThietBi = async (req, res) => {
    try {
        const { MaNguoiDung, DeviceToken } = req.body; 

        if (!MaNguoiDung || !DeviceToken) {
            return res.status(400).send('Thiếu MaNguoiDung hoặc DeviceToken');
        }

        const pool = req.pool;

        // Dùng MERGE để (Update nếu có) hoặc (Insert nếu chưa có) trong 1 lệnh SQL
        // Giúp xử lý việc người dùng gỡ app cài lại (token mới) hoặc đăng nhập (token cũ)
        const result = await pool.request()
            .input('MaNguoiDung', mssql.Int, MaNguoiDung)
            .input('DeviceToken', mssql.NVarChar, DeviceToken)
            .input('LastSeen', mssql.DateTime, new Date()) // Cập nhật LastSeen
            .query(`
                MERGE INTO dbo.ThietBiNguoiDung AS target
                USING (SELECT @DeviceToken AS token) AS source
                ON (target.DeviceToken = source.token)
                WHEN MATCHED THEN 
                    UPDATE SET MaNguoiDung = @MaNguoiDung, LastSeen = @LastSeen
                WHEN NOT MATCHED THEN 
                    INSERT (MaNguoiDung, DeviceToken, LastSeen) 
                    VALUES (@MaNguoiDung, @DeviceToken, @LastSeen)
                OUTPUT Inserted.*;
            `);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST ThietBiNguoiDung:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaNguoiDung không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/thietbi - Xóa 1 thiết bị (khi logout)
 * Xóa bằng DeviceToken chứ không phải bằng ID
 */
const deleteThietBiByToken = async (req, res) => {
    try {
        const { DeviceToken } = req.body; // Lấy token từ body

        if (!DeviceToken) {
            return res.status(400).send('Thiếu DeviceToken');
        }

        const result = await req.pool.request()
            .input('DeviceToken', mssql.NVarChar, DeviceToken)
            .query('DELETE FROM dbo.ThietBiNguoiDung OUTPUT Deleted.* WHERE DeviceToken = @DeviceToken');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy thiết bị để xóa');
        }
        res.json({ message: 'Đã xóa (logout) thiết bị thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE ThietBiNguoiDung:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getThietBiByUserId,
    registerThietBi,
    deleteThietBiByToken
};