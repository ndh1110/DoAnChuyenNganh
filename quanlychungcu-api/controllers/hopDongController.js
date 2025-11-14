// controllers/hopDongController.js
const mssql = require('mssql');

/**
 * GET /api/hopdong - Lấy tất cả hợp đồng
 * (JOIN với Căn Hộ, Tầng, Block, và Người Dùng/Chủ Hộ)
 */
const getAllHopDong = async (req, res) => {
    try {
        const pool = req.pool;
        const user = req.user; // Lấy thông tin user từ token

        let query = `
            SELECT 
                hd.MaHopDong, hd.Loai, hd.NgayKy, hd.NgayHetHan,
                nd.MaNguoiDung AS MaChuHo, nd.HoTen AS TenChuHo,
                ch.MaCanHo, ch.SoCanHo,
                t.SoTang,
                b.TenBlock
            FROM dbo.HopDong hd
            JOIN dbo.NguoiDung nd ON hd.ChuHoId = nd.MaNguoiDung
            JOIN dbo.CanHo ch ON hd.MaCanHo = ch.MaCanHo
            JOIN dbo.Tang t ON ch.MaTang = t.MaTang
            JOIN dbo.Block b ON t.MaBlock = b.MaBlock
        `;
        
        const request = pool.request();

        // ⭐ LOGIC PHÂN QUYỀN MỚI
        if (user.role === 'Resident') {
            // Cư dân chỉ thấy hợp đồng mà họ là ChuHoId
            query += ' WHERE hd.ChuHoId = @MaNguoiDung';
            request.input('MaNguoiDung', mssql.Int, user.id);
        }

        query += ' ORDER BY hd.NgayKy DESC';
        
        const result = await request.query(query);
        res.json(result.recordset);

    } catch (err) {
        console.error('Lỗi GET all HopDong:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/hopdong/:id - Lấy 1 hợp đồng theo ID
 */
const getHopDongById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaHopDong', mssql.Int, id)
            .query(`
                SELECT 
                    hd.MaHopDong, hd.Loai, hd.NgayKy, hd.NgayHetHan,
                    nd.MaNguoiDung AS MaChuHo, nd.HoTen AS TenChuHo,
                    ch.MaCanHo, ch.SoCanHo,
                    t.SoTang,
                    b.TenBlock
                FROM dbo.HopDong hd
                JOIN dbo.NguoiDung nd ON hd.ChuHoId = nd.MaNguoiDung
                JOIN dbo.CanHo ch ON hd.MaCanHo = ch.MaCanHo
                JOIN dbo.Tang t ON ch.MaTang = t.MaTang
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                WHERE hd.MaHopDong = @MaHopDong
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy hợp đồng');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET HopDong by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/hopdong - Tạo hợp đồng mới
 * Cần: MaCanHo, ChuHoId, Loai, NgayKy, NgayHetHan
 */
const createHopDong = async (req, res) => {
    try {
        const { MaCanHo, ChuHoId, Loai, NgayKy, NgayHetHan } = req.body; 

        if (!MaCanHo || !ChuHoId || !Loai) {
            return res.status(400).send('Thiếu MaCanHo, ChuHoId hoặc Loai');
        }

        const result = await req.pool.request()
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('ChuHoId', mssql.Int, ChuHoId)
            .input('Loai', mssql.NVarChar, Loai)
            .input('NgayKy', mssql.Date, NgayKy) // NgayKy và NgayHetHan có thể NULL
            .input('NgayHetHan', mssql.Date, NgayHetHan)
            .query(`INSERT INTO dbo.HopDong (MaCanHo, ChuHoId, Loai, NgayKy, NgayHetHan) 
                    OUTPUT Inserted.* VALUES (@MaCanHo, @ChuHoId, @Loai, @NgayKy, @NgayHetHan)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST HopDong:', err);
        // Lỗi khóa ngoại (chủ hộ hoặc căn hộ không tồn tại)
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaCanHo hoặc ChuHoId không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/hopdong/:id - Cập nhật hợp đồng
 */
const updateHopDong = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        // 1. Lấy dữ liệu cũ
        const oldDataResult = await pool.request()
            .input('MaHopDong', mssql.Int, id)
            .query('SELECT * FROM dbo.HopDong WHERE MaHopDong = @MaHopDong');

        if (oldDataResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy hợp đồng để cập nhật');
        }
        const oldData = oldDataResult.recordset[0];

        // 2. Trộn dữ liệu (partial update)
        const { MaCanHo, ChuHoId, Loai, NgayKy, NgayHetHan } = req.body;
        const newMaCanHo = MaCanHo !== undefined ? MaCanHo : oldData.MaCanHo;
        const newChuHoId = ChuHoId !== undefined ? ChuHoId : oldData.ChuHoId;
        const newLoai = Loai !== undefined ? Loai : oldData.Loai;
        const newNgayKy = NgayKy !== undefined ? NgayKy : oldData.NgayKy;
        const newNgayHetHan = NgayHetHan !== undefined ? NgayHetHan : oldData.NgayHetHan;

        // 3. Thực thi UPDATE
        const result = await pool.request()
            .input('MaHopDong', mssql.Int, id)
            .input('MaCanHo', mssql.Int, newMaCanHo)
            .input('ChuHoId', mssql.Int, newChuHoId)
            .input('Loai', mssql.NVarChar, newLoai)
            .input('NgayKy', mssql.Date, newNgayKy)
            .input('NgayHetHan', mssql.Date, newNgayHetHan)
            .query(`UPDATE dbo.HopDong 
                    SET MaCanHo = @MaCanHo, ChuHoId = @ChuHoId, Loai = @Loai, 
                        NgayKy = @NgayKy, NgayHetHan = @NgayHetHan
                    OUTPUT Inserted.* WHERE MaHopDong = @MaHopDong`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi PUT HopDong:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaCanHo hoặc ChuHoId không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * DELETE /api/hopdong/:id - Xóa hợp đồng
 */
const deleteHopDong = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cảnh báo: Bảng DieuKhoan phụ thuộc vào HopDong (ON DELETE CASCADE)
        // Khi xóa HopDong, các DieuKhoan liên quan cũng sẽ bị xóa.
        
        const result = await req.pool.request()
            .input('MaHopDong', mssql.Int, id)
            .query('DELETE FROM dbo.HopDong OUTPUT Deleted.* WHERE MaHopDong = @MaHopDong');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy hợp đồng để xóa');
        }
        res.json({ message: 'Đã xóa hợp đồng (và các điều khoản liên quan) thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE HopDong:', err);
        // Bắt lỗi khóa ngoại (nếu có bảng khác tham chiếu đến HopDong mà không có ON DELETE CASCADE)
        if (err.number === 547) {
            return res.status(400).send('Không thể xóa: Hợp đồng này đang được liên kết bởi dữ liệu khác.');
        }
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllHopDong,
    getHopDongById,
    createHopDong,
    updateHopDong,
    deleteHopDong
};