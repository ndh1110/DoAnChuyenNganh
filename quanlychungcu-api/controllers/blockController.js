// controllers/blockController.js
const mssql = require('mssql');

/**
 * GET /api/block - Lấy tất cả block
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
 * GET /api/block/:id - Lấy 1 block theo ID (MaBlock)
 */
const getBlockById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaBlock', mssql.Int, id)
            .query('SELECT * FROM dbo.Block WHERE MaBlock = @MaBlock');
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy block');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET Block by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/block - Tạo block mới
 * Cần: TenBlock, SoTang
 */
const createBlock = async (req, res) => {
    try {
        const { TenBlock, SoTang } = req.body; 

        if (!TenBlock || !SoTang) {
            return res.status(400).send('Thiếu TenBlock hoặc SoTang');
        }

        const result = await req.pool.request()
            .input('TenBlock', mssql.NVarChar, TenBlock)
            .input('SoTang', mssql.Int, SoTang)
            .query('INSERT INTO dbo.Block (TenBlock, SoTang) OUTPUT Inserted.* VALUES (@TenBlock, @SoTang)');
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST Block:', err);
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/block/:id - Cập nhật block (MaBlock)
 */
const updateBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        const oldDataResult = await pool.request()
            .input('MaBlock', mssql.Int, id)
            .query('SELECT * FROM dbo.Block WHERE MaBlock = @MaBlock');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy block để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // Trộn dữ liệu (partial update)
        const { TenBlock, SoTang } = req.body;
        const newTenBlock = TenBlock !== undefined ? TenBlock : oldData.TenBlock;
        const newSoTang = SoTang !== undefined ? SoTang : oldData.SoTang;

        const result = await pool.request()
            .input('MaBlock', mssql.Int, id)
            .input('TenBlock', mssql.NVarChar, newTenBlock)
            .input('SoTang', mssql.Int, newSoTang)
            .query(`UPDATE dbo.Block 
                    SET TenBlock = @TenBlock, SoTang = @SoTang
                    OUTPUT Inserted.* WHERE MaBlock = @MaBlock`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT Block:', err);
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/block/:id - Xóa block (MaBlock)
 */
const deleteBlock = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await req.pool.request()
            .input('MaBlock', mssql.Int, id)
            .query('DELETE FROM dbo.Block OUTPUT Deleted.* WHERE MaBlock = @MaBlock');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy block để xóa');
        }
        res.json({ message: 'Đã xóa block (và tất cả Tầng, Căn Hộ liên quan) thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE Block:', err);
        res.status(500).send(err.message);
    }
};


/**
 * POST /api/block/setup - Nghiệp vụ đặc biệt:
 * Tạo Block, Tầng, và Căn hộ hàng loạt.
 */
const setupBlockWithApartments = async (req, res) => {
    const { TenBlock, SoTang, TongSoCanHo } = req.body;

    // --- 1. Validation (Kiểm tra đầu vào) ---
    if (!TenBlock || !SoTang || !TongSoCanHo) {
        return res.status(400).send('Vui lòng cung cấp đủ TenBlock, SoTang, và TongSoCanHo.');
    }

    if (SoTang <= 0 || TongSoCanHo <= 0) {
        return res.status(400).send('Số tầng và Tổng số căn hộ phải lớn hơn 0.');
    }

    if (TongSoCanHo % SoTang !== 0) {
        return res.status(400).send('Tổng số căn hộ phải chia hết cho số tầng.');
    }

    const canHoMoiTang = TongSoCanHo / SoTang;
    console.log(`Bắt đầu setup Block: ${TenBlock}. Tầng: ${SoTang}. Căn/Tầng: ${canHoMoiTang}`);

    // --- 2. Bắt đầu Transaction ---
    const transaction = new mssql.Transaction(req.pool);

    try {
        await transaction.begin();

        // --- 3. Bước 1: Tạo Block ---
        const blockResult = await transaction.request()
            .input('TenBlock', mssql.NVarChar, TenBlock)
            .input('SoTang', mssql.Int, SoTang)
            .query('INSERT INTO dbo.Block (TenBlock, SoTang) OUTPUT Inserted.MaBlock VALUES (@TenBlock, @SoTang)');
        
        const newBlockId = blockResult.recordset[0].MaBlock;

        // --- 4. Bước 2 & 3: Lặp để tạo Tầng và Căn hộ ---
        for (let t = 1; t <= SoTang; t++) {
            
            // 4a. Tạo Tầng
            const tangResult = await transaction.request()
                .input('MaBlock', mssql.Int, newBlockId)
                .input('SoTang', mssql.Int, t) // 't' là số thứ tự tầng
                .query('INSERT INTO dbo.Tang (MaBlock, SoTang) OUTPUT Inserted.MaTang VALUES (@MaBlock, @SoTang)');
            
            const newTangId = tangResult.recordset[0].MaTang;

            // 4b. Lặp để tạo Căn hộ cho Tầng 't'
            for (let c = 1; c <= canHoMoiTang; c++) {
                
                // 4c. Tạo Mã Căn Hộ (ĐÃ SỬA)
                const floorCode = String(t).padStart(2, '0');
                const apartmentCode = String(c).padStart(2, '0');
                
                // Tách "Block D" -> "D"
                const tenBlockParts = TenBlock.split(' ');
                const tenBlockShort = tenBlockParts[tenBlockParts.length - 1];

                const soCanHoString = `${tenBlockShort}.${floorCode}.${apartmentCode}`;

                // 4d. Tạo Căn Hộ
                await transaction.request()
                    .input('MaTang', mssql.Int, newTangId)
                    .input('SoCanHo', mssql.NVarChar, soCanHoString)
                    .input('MaTrangThai', mssql.Int, 8) // Gán trạng thái "Trống"
                    .query('INSERT INTO dbo.CanHo (MaTang, SoCanHo, MaTrangThai) VALUES (@MaTang, @SoCanHo, @MaTrangThai)');
            }
        }

        // --- 5. Commit Transaction ---
        await transaction.commit();
        
        res.status(201).json({
            message: `Tạo Block ${TenBlock} thành công!`,
            MaBlock: newBlockId,
            SoTangDaTao: SoTang,
            SoCanHoDaTao: TongSoCanHo
        });

    } catch (err) {
        // --- 6. Rollback nếu có lỗi ---
        console.error('Lỗi khi setup Block hàng loạt:', err);
        await transaction.rollback();
        res.status(500).send(`Lỗi server: ${err.message}`);
    }
};

module.exports = {
    getAllBlocks,
    getBlockById,
    createBlock,
    updateBlock,
    deleteBlock,
    setupBlockWithApartments // Export hàm mới
};