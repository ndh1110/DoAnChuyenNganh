// controllers/canHoController.js
const mssql = require('mssql');
const xlsx = require('xlsx');

/**
 * GET /api/canho
 * Lấy danh sách căn hộ (Kèm cột HinhAnh)
 */
const getAllCanHo = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    ch.MaCanHo, ch.SoCanHo,
                    ch.LoaiCanHo, ch.DienTich,
                    ch.HinhAnh, -- <--- THÊM: Lấy đường dẫn ảnh
                    t.MaTang, t.SoTang,
                    b.MaBlock, b.TenBlock,
                    ch.MaTrangThai,
                    ISNULL(tt.Ten, 'N/A') AS TenTrangThai
                FROM dbo.CanHo ch
                JOIN dbo.Tang t ON ch.MaTang = t.MaTang
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                LEFT JOIN dbo.TrangThai tt ON ch.MaTrangThai = tt.MaTrangThai
                ORDER BY b.TenBlock, t.SoTang, ch.SoCanHo
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all CanHo:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/canho/:id
 * Lấy chi tiết 1 căn hộ
 */
const getCanHoById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaCanHo', mssql.Int, id)
            .query(`
                SELECT 
                    ch.*, -- Đã bao gồm HinhAnh
                    t.SoTang,
                    b.TenBlock,
                    ISNULL(tt.Ten, 'N/A') AS TenTrangThai
                FROM dbo.CanHo ch
                JOIN dbo.Tang t ON ch.MaTang = t.MaTang
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                LEFT JOIN dbo.TrangThai tt ON ch.MaTrangThai = tt.MaTrangThai
                WHERE ch.MaCanHo = @MaCanHo
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy căn hộ');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET CanHo by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/canho
 * Tạo mới căn hộ (Có xử lý upload ảnh)
 */
const createCanHo = async (req, res) => {
    try {
        const { SoCanHo, MaTang, MaTrangThai, LoaiCanHo, DienTich } = req.body; 

        // 1. XỬ LÝ FILE ẢNH (Nếu có)
        let hinhAnhPath = null;
        if (req.file) {
            // Multer trả về đường dẫn có dấu '\' trên Windows, cần đổi thành '/' cho URL
            hinhAnhPath = req.file.path.replace(/\\/g, "/");
        }

        // Validate dữ liệu bắt buộc
        if (!SoCanHo || !MaTang) {
            return res.status(400).send('Thiếu SoCanHo hoặc MaTang');
        }

        const result = await req.pool.request()
            .input('SoCanHo', mssql.NVarChar, SoCanHo)
            .input('MaTang', mssql.Int, MaTang)
            .input('MaTrangThai', mssql.Int, MaTrangThai)
            .input('LoaiCanHo', mssql.NVarChar, LoaiCanHo)
            .input('DienTich', mssql.Decimal(10, 2), DienTich)
            .input('HinhAnh', mssql.NVarChar, hinhAnhPath) // <--- Input HinhAnh
            .query(`INSERT INTO dbo.CanHo (SoCanHo, MaTang, MaTrangThai, LoaiCanHo, DienTich, HinhAnh) 
                    OUTPUT Inserted.* VALUES (@SoCanHo, @MaTang, @MaTrangThai, @LoaiCanHo, @DienTich, @HinhAnh)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST CanHo:', err);
        if (err.number === 2627 || err.number === 2601) {
            return res.status(400).send('Số căn hộ này đã tồn tại trong tầng này.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/canho/:id
 * Cập nhật căn hộ (Có xử lý cập nhật ảnh)
 */
const updateCanHo = async (req, res) => {
    try {
        const { id } = req.params;
        const { SoCanHo, MaTang, MaTrangThai, LoaiCanHo, DienTich } = req.body;
        const pool = req.pool;

        // 1. Kiểm tra xem có file ảnh mới được upload không
        let newHinhAnhPath = undefined;
        if (req.file) {
            newHinhAnhPath = req.file.path.replace(/\\/g, "/");
        }

        // 2. Lấy dữ liệu cũ từ DB
        const oldDataResult = await pool.request()
            .input('MaCanHo', mssql.Int, id)
            .query('SELECT * FROM dbo.CanHo WHERE MaCanHo = @MaCanHo');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy căn hộ để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // 3. Trộn dữ liệu (Merge)
        const newSoCanHo = SoCanHo !== undefined ? SoCanHo : oldData.SoCanHo;
        const newMaTang = MaTang !== undefined ? MaTang : oldData.MaTang;
        const newMaTrangThai = MaTrangThai !== undefined ? MaTrangThai : oldData.MaTrangThai;
        const newLoaiCanHo = LoaiCanHo !== undefined ? LoaiCanHo : oldData.LoaiCanHo;
        const newDienTich = DienTich !== undefined ? DienTich : oldData.DienTich;
        
        // Logic ảnh: Nếu có ảnh mới -> dùng mới. Nếu không -> dùng lại ảnh cũ.
        const finalHinhAnh = newHinhAnhPath !== undefined ? newHinhAnhPath : oldData.HinhAnh;

        // 4. Thực hiện Update
        const result = await pool.request()
            .input('MaCanHo', mssql.Int, id)
            .input('SoCanHo', mssql.NVarChar, newSoCanHo)
            .input('MaTang', mssql.Int, newMaTang)
            .input('MaTrangThai', mssql.Int, newMaTrangThai)
            .input('LoaiCanHo', mssql.NVarChar, newLoaiCanHo)
            .input('DienTich', mssql.Decimal(10, 2), newDienTich)
            .input('HinhAnh', mssql.NVarChar, finalHinhAnh) // <--- Update HinhAnh
            .query(`UPDATE dbo.CanHo 
                    SET SoCanHo = @SoCanHo, MaTang = @MaTang, MaTrangThai = @MaTrangThai,
                        LoaiCanHo = @LoaiCanHo, DienTich = @DienTich, HinhAnh = @HinhAnh
                    OUTPUT Inserted.* WHERE MaCanHo = @MaCanHo`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT CanHo:', err);
        if (err.number === 2627 || err.number === 2601) {
            return res.status(400).send('Số căn hộ này đã tồn tại trong tầng này.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/canho/:id
 */
const deleteCanHo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaCanHo', mssql.Int, id)
            .query('DELETE FROM dbo.CanHo OUTPUT Deleted.* WHERE MaCanHo = @MaCanHo');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy căn hộ để xóa');
        }
        res.json({ message: 'Đã xóa căn hộ thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE CanHo:', err);
        if (err.number === 547) {
            return res.status(400).send('Không thể xóa: Căn hộ này đang được liên kết bởi dữ liệu khác (Hợp Đồng, Hóa Đơn,...).');
        }
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/canho/import-excel
 * (Giữ nguyên logic Import Excel cũ - Không hỗ trợ import ảnh qua Excel)
 */
const importFromExcel = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Không có file nào được tải lên.');
    }

    const transaction = new mssql.Transaction(req.pool);
    let errorList = [];
    let insertedCount = 0;

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const data = xlsx.utils.sheet_to_json(worksheet, {
             header: ["TenBlock", "SoTang", "SoThuTu", "LoaiCanHo", "DienTich"],
             range: 1
        });

        const tangLookupResult = await req.pool.request().query(`
            SELECT t.MaTang, t.SoTang, b.TenBlock 
            FROM dbo.Tang t 
            JOIN dbo.Block b ON t.MaBlock = b.MaBlock
        `);
        
        const tangMap = new Map();
        tangLookupResult.recordset.forEach(t => {
            const key = `${t.TenBlock.trim()}-${t.SoTang}`;
            tangMap.set(key, { 
                MaTang: t.MaTang, 
                TenBlock: t.TenBlock.trim(), 
                SoTang: t.SoTang 
            });
        });

        let processedData = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const tenBlock = row.TenBlock ? row.TenBlock.trim() : null;
            const soTang = row.SoTang;
            const soThuTu = row.SoThuTu;

            if (!tenBlock || !soTang || !soThuTu) {
                errorList.push(`Dòng ${i + 2}: Thiếu Tên Block, Số Tầng, hoặc Số Thứ Tự.`);
                continue;
            }

            const lookupKey = `${tenBlock}-${soTang}`;
            const tangData = tangMap.get(lookupKey);

            if (!tangData) {
                errorList.push(`Dòng ${i + 2}: Không tìm thấy Tầng (Block: ${tenBlock}, Tầng: ${soTang}).`);
                continue;
            }

            const tenBlockParts = tangData.TenBlock.split(' ');
            const tenBlockShort = tenBlockParts[tenBlockParts.length - 1];
            
            const soTangStr = String(tangData.SoTang).padStart(2, '0');
            const soThuTuStr = String(soThuTu).padStart(2, '0');
            const generatedSoCanHo = `${tenBlockShort}.${soTangStr}.${soThuTuStr}`;

            processedData.push({
                MaTang: tangData.MaTang,
                SoCanHo: generatedSoCanHo,
                LoaiCanHo: row.LoaiCanHo || null,
                DienTich: row.DienTich || null,
                MaTrangThai: 8 
            });
        }

        if (errorList.length === 0 && processedData.length > 0) {
            await transaction.begin();

            for (const canHo of processedData) {
                await transaction.request()
                    .input('SoCanHo', mssql.NVarChar, canHo.SoCanHo)
                    .input('MaTang', mssql.Int, canHo.MaTang)
                    .input('MaTrangThai', mssql.Int, canHo.MaTrangThai)
                    .input('LoaiCanHo', mssql.NVarChar, canHo.LoaiCanHo)
                    .input('DienTich', mssql.Decimal(10, 2), canHo.DienTich)
                    // Import Excel mặc định HinhAnh là NULL
                    .query(`INSERT INTO dbo.CanHo (SoCanHo, MaTang, MaTrangThai, LoaiCanHo, DienTich, HinhAnh) 
                            VALUES (@SoCanHo, @MaTang, @MaTrangThai, @LoaiCanHo, @DienTich, NULL)`);
                insertedCount++;
            }

            await transaction.commit();
            res.status(201).json({ 
                message: `Import thành công! Đã tạo ${insertedCount} căn hộ mới.` 
            });

        } else if (errorList.length > 0) {
            res.status(400).json({ 
                message: "Dữ liệu Excel có lỗi. Không có căn hộ nào được tạo.", 
                errors: errorList 
            });
        } else {
            res.status(400).send('Không có dữ liệu hợp lệ trong file Excel.');
        }

    } catch (err) {
        if (transaction.active) {
            await transaction.rollback();
        }
        console.error('Lỗi khi Import Excel:', err);
        if (err.number === 2627 || err.number === 2601) {
             return res.status(400).json({
                message: "Import thất bại: Trùng lặp Mã Căn Hộ (được tạo ra) trong một Tầng.",
                errors: [err.message]
            });
        }
        res.status(500).json({ message: 'Lỗi server khi import.', errors: [err.message] });
    }
};

module.exports = {
    getAllCanHo,
    getCanHoById,
    createCanHo,
    updateCanHo,
    deleteCanHo,
    importFromExcel
};