// routes/hoaDon.js
const express = require('express');
const router = express.Router();
const hoaDonController = require('../controllers/hoaDonController');
const chiTietHoaDonController = require('../controllers/chiTietHoaDonController');

// === Routes cho HĂ³a ÄÆ¡n (Báº£ng chĂ­nh) ===

router.get('/', hoaDonController.getAllHoaDon);
router.get('/:id', hoaDonController.getHoaDonById);
router.post('/', hoaDonController.createHoaDon);
router.delete('/:id', hoaDonController.deleteHoaDon);

// =============================================
// â­ ROUTE Má»I: Cáº­p nháº­t tráº¡ng thĂ¡i
// =============================================
// PUT /api/hoadon/:id/status
router.put('/:id/status', hoaDonController.updateHoaDonStatus);


// === Routes cho Chi Tiáº¿t HĂ³a ÄÆ¡n (Báº£ng con) ===

// POST /api/hoadon/:id/chitiet
router.post('/:id/chitiet', chiTietHoaDonController.addChiTietHoaDon);

module.exports = router;