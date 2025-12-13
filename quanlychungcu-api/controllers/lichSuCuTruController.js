// controllers/lichSuCuTruController.js
const mssql = require('mssql');

// 1. ĐỊNH NGHĨA GIỚI HẠN CƯ TRÚ THEO LOẠI CĂN HỘ
// Dựa trên LoaiCanHo (ví dụ: 'Studio', '1PN', '2PN', '3PN')
const RESIDENT_LIMITS = {
    'Studio': 2,
    '1PN': 3,
    '2PN': 5,
    '3PN': 7,
    'default': 4
};

const getLimitByApartmentType = (loaiCanHo) => {
    // Trả về giới hạn số người dựa trên loại căn hộ
    // Loại bỏ khoảng trắng và chuyển sang chữ hoa (nếu tên loại căn hộ không thống nhất)
    const key = String(loaiCanHo || '').trim().toUpperCase();
    
    // Tùy chỉnh logic mapping (ví dụ: nếu LoaiCanHo chứa '1PN')
    if (key.includes('1PN')) return RESIDENT_LIMITS['1PN'];
    if (key.includes('2PN')) return RESIDENT_LIMITS['2PN'];
    if (key.includes('3PN')) return RESIDENT_LIMITS['3PN'];
    if (key.includes('STUDIO')) return RESIDENT_LIMITS['Studio'];
    
    return RESIDENT_LIMITS.default;
};

// Hàm tiện ích: Kiểm tra giới hạn cư trú
const checkResidentLimit = async (pool, MaCanHo) => {
    // 1. Lấy thông tin Loại Căn Hộ và GioiHan
    const aptInfoQuery = `
        SELECT LoaiCanHo 
        FROM dbo.CanHo 
        WHERE MaCanHo = @MaCanHo
    `;
    
    const aptInfoResult = await pool.request()
        .input('MaCanHo', mssql.Int, MaCanHo)
        .query(aptInfoQuery);

    if (aptInfoResult.recordset.length === 0) {
        return { canAdd: false, message: 'Không tìm thấy căn hộ.', limit: 0 };
    }
    
    const loaiCanHo = aptInfoResult.recordset[0].LoaiCanHo; // Ví dụ: '2PN'
    const maxLimit = getLimitByApartmentType(loaiCanHo);

    // 2. Đếm số lượng người đang cư trú (active)
    // Điều kiện: DenNgay IS NULL (đang ở) HOẶC DenNgay > Ngày hiện tại
    const countQuery = `
        SELECT COUNT(MaLichSu) AS TotalResidents
        FROM dbo.LichSuCuTru
        WHERE MaCanHo = @MaCanHo
        AND (DenNgay IS NULL OR DenNgay > GETDATE())
    `;

    const countResult = await pool.request()
        .input('MaCanHo', mssql.Int, MaCanHo)
        .query(countQuery);
        
    const currentResidents = countResult.recordset[0].TotalResidents;

    // 3. So sánh
    if (currentResidents >= maxLimit) {
        return { 
            canAdd: false, 
            message: `Căn hộ loại ${loaiCanHo} đã đạt giới hạn cư trú tối đa: ${maxLimit} người.`, 
            limit: maxLimit,
            current: currentResidents
        };
    }
    
    return { canAdd: true, maxLimit, current: currentResidents };
};
/**
 * GET /api/lichsucutru - Lấy tất cả lịch sử cư trú
 * (JOIN với Người Dùng, Căn Hộ, Tầng, Block)
 */
const getAllLichSuCuTru = async (req, res) => {
    try {
        const result = await req.pool.request()
            .query(`
                SELECT 
                    ls.MaLichSu, ls.TuNgay, ls.DenNgay, ls.VaiTroCuTru,
                    nd.MaNguoiDung, nd.HoTen,
                    ch.MaCanHo, ch.SoCanHo,
                    t.SoTang,
                    b.TenBlock
                FROM dbo.LichSuCuTru ls
                JOIN dbo.NguoiDung nd ON ls.MaNguoiDung = nd.MaNguoiDung
                JOIN dbo.CanHo ch ON ls.MaCanHo = ch.MaCanHo
                JOIN dbo.Tang t ON ch.MaTang = t.MaTang
                JOIN dbo.Block b ON t.MaBlock = b.MaBlock
                ORDER BY ls.TuNgay DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi GET all LichSuCuTru:', err);
        res.status(500).send(err.message);
    }
};

/**
 * GET /api/lichsucutru/:id - Lấy 1 lịch sử theo ID (MaLichSu)
 */
const getLichSuCuTruById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaLichSu', mssql.Int, id)
            .query(`
                SELECT 
                    ls.MaLichSu, ls.TuNgay, ls.DenNgay, ls.VaiTroCuTru,
                    nd.MaNguoiDung, nd.HoTen,
                    ch.MaCanHo, ch.SoCanHo
                FROM dbo.LichSuCuTru ls
                JOIN dbo.NguoiDung nd ON ls.MaNguoiDung = nd.MaNguoiDung
                JOIN dbo.CanHo ch ON ls.MaCanHo = ch.MaCanHo
                WHERE ls.MaLichSu = @MaLichSu
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi lịch sử cư trú');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi GET LichSuCuTru by ID:', err);
        res.status(500).send(err.message);
    }
};

