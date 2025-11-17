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
    // 1. Lấy pool và user ID
    const pool = req.pool;
    const maNguoiDung = req.user.id; // Từ middleware 'protect'

    // 2. Lấy tham số lọc (nếu có)
    const { TrangThai } = req.query;

    const request = pool.request();

    // 3. Xây dựng câu query (Tương tự getAllHoaDon)
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

    // 4. THÊM LOGIC LỌC CHO CƯ DÂN
    // (Sao chép logic lọc Cư dân từ hàm getAllHoaDon cũ)
    // Cư dân chỉ thấy hóa đơn của các căn hộ họ làm chủ hộ (trong Hợp Đồng)
    query += ` 
        JOIN dbo.HopDong hd_filter ON ch.MaCanHo = hd_filter.MaCanHo
        WHERE hd_filter.ChuHoId = @MaNguoiDung
    `;
    request.input('MaNguoiDung', mssql.Int, maNguoiDung);

    // 5. Thêm logic lọc TrangThai (nếu có)
    if (TrangThai) {
      // Lưu ý: Phải dùng 'AND' vì mệnh đề 'WHERE' đã tồn tại
      query += ` AND hd.TrangThai = @TrangThai`;
      request.input('TrangThai', mssql.NVarChar, TrangThai);
    }

    query += ' ORDER BY hd.KyThang DESC, ch.SoCanHo';
    
    const result = await request.query(query);
    
    // 6. Trả về mảng (dù là rỗng)
    res.status(200).json(result.recordset);

  } catch (error) {
    console.error("Lỗi khi Cư dân lấy hóa đơn (getMyHoaDon):", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
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