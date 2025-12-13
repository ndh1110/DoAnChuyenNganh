// src/services/aiDataService.js (PHIÊN BẢN CUỐI CÙNG: FIX ĐỊNH DẠNG ĐẦU RA VÀ LỖI KẾT NỐI)

const mssql = require('mssql');
const { pool: dbPool, poolConnect } = require('../dbConfig'); 

/**
 * Hàm trợ giúp để lấy Connection Pool đã kết nối.
 */
const getConnectedPool = async () => {
    await poolConnect;
    return dbPool;
};

// --- HÀM NGHIỆP VỤ CHUNG (GENERAL TOOLS) ---

/**
 * 1. Lấy danh sách các căn hộ còn trống (Chung)
 */
const getEmptyApartments = async () => {
    try {
        const pool = await getConnectedPool(); 
        const query = `
            SELECT TOP 10 
                SoCanHo, LoaiCanHo, DienTich
            FROM dbo.CanHo 
            WHERE MaTrangThai = 8 
            ORDER BY SoCanHo ASC;
        `;
        const result = await pool.request().query(query);

        if (result.recordset.length === 0) {
            return { status: 'success', message: 'Hệ thống hiện không ghi nhận căn hộ nào đang ở trạng thái Trống.' };
        }
        
        // ⭐ ĐỊNH DẠNG ĐẦU RA MỚI ⭐
        const apartmentNumbers = result.recordset.map(r => r.SoCanHo).join(', ');
        const replyMessage = `Hiện có ${result.recordset.length} căn hộ đang trống. Chi tiết: ${apartmentNumbers}.`;

        return {
            status: 'success',
            message: replyMessage, // Trả về dạng ngôn ngữ tự nhiên
            // Vẫn giữ lại dữ liệu thô nếu cần
            raw_data: result.recordset,
        };
    } catch (error) {
        console.error("Lỗi CSDL trong getEmptyApartments:", error);
        return { status: 'error', message: 'Lỗi hệ thống khi truy vấn danh sách căn hộ trống.' };
    }
};

/**
 * 2. Lấy tổng quan hóa đơn chưa thanh toán (Chung)
 */
const getPendingInvoices = async () => {
    try {
        const pool = await getConnectedPool(); 
        const query = `
            SELECT 
                COUNT(MaHoaDon) AS TongSoHoaDonChuaThanhToan, 
                ISNULL(SUM(TongTien), 0) AS TongTienChuaThanhToan
            FROM dbo.HoaDon
            WHERE TrangThai = N'Chờ thanh toán';
        `;
        const result = await pool.request().query(query);

        const summary = result.recordset[0];
        
        // ⭐ ĐỊNH DẠNG ĐẦU RA MỚI ⭐
        const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.TongTienChuaThanhToan);
        const replyMessage = `Hệ thống có tổng cộng ${summary.TongSoHoaDonChuaThanhToan} hóa đơn đang chờ thanh toán, với tổng số tiền là ${formattedAmount}.`;

        return {
            status: 'success',
            message: replyMessage,
            raw_data: summary,
        };
    } catch (error) {
        console.error("Lỗi CSDL trong getPendingInvoices:", error);
        return { status: 'error', message: 'Lỗi hệ thống khi truy vấn tổng quan hóa đơn.' };
    }
};

/**
 * 3. Lấy tổng quan yêu cầu/ý kiến chưa xử lý (Chung)
 */
const getPendingRequests = async () => {
    try {
        const pool = await getConnectedPool(); 
        const query = `
            SELECT 
                TrangThaiThanhChung, COUNT(MaYeuCau) AS SoLuong
            FROM dbo.YeuCau
            WHERE TrangThaiThanhChung IN (N'Mới', N'Đang xử lý')
            GROUP BY TrangThaiThanhChung;
        `;
        const result = await pool.request().query(query);
        
        const summary = { Mới: 0, 'Đang xử lý': 0, TongChuaHoanThanh: 0 };
        result.recordset.forEach(row => {
            summary[row.TrangThaiThanhChung] = row.SoLuong;
            summary.TongChuaHoanThanh += row.SoLuong;
        });

        // ⭐ ĐỊNH DẠNG ĐẦU RA MỚI ⭐
        const replyMessage = `Tổng có ${summary.TongChuaHoanThanh} yêu cầu chưa hoàn thành: ${summary['Mới']} yêu cầu Mới và ${summary['Đang xử lý']} đang được xử lý.`;
        
        return { status: 'success', message: replyMessage, raw_data: summary };
    } catch (error) {
        console.error("Lỗi CSDL trong getPendingRequests:", error);
        return { status: 'error', message: 'Lỗi hệ thống khi truy vấn tổng quan yêu cầu.' };
    }
};

// --- HÀM TRA CỨU NHÂN VIÊN (STAFF TOOLS) ---

/**
 * 4. Lấy thông tin liên hệ cư dân
 */
const getResidentInfo = async (residentId) => {
    try {
        const pool = await getConnectedPool(); 
        const isId = !isNaN(parseInt(residentId));
        const sqlCondition = isId ? `MaNguoiDung = @Query` : `HoTen LIKE N'%' + @Query + N'%'`;

        const querySql = `
            SELECT TOP 1 MaNguoiDung, HoTen, SoDienThoai, Email 
            FROM dbo.NguoiDung 
            WHERE ${sqlCondition}
        `;
        
        const result = await pool.request()
            .input('Query', isId ? mssql.Int : mssql.NVarChar, residentId)
            .query(querySql);

        if (result.recordset.length === 0) {
            return { status: 'success', message: `Không tìm thấy cư dân nào phù hợp với '${residentId}'.` };
        }

        const details = result.recordset[0];
        // ⭐ ĐỊNH DẠNG ĐẦU RA MỚI ⭐
        const replyMessage = `Thông tin liên hệ của ${details.HoTen} (ID: ${details.MaNguoiDung}): SĐT: ${details.SoDienThoai || 'N/A'}, Email: ${details.Email || 'N/A'}.`;

        return { status: 'success', message: replyMessage, raw_data: details };

    } catch (error) {
        console.error("Lỗi CSDL trong getResidentInfo:", error);
        return { status: 'error', message: 'Lỗi hệ thống khi truy vấn liên hệ cư dân.' };
    }
};