/**
 * POST /api/lichsucutru - Thêm bản ghi lịch sử cư trú mới
 * Cần: MaNguoiDung, MaCanHo, TuNgay, VaiTroCuTru (DenNgay có thể NULL)
 */
const createLichSuCuTru = async (req, res) => {
    try {
        const { MaNguoiDung, MaCanHo, TuNgay, DenNgay, VaiTroCuTru } = req.body; 

        if (!MaNguoiDung || !MaCanHo || !TuNgay) {
            return res.status(400).send('Thiếu MaNguoiDung, MaCanHo hoặc TuNgay');
        }

        const result = await req.pool.request()
            .input('MaNguoiDung', mssql.Int, MaNguoiDung)
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('TuNgay', mssql.Date, TuNgay)
            .input('DenNgay', mssql.Date, DenNgay) // Có thể NULL (nghĩa là đang ở)
            .input('VaiTroCuTru', mssql.NVarChar, VaiTroCuTru)
            .query(`INSERT INTO dbo.LichSuCuTru (MaNguoiDung, MaCanHo, TuNgay, DenNgay, VaiTroCuTru) 
                    OUTPUT Inserted.* VALUES (@MaNguoiDung, @MaCanHo, @TuNgay, @DenNgay, @VaiTroCuTru)`);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi POST LichSuCuTru:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaNguoiDung hoặc MaCanHo không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/lichsucutru/:id - Cập nhật lịch sử cư trú
 * (Thường là để cập nhật DenNgay khi chuyển đi, hoặc sửa VaiTroCuTru)
 */
const updateLichSuCuTru = async (req, res) => {
    const { id } = req.params; // MaLichSu
    const { MaNguoiDung, MaCanHo, TuNgay, DenNgay, VaiTroCuTru } = req.body;

    if (!MaNguoiDung || !MaCanHo || !TuNgay || !VaiTroCuTru) {
        return res.status(400).send('Thiếu thông tin bắt buộc.');
    }

    try {
        const pool = req.pool;

        // Kiểm tra logic Gia hạn: DenNgay mới không được nằm trong quá khứ so với ngày hiện tại (trừ khi là null)
        if (DenNgay && new Date(DenNgay) < new Date(new Date().toDateString())) {
            return res.status(400).send('Ngày kết thúc không được nằm trong quá khứ.');
        }

        const result = await pool.request()
            .input('MaLichSu', mssql.Int, id)
            .input('MaNguoiDung', mssql.Int, MaNguoiDung)
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('TuNgay', mssql.Date, TuNgay)
            // Chuyển DenNgay thành NULL nếu nó là chuỗi rỗng hoặc undefined để reset vô thời hạn
            .input('DenNgay', mssql.Date, DenNgay || null)
            .input('VaiTroCuTru', mssql.NVarChar, VaiTroCuTru)
            .query(`
                UPDATE dbo.LichSuCuTru 
                SET MaNguoiDung = @MaNguoiDung, MaCanHo = @MaCanHo, TuNgay = @TuNgay,
                    DenNgay = @DenNgay, VaiTroCuTru = @VaiTroCuTru
                OUTPUT Inserted.* WHERE MaLichSu = @MaLichSu
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi cần cập nhật.');
        }

        res.json({ message: 'Cập nhật lịch sử cư trú thành công.', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi PUT LichSuCuTru:', err);
        if (err.number === 547) {
            return res.status(400).send('Lỗi Khóa Ngoại: MaNguoiDung hoặc MaCanHo không tồn tại.');
        }
        res.status(500).send(err.message);
    }
};

/**
 * PUT /api/lichsucutru/end/:id
 * Kết thúc cư trú (Soft Delete - Dùng để đánh dấu cư dân chuyển đi)
 */
const endResidency = async (req, res) => {
    try {
        const { id } = req.params; // MaLichSu
        const pool = req.pool;

        // 1. KIỂM TRA VAI TRÒ CƯ DÂN TRƯỚC
        const checkRoleQuery = `
            SELECT VaiTroCuTru FROM dbo.LichSuCuTru WHERE MaLichSu = @MaLichSu
        `;
        const roleResult = await pool.request()
            .input('MaLichSu', mssql.Int, id)
            .query(checkRoleQuery);

        if (roleResult.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi cư trú này.');
        }

        const currentRole = roleResult.recordset[0].VaiTroCuTru;

        // ⭐ LƯỠNG PHÂN: Nếu là Chủ hộ, CHẶN THAO TÁC ⭐
        if (currentRole.includes('Chủ hộ')) {
            return res.status(400).send('Không thể kết thúc cư trú. Cư dân này là Chủ hộ, cần thực hiện chuyển nhượng/bán căn hộ thông qua Hợp đồng để thay đổi trạng thái cư trú.');
        }
        
        // 2. THỰC HIỆN CẬP NHẬT DenNgay (Soft Delete)
        const result = await pool.request()
            .input('MaLichSu', mssql.Int, id)
            .input('NgayKetThuc', mssql.Date, new Date().toDateString())
            .query(`
                UPDATE dbo.LichSuCuTru 
                SET DenNgay = @NgayKetThuc 
                OUTPUT Inserted.*
                WHERE MaLichSu = @MaLichSu
            `);
        
        if (result.recordset.length === 0) {
            return res.status(500).send('Cập nhật thất bại sau khi kiểm tra vai trò.');
        }
        
        res.json({ message: 'Đã xác nhận cư dân chuyển đi (Kết thúc cư trú).', data: result.recordset[0] });
    } catch (err) {
        // AxiosError có thể do lỗi 500 ở đây
        console.error('Lỗi Backend khi kết thúc cư trú:', err); 
        res.status(500).send(err.message);
    }
};
/**
 * DELETE /api/lichsucutru/:id - Xóa bản ghi lịch sử
 */
const deleteLichSuCuTru = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.pool.request()
            .input('MaLichSu', mssql.Int, id)
            .query('DELETE FROM dbo.LichSuCuTru OUTPUT Deleted.* WHERE MaLichSu = @MaLichSu');

        if (result.recordset.length === 0) {
            return res.status(404).send('Không tìm thấy bản ghi lịch sử để xóa');
        }
        res.json({ message: 'Đã xóa bản ghi lịch sử cư trú thành công', data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi DELETE LichSuCuTru:', err);
        res.status(500).send(err.message);
    }
};


const addResidentMember = async (req, res) => {
    const { MaCanHo, MaNguoiDung, VaiTroCuTru, TuNgay, DenNgay } = req.body;
    
    // Kiểm tra đầu vào
    if (!MaCanHo || !MaNguoiDung || !VaiTroCuTru || !TuNgay) {
        return res.status(400).send('Thiếu thông tin bắt buộc: MaCanHo, MaNguoiDung, VaiTroCuTru, TuNgay.');
    }

    try {
        const pool = req.pool;
        
        //  KIỂM TRA TRẠNG THÁI CĂN HỘ (NGĂN THÊM VÀO CĂN HỘ TRỐNG) ⭐
        const checkStatusQuery = `
            SELECT MaTrangThai FROM dbo.CanHo WHERE MaCanHo = @MaCanHo
        `;
        const statusResult = await pool.request()
            .input('MaCanHo', mssql.Int, MaCanHo)
            .query(checkStatusQuery);

        const apartmentStatusId = statusResult.recordset[0]?.MaTrangThai;
        // Giả định MaTrangThai = 8 là "Trống"
        if (apartmentStatusId === 8) { 
             return res.status(400).send('Không thể thêm cư dân. Căn hộ đang ở trạng thái "Trống" và chưa có chủ sở hữu hợp pháp.');
        }
        if (apartmentStatusId === undefined) {
             return res.status(404).send('Không tìm thấy căn hộ này.');
        }


        // 1. KIỂM TRA GIỚI HẠN TRƯỚC KHI THÊM (Logic hiện tại đã có)
        const limitCheck = await checkResidentLimit(pool, MaCanHo);
        
        if (!limitCheck.canAdd) {
            return res.status(400).json({ 
                message: limitCheck.message,
                limitDetails: { 
                    max: limitCheck.maxLimit, 
                    current: limitCheck.current 
                }
            });
        }
        
        // 2. THỰC HIỆN INSERT VÀO LỊCH SỬ CƯ TRÚ
        const request = pool.request();
        const result = await request
            .input('MaCanHo', mssql.Int, MaCanHo)
            .input('MaNguoiDung', mssql.Int, MaNguoiDung)
            .input('VaiTroCuTru', mssql.NVarChar, VaiTroCuTru)
            .input('TuNgay', mssql.Date, TuNgay)
            .input('DenNgay', mssql.Date, DenNgay || null) 
            .query(`
                INSERT INTO dbo.LichSuCuTru (MaCanHo, MaNguoiDung, VaiTroCuTru, TuNgay, DenNgay)
                OUTPUT Inserted.*
                VALUES (@MaCanHo, @MaNguoiDung, @VaiTroCuTru, @TuNgay, @DenNgay)
            `);

        res.status(201).json({ 
            message: 'Thêm cư dân thành công vào Lịch sử Cư trú.', 
            newRecord: result.recordset[0] 
        });

    } catch (err) {
        console.error('Lỗi ADD RESIDENT MEMBER:', err);
        if (err.number === 2627) {
             return res.status(400).send('Cư dân này đã có lịch sử cư trú hiện tại tại căn hộ này.');
        }
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllLichSuCuTru,
    getLichSuCuTruById,
    createLichSuCuTru,
    updateLichSuCuTru,
    deleteLichSuCuTru,
    addResidentMember,
    endResidency, // ⭐ EXPORT HÀM MỚI ⭐
};