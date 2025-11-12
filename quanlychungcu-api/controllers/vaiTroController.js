// controllers/vaiTroController.js
const mssql = require('mssql');

/**
 * GET /api/vaitro - Lấy tất cả vai trò (cha và con)
 */
const getAllRoles = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    vt.MaVaiTro, 
                    vt.TenVaiTro, 
                    vt.MaVaiTroCha,
                    vt_cha.TenVaiTro AS TenVaiTroCha
                FROM dbo.VaiTro vt
                LEFT JOIN dbo.VaiTro vt_cha ON vt.MaVaiTroCha = vt_cha.MaVaiTro
                ORDER BY vt.MaVaiTroCha, vt.TenVaiTro
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all VaiTro:', err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllRoles
};