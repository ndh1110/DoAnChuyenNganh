// controllers/blockController.js
const mssql = require('mssql');

/**
 * GET /api/block - Lấy danh sách block (Cơ bản)
 */
const getAllBlocks = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query('SELECT * FROM dbo.Block ORDER BY TenBlock');
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all Blocks:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/block/:id - Lấy chi tiết Block (BAO GỒM Tầng và Căn hộ)
 * Yêu cầu Frontend: Trả về cấu trúc Nested (Lồng nhau)
 */
const getBlockById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        // 1. Lấy thông tin Block
        const blockResult = await pool.request()
            .input('MaBlock', mssql.Int, id)
            .query('SELECT * FROM dbo.Block WHERE MaBlock = @MaBlock');

        if (blockResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy block');
        }
        const block = blockResult.recordset[0];

        // 2. Lấy danh sách Tầng và Căn hộ
        // Đã sửa lại cú pháp SQL, thêm dấu phẩy đầy đủ
        const detailsResult = await pool.request()
            .input('MaBlock', mssql.Int, id)
            .query(`
                SELECT 
                    t.MaTang, 
                    t.SoTang,
                    ch.MaCanHo, 
                    ch.SoCanHo,
                    ISNULL(tt.Ten, N'Trống') AS TrangThai,
                    ISNULL(ch.MaTrangThai, 8) AS MaTrangThai
                FROM dbo.Tang t
                LEFT JOIN dbo.CanHo ch ON t.MaTang = ch.MaTang
                LEFT JOIN dbo.TrangThai tt ON ch.MaTrangThai = tt.MaTrangThai
                WHERE t.MaBlock = @MaBlock
                ORDER BY t.SoTang, ch.SoCanHo
            `);

        // 3. Xử lý dữ liệu lồng nhau (Nested)
        const floorsMap = new Map();

        detailsResult.recordset.forEach(row => {
            if (!floorsMap.has(row.MaTang)) {
                floorsMap.set(row.MaTang, {
                    MaTang: row.MaTang,
                    SoTang: row.SoTang,
                    Apartments: []
                });
            }

            if (row.MaCanHo) {
                floorsMap.get(row.MaTang).Apartments.push({
                    MaCanHo: row.MaCanHo,
                    SoCanHo: row.SoCanHo,
                    TrangThai: row.TrangThai,
                    MaTrangThai: row.MaTrangThai // Đã lấy đúng ID
                });
            }
        });

        block.Floors = Array.from(floorsMap.values());
        res.json(block);

    } catch (err) {
        console.error('Lỗi GET Block Details:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/block - Tạo block đơn (Cũ - Giữ lại)
 */
const createBlock = async (req, res) => {
    // ... (Giữ nguyên logic cũ của bạn nếu cần, hoặc có thể bỏ qua nếu dùng setup)
    try {
        const { TenBlock, SoTang } = req.body; 
        if (!TenBlock || !SoTang) return res.status(400).send('Thiếu thông tin');
        const result = await req.pool.request()
            .input('TenBlock', mssql.NVarChar, TenBlock)
            .input('SoTang', mssql.Int, SoTang)
            .query('INSERT INTO dbo.Block (TenBlock, SoTang) OUTPUT Inserted.* VALUES (@TenBlock, @SoTang)');
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/block/setup - Tạo Block Nâng cao (Setup nhanh)
 * Tạo Block -> Tạo Tầng -> Tạo Căn hộ tự động
 */
const setupBlock = async (req, res) => {
    const { TenBlock, SoTang, TongSoCanHo } = req.body;

    if (!TenBlock || !SoTang || !TongSoCanHo) {
        return res.status(400).send('Thiếu thông tin (TenBlock, SoTang, TongSoCanHo)');
    }

    const numFloors = parseInt(SoTang);
    const numApts = parseInt(TongSoCanHo);

    if (numApts % numFloors !== 0) {
        return res.status(400).send('Tổng số căn hộ phải chia hết cho số tầng để chia đều.');
    }

    const aptsPerFloor = numApts / numFloors;
    const pool = req.pool;
    const transaction = new mssql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Tạo Block
        const requestBlock = transaction.request();
        const blockResult = await requestBlock
            .input('TenBlock', mssql.NVarChar, TenBlock)
            .input('SoTang', mssql.Int, numFloors)
            .query('INSERT INTO dbo.Block (TenBlock, SoTang) OUTPUT Inserted.MaBlock VALUES (@TenBlock, @SoTang)');
        
        const maBlock = blockResult.recordset[0].MaBlock;

        // 2. Vòng lặp tạo Tầng
        for (let i = 1; i <= numFloors; i++) {
            const requestTang = transaction.request();
            const tangResult = await requestTang
                .input('MaBlock', mssql.Int, maBlock)
                .input('SoTang', mssql.Int, i)
                .query('INSERT INTO dbo.Tang (MaBlock, SoTang) OUTPUT Inserted.MaTang VALUES (@MaBlock, @SoTang)');
            
            const maTang = tangResult.recordset[0].MaTang;

            // 3. Vòng lặp tạo Căn hộ cho tầng này
            for (let j = 1; j <= aptsPerFloor; j++) {
                // Tạo tên căn hộ: Ví dụ Tầng 1, Căn 1 -> "101"
                // PadStart để số căn luôn có 2 chữ số (01, 02...)
                const tenCanHo = `${i}${j.toString().padStart(2, '0')}`; 
                const maTrangThaiTrong = 8; // Giả sử ID 8 là "Trống"

                const requestCanHo = transaction.request();
                await requestCanHo
                    .input('MaTang', mssql.Int, maTang)
                    .input('SoCanHo', mssql.NVarChar, tenCanHo)
                    .input('MaTrangThai', mssql.Int, maTrangThaiTrong)
                    .query('INSERT INTO dbo.CanHo (MaTang, SoCanHo, MaTrangThai) VALUES (@MaTang, @SoCanHo, @MaTrangThai)');
            }
        }

        await transaction.commit();
        res.status(201).json({ message: 'Setup Block thành công!', MaBlock: maBlock });

    } catch (err) {
        await transaction.rollback();
        console.error('Lỗi Setup Block:', err);
        res.status(500).send('Lỗi server khi setup block: ' + err.message);
    }
};

// ... (Các hàm updateBlock, deleteBlock giữ nguyên)
const updateBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const { TenBlock, SoTang } = req.body;
        const result = await req.pool.request()
            .input('MaBlock', mssql.Int, id)
            .input('TenBlock', mssql.NVarChar, TenBlock)
            .input('SoTang', mssql.Int, SoTang)
            .query(`UPDATE dbo.Block SET TenBlock = @TenBlock, SoTang = @SoTang WHERE MaBlock = @MaBlock`);
        res.json({ message: 'Updated' });
    } catch (err) { res.status(500).send(err.message); }
};

const deleteBlock = async (req, res) => {
    try {
        const { id } = req.params;
        await req.pool.request().input('MaBlock', mssql.Int, id).query('DELETE FROM dbo.Block WHERE MaBlock = @MaBlock');
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).send(err.message); }
};

module.exports = {
    getAllBlocks,
    getBlockById, // Đã update logic nested
    createBlock,
    setupBlock,   // Mới
    updateBlock,
    deleteBlock
};