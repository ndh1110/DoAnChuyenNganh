// controllers/trangThaiController.js
const mssql = require('mssql');

/**
 * GET /api/trangthai/context/:context
 * Lấy tất cả trạng thái theo ngữ cảnh (ví dụ: 'APARTMENT', 'INVOICE')
 */
const getTrangThaiByContext = async (req, res) => {
    try {
        const { context } = req.params;
        const result = await req.pool.request()
            .input('Context', mssql.NVarChar, context.toUpperCase())
            .query(`
                SELECT MaTrangThai, Ten, Code 
                FROM dbo.TrangThai 
                WHERE Context = @Context
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET TrangThai by Context:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getTrangThaiByContext
};