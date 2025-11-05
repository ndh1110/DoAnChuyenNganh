// routes/thanhToan.js
const express = require('express');
const router = express.Router();
const thanhToanController = require('../controllers/thanhToanController');

// GET /api/thanhtoan/hoadon/:id (Lấy các thanh toán của Hóa Đơn :id)
router.get('/hoadon/:id', thanhToanController.getThanhToanByHoaDonId);

// GET /api/thanhtoan/:id (Lấy thanh toán theo MaThanhToan)
router.get('/:id', thanhToanController.getThanhToanById);

// POST /api/thanhtoan/
router.post('/', thanhToanController.createThanhToan);

// DELETE /api/thanhtoan/:id (Xóa thanh toán theo MaThanhToan)
router.delete('/:id', thanhToanController.deleteThanhToan);

module.exports = router;