// controllers/hopDongController.js
const mssql = require('mssql');

// GET ALL
const getAllHopDong = async (req, res) => {
    try {
        const pool = req.pool;
        const user = req.user;

        let query = `
            SELECT 
                hd.MaHopDong, hd.SoHopDong, hd.Loai, 
                hd.GiaTriHopDong, hd.SoTienCoc,
                hd.NgayKy, hd.NgayHetHan,
                
                -- Bên B (Khách mua/thuê - ChuHoId cũ)
                ndB.MaNguoiDung AS BenB_Id, ndB.HoTen AS TenBenB,

                -- Bên A (Chủ nhà - BenA_Id mới)
                ndA.MaNguoiDung AS BenA_Id, ndA.HoTen AS TenBenA,

                ch.MaCanHo, ch.SoCanHo, b.TenBlock
            FROM dbo.HopDong hd
            LEFT JOIN dbo.NguoiDung ndB ON hd.BenB_Id = ndB.MaNguoiDung 
            LEFT JOIN dbo.NguoiDung ndA ON hd.BenA_Id = ndA.MaNguoiDung 
            JOIN dbo.CanHo ch ON hd.MaCanHo = ch.MaCanHo
            JOIN dbo.Tang t ON ch.MaTang = t.MaTang
            JOIN dbo.Block b ON t.MaBlock = b.MaBlock
        `;
        
        const request = pool.request();

        // Phân quyền xem: Cư dân chỉ thấy nếu mình là Bên A hoặc Bên B
        if (user && user.role === 'Resident') {
            query += ' WHERE hd.BenB_Id = @UserId OR hd.BenA_Id = @UserId';
            request.input('UserId', mssql.Int, user.id);
        }

        query += ' ORDER BY hd.NgayKy DESC';
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err); res.status(500).send(err.message);
    }
};

// GET BY ID
const getHopDongById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaHopDong', mssql.Int, id)
            .query(`
                SELECT 
                    hd.*,
                    ndB.HoTen AS TenBenB,
                    ndA.HoTen AS TenBenA,
                    ch.SoCanHo, b.TenBlock
                FROM dbo.HopDong hd
                LEFT JOIN dbo.NguoiDung ndB ON hd.BenB_Id = ndB.MaNguoiDung
                LEFT JOIN dbo.NguoiDung ndA ON hd.BenA_Id = ndA.MaNguoiDung
                JOIN dbo.CanHo ch ON hd.MaCanHo = ch.MaCanHo
                JOIN dbo.Block b ON ch.MaBlock = b.MaBlock
                WHERE hd.MaHopDong = @MaHopDong
            `);
        if (result.recordset.length === 0) return res.status(404).send('Không tìm thấy');
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err); res.status(500).send(err.message);
    }
};

// CREATE (Transaction: Hợp đồng + Điều khoản)
const createHopDong = async (req, res) => {
    const transaction = new mssql.Transaction(req.pool);
    try {
        // Nhận BenB_Id từ body (thay vì ChuHoId)
        const { 
            SoHopDong, MaCanHo, BenB_Id, BenA_Id,
            Loai, GiaTriHopDong, SoTienCoc, 
            NgayKy, NgayHetHan, DieuKhoans 
        } = req.body; 

        if (!MaCanHo || !BenB_Id || !Loai || !SoHopDong) {
            return res.status(400).send('Thiếu thông tin bắt buộc');
        }

        await transaction.begin();

        const requestHD = new mssql.Request(transaction);
        const resultHD = await requestHD
            .input('SoHopDong', mssql.NVarChar, SoHopDong)
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('BenB_Id', mssql.Int, BenB_Id) 
            .input('BenA_Id', mssql.Int, BenA_Id || null)
            .input('Loai', mssql.NVarChar, Loai)
            .input('GiaTriHopDong', mssql.Decimal(18, 2), GiaTriHopDong)
            .input('SoTienCoc', mssql.Decimal(18, 2), SoTienCoc)
            .input('NgayKy', mssql.Date, NgayKy)
            .input('NgayHetHan', mssql.Date, NgayHetHan)
            .query(`
                INSERT INTO dbo.HopDong (
                    SoHopDong, MaCanHo, BenB_Id, BenA_Id, Loai, 
                    GiaTriHopDong, SoTienCoc, NgayKy, NgayHetHan
                ) 
                OUTPUT Inserted.MaHopDong
                VALUES (
                    @SoHopDong, @MaCanHo, @BenB_Id, @BenA_Id, @Loai, 
                    @GiaTriHopDong, @SoTienCoc, @NgayKy, @NgayHetHan
                )
            `); 
        
        const newMaHopDong = resultHD.recordset[0].MaHopDong;

        if (DieuKhoans && Array.isArray(DieuKhoans) && DieuKhoans.length > 0) {
            for (const noiDung of DieuKhoans) {
                const requestDK = new mssql.Request(transaction);
                await requestDK
                    .input('MaHopDong', mssql.Int, newMaHopDong)
                    .input('NoiDung', mssql.NVarChar, noiDung)
                    .query(`INSERT INTO dbo.DieuKhoan (MaHopDong, NoiDung) VALUES (@MaHopDong, @NoiDung)`);
            }
        }

        await transaction.commit();
        res.status(201).json({ message: 'Thành công', MaHopDong: newMaHopDong });
    } catch (err) {
        if (transaction.active) await transaction.rollback();
        console.error(err);
        if (err.number === 547) return res.status(400).send('Lỗi dữ liệu không tồn tại.');
        res.status(500).send(err.message);
    }
};

// UPDATE
const updateHopDong = async (req, res) => {
    try {
        const { id } = req.params;
        const { NgayKy, NgayHetHan, GiaTriHopDong, SoTienCoc } = req.body;
        const pool = req.pool;
        
        const result = await pool.request()
            .input('MaHopDong', mssql.Int, id)
            .input('NgayKy', mssql.Date, NgayKy)
            .input('NgayHetHan', mssql.Date, NgayHetHan)
            .input('GiaTriHopDong', mssql.Decimal(18, 2), GiaTriHopDong)
            .input('SoTienCoc', mssql.Decimal(18, 2), SoTienCoc)
            .query(`UPDATE dbo.HopDong SET NgayKy=@NgayKy, NgayHetHan=@NgayHetHan, GiaTriHopDong=@GiaTriHopDong, SoTienCoc=@SoTienCoc WHERE MaHopDong=@MaHopDong`);
        
        res.json({ message: 'Cập nhật thành công' });
    } catch (err) { res.status(500).send(err.message); }
};

// DELETE
const deleteHopDong = async (req, res) => {
     try {
        const { id } = req.params;
        const result = await req.pool.request().input('MaHopDong', mssql.Int, id).query('DELETE FROM dbo.HopDong OUTPUT Deleted.* WHERE MaHopDong = @MaHopDong');
        if (result.recordset.length === 0) return res.status(404).send('Không tìm thấy');
        res.json({ message: 'Đã xóa' });
    } catch (err) { res.status(500).send(err.message); }
};

module.exports = { getAllHopDong, getHopDongById, createHopDong, updateHopDong, deleteHopDong };