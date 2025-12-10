// controllers/hoaDonController.js
const mssql = require('mssql');

/**
 * GET /api/hoadon - Lấy tất cả hóa đơn (Cho Quản lý)
 */
const getAllHoaDon = async (req, res) => {
    try {
        const pool = req.pool;
        const user = req.user; 

        let query = `
            SELECT 
                hd.MaHoaDon, hd.KyThang, hd.NgayPhatHanh, hd.NgayDenHan, hd.TongTien,
                hd.TrangThai,
                ch.MaCanHo, ch.SoCanHo,
                t.SoTang,
                b.TenBlock
            FROM dbo.HoaDon hd
            JOIN dbo.CanHo ch ON hd.MaCanHo = ch.MaCanHo
            JOIN dbo.Tang t ON ch.MaTang = t.MaTang
            JOIN dbo.Block b ON t.MaBlock = b.MaBlock
        `;
        
        const request = pool.request();

        // Logic này chỉ dành cho Quản lý (vì Cư dân bị chặn bởi route)
        // (Chúng ta sẽ sao chép logic lọc của Cư dân xuống hàm getMyHoaDon)

        query += ' ORDER BY hd.KyThang DESC, ch.SoCanHo';
        
        const result = await request.query(query);
        res.json(result.recordset);

    } catch (err) {
        console.error('Lỗi GET all HoaDon:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/hoadon/:id - Lấy 1 hóa đơn theo ID (Cho Quản lý)
 */
const getHoaDonById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        const hoaDonResult = await pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .query(`
                SELECT 
                    hd.MaHoaDon, hd.KyThang, hd.NgayPhatHanh, hd.NgayDenHan, hd.TongTien,
                    hd.TrangThai,
                    ch.MaCanHo, ch.SoCanHo,
                    t.SoTang,
                    b.TenBlock
                FROM dbo.HoaDon hd
                JOIN dbo.CanHo ch ON hd.MaCanHo = ch.MaCanHo
                JOIN dbo.Tang t ON ch.MaTang = t.MaTang
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                WHERE hd.MaHoaDon = @MaHoaDon
            `);
        
        if (hoaDonResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy hóa đơn');
        }

        const chiTietResult = await pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .query(`
                SELECT 
                    ct.MaCT, ct.ThanhTien, ct.MaChiSo,
                    dv.MaDichVu, dv.TenDichVu, dv.DonViMacDinh
                FROM dbo.ChiTietHoaDon ct
                JOIN dbo.DichVu dv ON ct.MaDichVu = dv.MaDichVu
                WHERE ct.MaHoaDon = @MaHoaDon
            `);

        const hoaDon = hoaDonResult.recordset[0];
        hoaDon.ChiTiet = chiTietResult.recordset;

        res.json(hoaDon);

    } catch (err) {
        console.error('Lỗi GET HoaDon by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/hoadon - Tạo hóa đơn mới (Cho Quản lý)
 */
const createHoaDon = async (req, res) => {
    try {
        const { MaCanHo, KyThang, NgayPhatHanh, NgayDenHan } = req.body; 

        if (!MaCanHo || !KyThang || !NgayPhatHanh || !NgayDenHan) {
            return res.status(400).send('Thiếu thông tin bắt buộc');
        }

        const result = await req.pool.request()
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('KyThang', mssql.Date, KyThang)
            .input('NgayPhatHanh', mssql.Date, NgayPhatHanh)
            .input('NgayDenHan', mssql.Date, NgayDenHan)
            .input('TongTien', mssql.Decimal(18, 2), 0)
            .query(`INSERT INTO dbo.HoaDon (MaCanHo, KyThang, NgayPhatHanh, NgayDenHan, TongTien) 
                    OUTPUT Inserted.* VALUES (@MaCanHo, @KyThang, @NgayPhatHanh, @NgayDenHan, @TongTien)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST HoaDon:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaCanHo không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/hoadon/:id - Xóa hóa đơn (Cho Quản lý)
 */
const deleteHoaDon = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .query('DELETE FROM dbo.HoaDon OUTPUT Deleted.* WHERE MaHoaDon = @MaHoaDon');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy hóa đơn để xóa');
        }
        res.json({ message: 'Đã xóa hóa đơn thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE HoaDon:', err);
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/hoadon/:id/status - Cập nhật trạng thái (Cho Quản lý)
 */
const updateHoaDonStatus = async (req, res) => {
    try {
        const { id } = req.params; // MaHoaDon
        const { TrangThai } = req.body;

        if (!TrangThai) {
            return res.status(400).send('Thiếu TrangThai');
        }

        const result = await req.pool.request()
            .input('MaHoaDon', mssql.Int, id)
            .input('TrangThai', mssql.NVarChar, TrangThai)
            .query(`UPDATE dbo.HoaDon 
                    SET TrangThai = @TrangThai
                    OUTPUT Inserted.* WHERE MaHoaDon = @MaHoaDon`);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy hóa đơn để cập nhật');
        }
        
        res.json(result.recordset[0]);

    } catch (err) {
        console.error('Lỗi PUT HoaDon Status:', err);
        res.status(500).send(err.message);
    }
};

// =============================================
// ⭐ HÀM ĐÃ SỬA CHO CƯ DÂN
// =============================================
/**
 * @desc    Cư dân (đã đăng nhập) tự lấy hóa đơn của mình
 * @route   GET /api/my/hoadon
 * @access  Private (Cư dân)
 */
const getMyHoaDon = async (req, res) => {
  try {
    const pool = req.pool;
    const maNguoiDung = req.user.id; 

    // Lấy tham số chuỗi trạng thái từ Frontend
    const { TrangThai } = req.query; // Ví dụ: 'Chờ thanh toán'

    const request = pool.request();
    request.input('MaNguoiDung', mssql.Int, maNguoiDung);

    let query = `
        SELECT 
            hd.MaHoaDon, hd.KyThang, hd.NgayPhatHanh, hd.NgayDenHan, hd.TongTien,
            hd.TrangThai, -- Cột này là INT, lưu ID trạng thái
            ch.MaCanHo, ch.SoCanHo,
            t.SoTang,
            b.TenBlock
        FROM dbo.HoaDon hd
        JOIN dbo.CanHo ch ON hd.MaCanHo = ch.MaCanHo
        JOIN dbo.Tang t ON ch.MaTang = t.MaTang
        JOIN dbo.Block b ON t.MaBlock = b.MaBlock
    `;

    // 4. LOGIC LỌC CƯ DÂN (Đã sửa lỗi ChuHoId)
    query += ` 
        WHERE ch.MaCanHo IN (
            SELECT MaCanHo FROM dbo.HopDong 
            -- Đảm bảo kiểm tra cả BenB_Id (mua/thuê) và BenA_Id (chủ nhà cho thuê)
            WHERE BenB_Id = @MaNguoiDung OR BenA_Id = @MaNguoiDung
        )
    `;

    // 5. Thêm logic lọc TrangThai (SỬA LỖI CHUYỂN ĐỔI KIỂU DỮ LIỆU)
    if (TrangThai) {
        // Khai báo tham số NVARCHAR
        request.input('TrangThaiFilter', mssql.NVarChar, TrangThai);
        
        // Lọc an toàn: Dùng truy vấn phụ để tìm ID trạng thái (INT) từ tên (NVARCHAR)
        query += ` 
            AND hd.TrangThai IN (
                SELECT MaTrangThai 
                FROM dbo.TrangThai 
                WHERE Ten = @TrangThaiFilter
            )
        `;
    }

    query += ' ORDER BY hd.KyThang DESC, ch.SoCanHo';
    
    const result = await request.query(query);
    
    res.status(200).json(result.recordset);

  } catch (error) {
    console.error("Lỗi khi Cư dân lấy hóa đơn (getMyHoaDon):", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ. Vui lòng kiểm tra log server." });
  }
};

// Export tất cả các hàm
module.exports = {
    getAllHoaDon,
    getHoaDonById,
    createHoaDon,
    deleteHoaDon,
    updateHoaDonStatus,
    getMyHoaDon
};