// controllers/canHoController.js
const mssql = require('mssql');
const xlsx = require('xlsx');

const RESIDENT_LIMITS = {
    'Studio': 2, '1PN': 3, '2PN': 5, '3PN': 7, 'default': 4
};
const getLimitByApartmentType = (loaiCanHo) => {
    const key = String(loaiCanHo || '').trim().toUpperCase();
    if (key.includes('1PN')) return RESIDENT_LIMITS['1PN'];
    if (key.includes('2PN')) return RESIDENT_LIMITS['2PN'];
    if (key.includes('3PN')) return RESIDENT_LIMITS['3PN'];
    if (key.includes('STUDIO')) return RESIDENT_LIMITS['Studio'];
    return RESIDENT_LIMITS.default;
};
/**
 * GET /api/canho
 */

const getAllCanHo = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    ch.MaCanHo, ch.SoCanHo,
                    ch.LoaiCanHo, ch.DienTich,
                    ch.HinhAnh, ch.MaTrangThai,
                    b.TenBlock, t.SoTang,
                    ISNULL(tt.Ten, 'N/A') AS TenTrangThai,
                    ch.IsAvailableForRent, 
                    
                    -- ⭐ BỔ SUNG FIX: CÁC CỘT LISTING MỚI ⭐
                    ch.RentPrice, 
                    ch.ListingDescription,
                    
                    -- Lấy HỢP ĐỒNG ĐANG CÓ HIỆU LỰC MỚI NHẤT
                    hd.Loai AS LoaiHopDong,
                    hd.NgayHetHan,
                    ndB.HoTen AS TenBenB,
                    ndB.SoDienThoai AS SDTBenB 

                FROM dbo.CanHo ch
                JOIN dbo.Tang t ON ch.MaTang = t.MaTang
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                LEFT JOIN dbo.TrangThai tt ON ch.MaTrangThai = tt.MaTrangThai
                
                OUTER APPLY (
                    SELECT TOP 1 Loai, BenB_Id, NgayHetHan
                    FROM dbo.HopDong
                    WHERE MaCanHo = ch.MaCanHo
                    ORDER BY NgayKy DESC
                ) hd
                LEFT JOIN dbo.NguoiDung ndB ON hd.BenB_Id = ndB.MaNguoiDung

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
        
        // --- LOGIC KIỂM TRA TÍNH TOÀN VẸN DỮ LIỆU ---
        const NEW_EMPTY_STATUS = 8; // Giả sử MaTrangThai = 8 là "Trống"
        
        // Nếu người dùng cố gắng đặt trạng thái thành TRỐNG (8) và MaTrangThai mới khác cũ
        if (MaTrangThai !== undefined && parseInt(MaTrangThai) === NEW_EMPTY_STATUS && MaTrangThai !== oldData.MaTrangThai) {
            
            // Kiểm tra xem căn hộ có bất kỳ hợp đồng Mua/Bán hoặc Cho Thuê nào đang tồn tại không
            const activeContractCheck = await pool.request()
                .input('MaCanHo', mssql.Int, id)
                .query(`
                    SELECT TOP 1 MaHopDong 
                    FROM dbo.HopDong 
                    WHERE MaCanHo = @MaCanHo 
                    AND (Loai = 'Mua/Bán' OR Loai = 'Cho Thuê')
                    -- Có thể thêm điều kiện kiểm tra ngày hết hạn nếu cần thiết cho HĐ Thuê
                `);

            if (activeContractCheck.recordset.length > 0) {
                return res.status(400).send('Không thể đặt trạng thái thành "Trống" (ID 8) vì căn hộ này đang có Hợp đồng Mua/Bán hoặc Cho Thuê có hiệu lực.');
            }
        }
        // --------------------------------------------------

        // 3. Trộn dữ liệu (Merge)
        const newSoCanHo = SoCanHo !== undefined ? SoCanHo : oldData.SoCanHo;
        const newMaTang = MaTang !== undefined ? MaTang : oldData.MaTang;
        // Sử dụng MaTrangThai mới đã qua kiểm tra
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