/**
 * 5. Lấy thông tin Chủ hộ/Người thuê chính
 */
const getApartmentOwnerInfo = async (MaCanHo) => {
    try {
        const pool = await getConnectedPool(); 
        const query = `
            SELECT TOP 1 
                nd.HoTen, nd.SoDienThoai, nd.Email, lsc.VaiTroCuTru
            FROM dbo.LichSuCuTru lsc
            JOIN dbo.NguoiDung nd ON lsc.MaNguoiDung = nd.MaNguoiDung
            WHERE lsc.MaCanHo = @MaCanHo 
                AND (lsc.VaiTroCuTru = N'Chủ hộ' OR lsc.VaiTroCuTru = N'Cư dân thuê')
                AND (lsc.DenNgay IS NULL OR lsc.DenNgay >= GETDATE())
            ORDER BY lsc.TuNgay DESC;
        `;

        const result = await pool.request().input('MaCanHo', mssql.Int, MaCanHo).query(query);

        if (result.recordset.length === 0) {
            return { status: 'success', message: `Căn hộ ID ${MaCanHo} không có Chủ hộ/Người thuê chính đang cư trú.` };
        }

        const details = result.recordset[0];
        // ⭐ ĐỊNH DẠNG ĐẦU RA MỚI ⭐
        const replyMessage = `Chủ/Thuê chính căn ${MaCanHo} (${details.VaiTroCuTru}): ${details.HoTen}. SĐT: ${details.SoDienThoai || 'N/A'}, Email: ${details.Email || 'N/A'}.`;

        return { status: 'success', message: replyMessage, raw_data: details };

    } catch (error) {
        console.error("Lỗi CSDL trong getApartmentOwnerInfo:", error);
        return { status: 'error', message: 'Lỗi hệ thống khi truy vấn thông tin Chủ hộ.' };
    }
};

/**
 * 6. Lấy ngày hết hạn hợp đồng
 */
const getContractExpiryDate = async (MaCanHo) => {
    try {
        const pool = await getConnectedPool(); 
        const query = `
            SELECT TOP 1 
                Loai, NgayHetHan, NgayKy, MaHopDong
            FROM dbo.HopDong 
            WHERE MaCanHo = @MaCanHo AND (NgayHetHan IS NULL OR NgayHetHan >= GETDATE())
            ORDER BY NgayKy DESC;
        `;
        
        const result = await pool.request().input('MaCanHo', mssql.Int, MaCanHo).query(query);

        if (result.recordset.length === 0) {
            return { status: 'success', message: `Căn hộ ID ${MaCanHo} không có hợp đồng đang hiệu lực.` };
        }

        const contractData = result.recordset[0];
        const NgayHetHanFormatted = contractData.NgayHetHan ? contractData.NgayHetHan.toISOString().split('T')[0] : 'Vô thời hạn';
        
        // ⭐ ĐỊNH DẠNG ĐẦU RA MỚI ⭐
        const replyMessage = `Hợp đồng ${contractData.Loai} (Mã HĐ: ${contractData.MaHopDong}) của căn ${MaCanHo} hết hạn vào ngày ${NgayHetHanFormatted}.`;
        
        return {
            status: 'success',
            message: replyMessage,
            raw_data: contractData,
        };

    } catch (error) {
        console.error("Lỗi CSDL trong getContractExpiryDate:", error);
        return { status: 'error', message: 'Lỗi hệ thống khi truy vấn ngày hết hạn hợp đồng.' };
    }
};

/**
 * 7. Lấy trạng thái yêu cầu bảo trì/sửa chữa
 */
const getWorkRequestStatus = async (MaYeuCau) => {
    try {
        const pool = await getConnectedPool(); 
        const query = `
            SELECT TOP 1 
                Loai, TrangThaiThanhChung, NgayTao, MoTa 
            FROM dbo.YeuCau
            WHERE MaYeuCau = @MaYeuCau;
        `;
        
        const result = await pool.request().input('MaYeuCau', mssql.Int, MaYeuCau).query(query);

        if (result.recordset.length === 0) {
            return { status: 'success', message: `Không tìm thấy Yêu cầu bảo trì/sửa chữa với Mã số ${MaYeuCau}.` };
        }

        const requestData = result.recordset[0];
        const NgayTaoFormatted = requestData.NgayTao.toISOString().split('T')[0];
        
        // ⭐ ĐỊNH DẠNG ĐẦU RA MỚI ⭐
        const replyMessage = `Yêu cầu #${MaYeuCau} (${requestData.Loai}) được tạo ngày ${NgayTaoFormatted} hiện đang ở trạng thái: ${requestData.TrangThaiThanhChung}.`;
        
        return {
            status: 'success',
            message: replyMessage,
            raw_data: requestData,
        };

    } catch (error) {
        console.error("Lỗi CSDL trong getWorkRequestStatus:", error);
        return { status: 'error', message: 'Lỗi hệ thống khi truy vấn trạng thái yêu cầu.' };
    }
};


module.exports = {
    getEmptyApartments,
    getPendingInvoices,
    getPendingRequests,
    getResidentInfo, 
    getApartmentOwnerInfo,
    getContractExpiryDate,
    getWorkRequestStatus,
};