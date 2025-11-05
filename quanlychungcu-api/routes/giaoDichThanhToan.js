// routes/giaoDichThanhToan.js
const express = require('express');
const router = express.Router();
const giaoDichController = require('../controllers/giaoDichThanhToanController');

// GET /api/giaodich/thanhtoan/:id (Lấy các giao dịch của Thanh Toán :id)
router.get('/thanhtoan/:id', giaoDichController.getGiaoDichByThanhToanId);

// POST /api/giaodich/
router.post('/', giaoDichController.createGiaoDichThanhToan);

module.exports = router;