const toggleRentStatus = async (req, res) => {
    // 1. Lấy và chuẩn bị dữ liệu
    const { id } = req.params; // MaCanHo
    const userId = req.user.id || req.user.MaNguoiDung; 
    const userRole = req.user.role;

    // Ép kiểu tham số
    const MaCanHo_Int = parseInt(id);
    const UserId_Int = parseInt(userId);

    if (isNaN(MaCanHo_Int) || isNaN(UserId_Int)) {
        return res.status(400).send('Tham số ID hoặc User ID không hợp lệ.');
    }

    try {
        const pool = req.pool;
        const request = pool.request(); // Tạo request duy nhất để khai báo tham số

        // KHAI BÁO BIẾN THAM SỐ SQL (Fix lỗi cú pháp: Msg 137)
        request.input('MaCanHo', mssql.Int, MaCanHo_Int);
        request.input('UserId', mssql.Int, UserId_Int); 

        // BƯỚC 1: KIỂM TRA QUYỀN SỞ HỮU (Authorization)
        if (userRole !== 'Quản lý' && userRole !== 'Admin') {
            
            // Truy vấn kiểm tra Hợp đồng Mua/Bán mới nhất mà user là BenB (Chủ sở hữu).
            const checkOwnerQuery = `
                SELECT TOP 1 hd.MaHopDong
                FROM dbo.HopDong hd
                WHERE hd.MaCanHo = @MaCanHo 
                AND hd.Loai = 'Mua/Bán'
                AND hd.BenB_Id = @UserId  
                ORDER BY hd.NgayKy DESC
            `;
            
            const ownerCheck = await request.query(checkOwnerQuery);
            
            if (ownerCheck.recordset.length === 0) {
                // Trả về 403 Forbidden nếu không phải chủ sở hữu hợp pháp
                return res.status(403).send(`Forbidden: Bạn không phải Chủ sở hữu HĐ Mua/Bán của căn hộ này.`);
            }
        }

        // BƯỚC 2: ĐẢO NGƯỢC TRẠNG THÁI (Toggle)
        const updateQuery = `
            UPDATE dbo.CanHo
            -- SỬA CUỐI CÙNG: Dùng phép toán 1 - X để đảm bảo đảo ngược giá trị BIT (0 thành 1, 1 thành 0)
            SET IsAvailableForRent = 1 - COALESCE(IsAvailableForRent, 0) 
            OUTPUT Inserted.IsAvailableForRent
            WHERE MaCanHo = @MaCanHo
        `;

        // Chạy truy vấn UPDATE bằng request đã khai báo tham số
        const result = await request.query(updateQuery); 

        if (result.recordset.length === 0) {
             return res.status(404).send('Không tìm thấy căn hộ để cập nhật trạng thái.');
        }

        const newStatus = result.recordset[0].IsAvailableForRent;
        
        // 3. Trả về kết quả thành công
        res.json({ 
            message: newStatus ? 'Đã bật chế độ cho thuê' : 'Đã tắt chế độ cho thuê',
            isAvailable: newStatus
        });

    } catch (err) {
        console.error('Lỗi TOGGLE RENT STATUS:', err);
        res.status(500).send(err.message);
    }
};

const updateListing = async (req, res) => {
    const { id } = req.params; // MaCanHo
    const { RentPrice, ListingDescription } = req.body;
    
    // Yêu cầu ít nhất một trường để cập nhật
    if (RentPrice === undefined && ListingDescription === undefined) {
        return res.status(400).send('Không có thông tin Listing nào được cung cấp để cập nhật.');
    }

    const userId = req.user.id || req.user.MaNguoiDung; 
    const userRole = req.user.role;

    const MaCanHo_Int = parseInt(id);
    const UserId_Int = parseInt(userId);

    if (isNaN(MaCanHo_Int) || isNaN(UserId_Int)) {
        return res.status(400).send('Tham số ID hoặc User ID không hợp lệ.');
    }

    try {
        const pool = req.pool;
        const request = pool.request();
        
        request.input('MaCanHo', mssql.Int, MaCanHo_Int);
        request.input('UserId', mssql.Int, UserId_Int); 
        
        // --- BƯỚC 1: KIỂM TRA QUYỀN SỞ HỮU ---
        if (userRole !== 'Quản lý' && userRole !== 'Admin') {
            const checkOwnerQuery = `
                SELECT TOP 1 hd.MaHopDong
                FROM dbo.HopDong hd
                WHERE hd.MaCanHo = @MaCanHo 
                AND hd.Loai = 'Mua/Bán'
                AND hd.BenB_Id = @UserId
                ORDER BY hd.NgayKy DESC
            `;
            
            const ownerCheck = await request.query(checkOwnerQuery);
            
            if (ownerCheck.recordset.length === 0) {
                return res.status(403).send(`Forbidden: Bạn không phải Chủ sở hữu hợp pháp của căn hộ này.`);
            }
        }
        
        // --- BƯỚC 2: TẠO TRUY VẤN UPDATE ĐỘNG VÀ KHAI BÁO BIẾN ---
        let setClauses = [];
        
        if (RentPrice !== undefined) {
            setClauses.push(`RentPrice = @RentPrice`);
            
            // ⭐ FIX LỖI ẨN: Ép kiểu và xử lý giá trị rỗng/zero an toàn ⭐
            const rawPrice = String(RentPrice).trim();
            let priceValue = null;
            
            if (rawPrice !== '') {
                // Sử dụng Number() hoặc parseFloat() và kiểm tra NaN
                const parsedPrice = parseFloat(rawPrice);
                if (!isNaN(parsedPrice)) {
                    priceValue = parsedPrice;
                }
            }
            
            // Input giá trị (sẽ là NULL nếu giá trị rỗng)
            request.input('RentPrice', mssql.Decimal(18, 2), priceValue);
        }

        if (ListingDescription !== undefined) {
            setClauses.push(`ListingDescription = @ListingDescription`);
            // Xử lý mô tả rỗng để truyền thành NULL
            const descValue = ListingDescription === '' || ListingDescription === null ? null : ListingDescription;
            request.input('ListingDescription', mssql.NVarChar, descValue);
        }
        
        const updateQuery = `
            UPDATE dbo.CanHo
            SET ${setClauses.join(', ')}
            OUTPUT Inserted.*
            WHERE MaCanHo = @MaCanHo
        `;

        const result = await request.query(updateQuery); 

        if (result.recordset.length === 0) {
             return res.status(404).send('Không tìm thấy căn hộ để cập nhật.');
        }
        
        // 3. Trả về kết quả thành công
        res.json({ 
            message: 'Cập nhật thông tin Listing thành công',
            updatedApartment: result.recordset[0]
        });

    } catch (err) {
        console.error('Lỗi UPDATE LISTING:', err);
        // Trả về lỗi chi tiết hơn nếu có thể
        res.status(500).send(err.message || 'Lỗi server khi cập nhật Listing.');
    }
};

const getApartmentDetailsForStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;
        const MaCanHo_Int = parseInt(id);

        if (isNaN(MaCanHo_Int)) {
            return res.status(400).send('Mã căn hộ không hợp lệ.');
        }

        // Query 1: Lấy thông tin chi tiết Căn hộ và Hợp đồng chính (mới nhất)
        const apartmentQuery = `
            SELECT 
                ch.MaCanHo, ch.SoCanHo, ch.LoaiCanHo, ch.DienTich, ch.HinhAnh, 
                ch.MaTrangThai, tt.Ten AS TenTrangThai, ch.IsAvailableForRent,
                ch.RentPrice, ch.ListingDescription,
                b.TenBlock, t.SoTang,
                
                -- Thông tin Chủ/Thuê chính
                hd.MaHopDong, hd.Loai AS LoaiHopDong, hd.NgayKy, hd.NgayHetHan,
                ndB.MaNguoiDung AS BenB_Id, ndB.HoTen AS TenChuHo, ndB.SoDienThoai AS SDTChuHo, ndB.Email AS EmailChuHo
            FROM dbo.CanHo ch
            JOIN dbo.TrangThai tt ON ch.MaTrangThai = tt.MaTrangThai
            JOIN dbo.Tang t ON ch.MaTang = t.MaTang
            JOIN dbo.Block b ON t.MaBlock = b.MaBlock
            LEFT JOIN ( -- Lấy Hợp đồng đang hiệu lực MỚI NHẤT
                SELECT TOP 1 * FROM dbo.HopDong 
                WHERE MaCanHo = @MaCanHo AND (NgayHetHan IS NULL OR NgayHetHan >= GETDATE()) -- Dùng >= GETDATE()
                ORDER BY NgayKy DESC, MaHopDong DESC
            ) AS hd ON ch.MaCanHo = hd.MaCanHo
            LEFT JOIN dbo.NguoiDung ndB ON hd.BenB_Id = ndB.MaNguoiDung
            WHERE ch.MaCanHo = @MaCanHo;
        `;
        
        const apartmentResult = await pool.request()
            .input('MaCanHo', mssql.Int, MaCanHo_Int)
            .query(apartmentQuery);
        
        if (apartmentResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy căn hộ.');
        }

        const apartmentDetails = apartmentResult.recordset[0];
        
        // Query 2: Lấy danh sách Cư dân đang Cư trú (Active Residents)
        const residentQuery = `
            SELECT 
                ls.MaLichSu, ls.VaiTroCuTru, ls.TuNgay, ls.DenNgay,
                nd.MaNguoiDung, nd.HoTen, nd.SoDienThoai, nd.Email
            FROM dbo.LichSuCuTru ls
            JOIN dbo.NguoiDung nd ON ls.MaNguoiDung = nd.MaNguoiDung
            WHERE ls.MaCanHo = @MaCanHo
            -- ⭐ FIX LỖI ĐẾM SỐ LƯỢNG: Đảm bảo lấy bản ghi còn hiệu lực (NULL hoặc >= ngày hiện tại) ⭐
            AND (ls.DenNgay IS NULL OR ls.DenNgay >= GETDATE())
            ORDER BY ls.VaiTroCuTru DESC, ls.TuNgay DESC;
        `;

        const residentResult = await pool.request()
            .input('MaCanHo', mssql.Int, MaCanHo_Int)
            .query(residentQuery);
        
        const activeResidents = residentResult.recordset;
        
        // Logic 3: Tính toán Giới hạn Cư trú
        const maxLimit = getLimitByApartmentType(apartmentDetails.LoaiCanHo);
        const currentCount = activeResidents.length; // Đếm số lượng dòng ACTIVE trả về

        res.json({
            ...apartmentDetails,
            ActiveResidents: activeResidents,
            ResidentLimit: {
                Max: maxLimit,
                Current: currentCount,
                LoaiCanHo: apartmentDetails.LoaiCanHo
            },
        });

    } catch (err) {
        console.error('Lỗi GET Apartment Details For Staff:', err);
        res.status(500).send(err.message);
    }
};

// ... (đảm bảo hàm này được export trong module.exports)
module.exports = {
    getAllCanHo,
    getCanHoById,
    createCanHo,
    updateCanHo,
    deleteCanHo,
    importFromExcel,
    toggleRentStatus,
    updateListing,
    getApartmentDetailsForStaff
    
};