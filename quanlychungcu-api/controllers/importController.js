// controllers/importController.js
const mssql = require('mssql');
const XLSX = require('xlsx');

// Hàm nội bộ: Tìm MaDichVu theo Tên
const getDichVuMap = async (pool) => {
    const result = await pool.request().query('SELECT MaDichVu, TenDichVu, KieuTinh FROM dbo.DichVu');
    const map = new Map();
    result.recordset.forEach(dv => {
        map.set(dv.TenDichVu.toLowerCase(), dv);
    });
    return map;
};

// Hàm nội bộ: Lấy MaCanHo theo Số căn hộ/MaTang
const getCanHoMap = async (pool) => {
    const result = await pool.request().query('SELECT MaCanHo, SoCanHo, MaTang FROM dbo.CanHo');
    const map = new Map();
    result.recordset.forEach(ch => {
        // Tạo khóa ghép (ví dụ: '101-1' nếu 101 là số căn hộ và 1 là MaTang)
        map.set(`${ch.SoCanHo.toLowerCase()}-${ch.MaTang}`, ch.MaCanHo);
    });
    return map;
};


/**
 * POST /api/billing/import-excel - Xử lý file Excel và tạo hóa đơn hàng loạt
 */
const importInvoicesFromExcel = async (req, res) => {
    const pool = req.pool;

    if (!req.file) {
        return res.status(400).send('Không tìm thấy file Excel');
    }

    try {
        // 1. Đọc file Excel
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Đọc dữ liệu thành JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet); 

        // 2. Chuẩn bị Maps tra cứu
        const dvMap = await getDichVuMap(pool);
        const chMap = await getCanHoMap(pool);
        
        let createdInvoicesCount = 0;
        let createdDetailsCount = 0;
        const failedRecords = [];

        // 3. Bắt đầu Transaction (Đảm bảo tất cả thành công hoặc tất cả thất bại)
        const transaction = new mssql.Transaction(pool);
        await transaction.begin();

        try {
            for (const row of rawData) {
                // Giả định các cột đầu vào (tên cột trong file Excel)
                const SoCanHo = String(row['Số Căn Hộ'] || "").trim();
                const SoTang = row['Số Tầng']; // Số Tầng là cần thiết để tìm MaTang và MaCanHo
                const KyThangStr = row['Kỳ Tháng']; // Ví dụ: 2025-11-01
                const TienDien = row['Tiền Điện'] || 0;
                const TienNuoc = row['Tiền Nước'] || 0;
                const PhiQL = row['Phí Quản Lý'] || 0;
                const Net = row['Internet'] || 0;
                const NgayPhatHanh = row['Ngày Phát Hành'] ? new Date(row['Ngày Phát Hành']) : new Date();
                const NgayDenHan = row['Ngày Đến Hạn'] ? new Date(row['Ngày Đến Hạn']) : new Date();
                
                if (SoTang === null) {
                    failedRecords.push({ row, error: 'Thiếu Số Tầng.' });
                    continue;
                }

                // Lấy MaTang thực tế từ DB
                const MaTangResult = await pool.request().query(`SELECT MaTang FROM dbo.Tang WHERE SoTang = ${parseInt(SoTang)}`);
                const MaTang = MaTangResult.recordset.length > 0 ? MaTangResult.recordset[0].MaTang : null;
                
                // Tra cứu MaCanHo
                if (MaTang === null) {
                    failedRecords.push({ row, error: `Không tìm thấy Mã Tầng cho Tầng số ${SoTang}.` });
                    continue;
                }

                const maCanHo = chMap.get(`${SoCanHo.toLowerCase()}-${MaTang}`);

                if (!maCanHo || !KyThangStr) {
                    failedRecords.push({ row, error: 'Thiếu MaCanHo hoặc Kỳ Tháng.' });
                    continue;
                }
                

                const KyThang = new Date(KyThangStr);

                // --- 3.1. Tạo Hóa Đơn Chính (HoaDon) ---
                const insertInvoice = transaction.request();
                const hdResult = await insertInvoice
                    .input('MaCanHo', mssql.Int, maCanHo)
                    .input('KyThang', mssql.Date, KyThang)
                    .input('NgayPhatHanh', mssql.Date, NgayPhatHanh)
                    .input('NgayDenHan', mssql.Date, NgayDenHan)
                    .input('TongTien', mssql.Decimal(18, 2), 0) // Tổng tiền ban đầu là 0
                    .query(`INSERT INTO dbo.HoaDon (MaCanHo, KyThang, NgayPhatHanh, NgayDenHan, TongTien) 
                            OUTPUT Inserted.MaHoaDon VALUES (@MaCanHo, @KyThang, @NgayPhatHanh, @NgayDenHan, @TongTien)`);
                
                const maHoaDon = hdResult.recordset[0].MaHoaDon;
                createdInvoicesCount++;

                // --- 3.2. Chèn Chi Tiết (ChiTietHoaDon) ---
                const details = [
                    { name: 'điện', amount: TienDien },
                    { name: 'nước', amount: TienNuoc },
                    { name: 'phí quản lý', amount: PhiQL },
                    { name: 'internet', amount: Net },
                ];

                for (const detail of details) {
                    if (detail.amount > 0) {
                        const dv = dvMap.get(detail.name);
                        
                        if (dv) {
                             const insertDetail = transaction.request();
                             await insertDetail
                                .input('MaHoaDon', mssql.Int, maHoaDon)
                                .input('MaDichVu', mssql.Int, dv.MaDichVu)
                                .input('ThanhTien', mssql.Decimal(18, 2), detail.amount)
                                .query(`INSERT INTO dbo.ChiTietHoaDon (MaHoaDon, MaDichVu, ThanhTien) 
                                        VALUES (@MaHoaDon, @MaDichVu, @ThanhTien)`);
                             createdDetailsCount++;
                        }
                    }
                }
                
                // --- 3.3. Cập nhật Tổng Tiền ---
                const updateTongTien = transaction.request();
                await updateTongTien
                    .input('MaHoaDon', mssql.Int, maHoaDon)
                    .query(`UPDATE dbo.HoaDon
                            SET TongTien = (SELECT SUM(ThanhTien) FROM dbo.ChiTietHoaDon WHERE MaHoaDon = @MaHoaDon)
                            WHERE MaHoaDon = @MaHoaDon`);
            }

            // 4. Kết thúc Transaction
            await transaction.commit();

            res.json({
                message: `Tạo hóa đơn hàng loạt thành công. Tổng cộng: ${createdInvoicesCount} hóa đơn.`,
                detailsCreated: createdDetailsCount,
                failed: failedRecords.length,
                failedRecords
            });

        } catch (err) {
            // Rollback nếu có lỗi trong quá trình lặp
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('SERVER SIDE ERROR:', err);
        res.status(500).send(`Lỗi máy chủ khi xử lý file: ${err.message}.`);
    }
};

module.exports = {
    importInvoicesFromExcel
};