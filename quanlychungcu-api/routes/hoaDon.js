// routes/hoaDon.js
const express = require('express');
const router = express.Router();
const hoaDonController = require('../controllers/hoaDonController');
const chiTietHoaDonController = require('../controllers/chiTietHoaDonController');

// === Routes cho Hóa Đơn (Bảng chính) ===

// GET /api/hoadon/
router.get('/', hoaDonController.getAllHoaDon);

// GET /api/hoadon/:id
router.get('/:id', hoaDonController.getHoaDonById);

// POST /api/hoadon/
router.post('/', hoaDonController.createHoaDon);

// DELETE /api/hoadon/:id
router.delete('/:id', hoaDonController.deleteHoaDon);


// === Routes cho Chi Tiết Hóa Đơn (Bảng con) ===

// POST /api/hoadon/:id/chitiet (Thêm chi tiết vào hóa đơn :id)
router.post('/:id/chitiet', chiTietHoaDonController.addChiTietHoaDon);

module.exports = router;