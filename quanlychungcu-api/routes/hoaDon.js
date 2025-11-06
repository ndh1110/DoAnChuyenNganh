// routes/hoaDon.js
const express = require('express');
const router = express.Router();
const hoaDonController = require('../controllers/hoaDonController');
const chiTietHoaDonController = require('../controllers/chiTietHoaDonController');

// === Routes cho Hóa Đơn (Bảng chính) ===

router.get('/', hoaDonController.getAllHoaDon);
router.get('/:id', hoaDonController.getHoaDonById);
router.post('/', hoaDonController.createHoaDon);
router.delete('/:id', hoaDonController.deleteHoaDon);

// =============================================
// ⭐ ROUTE MỚI: Cập nhật trạng thái
// =============================================
// PUT /api/hoadon/:id/status
router.put('/:id/status', hoaDonController.updateHoaDonStatus);


// === Routes cho Chi Tiết Hóa Đơn (Bảng con) ===

// POST /api/hoadon/:id/chitiet
router.post('/:id/chitiet', chiTietHoaDonController.addChiTietHoaDon);

module.exports = router;