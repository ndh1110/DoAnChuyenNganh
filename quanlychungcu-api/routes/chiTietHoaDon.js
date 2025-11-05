// routes/chiTietHoaDon.js
const express = require('express');
const router = express.Router();
const chiTietHoaDonController = require('../controllers/chiTietHoaDonController');

// DELETE /api/chitiet-hoadon/:maCT (Xóa 1 dòng chi tiết theo MaCT của nó)
router.delete('/:maCT', chiTietHoaDonController.deleteChiTietHoaDon);

module.exports = router;