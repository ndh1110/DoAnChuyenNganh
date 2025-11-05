// controllers/auditLogController.js
const mssql = require('mssql');

/**
 * GET /api/auditlog - Lấy tất cả nhật ký (có lọc)
 * Lọc theo ?tableName=TenBang
 * Lọc theo ?maNguoiDung=1
 */
const getAllAuditLogs = async (req, res) => {
    try {
        const { tableName, maNguoiDung } = req.query;
        let query = `
            SELECT 
                log.MaAuditId, log.EntryType, log.EntryId, log.TableName, 
                log.ActionType, log.NewValue, log.ThoiDian,
                nd.MaNguoiDung AS MaNguoiThayDoi, nd.HoTen AS TenNguoiThayDoi
            FROM dbo.AuditLog log
            -- Dùng LEFT JOIN phòng trường hợp log hệ thống (NguyenVaoNoi = NULL)
            LEFT JOIN dbo.NguoiDung nd ON log.NguyenVaoNoi = nd.MaNguoiDung 
            WHERE 1=1
        `;
        
        const request = req.pool.request();

        if (tableName) {
            query += ' AND log.TableName = @TableName';
            request.input('TableName', mssql.NVarChar, tableName);
        }
        if (maNguoiDung) {
            query += ' AND log.NguyenVaoNoi = @MaNguoiDung';
            request.input('MaNguoiDung', mssql.Int, maNguoiDung);
        }

        query += ' ORDER BY log.ThoiDian DESC';

        const result = await request.query(query);
        res.json(result.recordset);

    } catch (err) {
        console.error('Lỗi GET all AuditLog:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/auditlog - Ghi một nhật ký mới
 * Cần: TableName, ActionType, NguyenVaoNoi (MaNguoiDung)
 * Tùy chọn: EntryType, EntryId, NewValue, RequestId
 */
const createAuditLog = async (req, res) => {
    try {
        const { 
            EntryType, EntryId, TableName, ActionType, 
            NewValue, NguyenVaoNoi, RequestId 
        } = req.body; 

        if (!TableName || !ActionType) {
            return res.status(400).send('Thiếu TableName hoặc ActionType');
        }

        const result = await req.pool.request()
            .input('EntryType', mssql.NVarChar, EntryType)
            .input('EntryId', mssql.Int, EntryId)
            .input('TableName', mssql.NVarChar, TableName)
            .input('ActionType', mssql.NVarChar, ActionType)
            .input('NewValue', mssql.NVarChar, NewValue)
            .input('NguyenVaoNoi', mssql.Int, NguyenVaoNoi) // FK đến NguoiDung
            .input('RequestId', mssql.NVarChar, RequestId)
            // ThoiDian có DEFAULT GETDATE()
            .query(`
                INSERT INTO dbo.AuditLog (
                    EntryType, EntryId, TableName, ActionType, 
                    NewValue, NguyenVaoNoi, RequestId
                ) 
                OUTPUT Inserted.* VALUES (
                    @EntryType, @EntryId, @TableName, @ActionType, 
                    @NewValue, @NguyenVaoNoi, @RequestId
                )
            `);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST AuditLog:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: NguyenVaoNoi (MaNguoiDung) không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllAuditLogs,
    createAuditLog
    // Không có Update, không có Delete
};