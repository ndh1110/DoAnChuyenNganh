// routes/dieuKhoan.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/dieuKhoanController');

// GET /api/dieukhoan/hopdong/:id (Lấy các điều khoản của Hợp đồng :id)
router.get('/hopdong/:id', controller.getDieuKhoanByHopDongId);

// POST /api/dieukhoan/
router.post('/', controller.createDieuKhoan);

// PUT /api/dieukhoan/:id (Cập nhật điều khoản :id)
router.put('/:id', controller.updateDieuKhoan);

// DELETE /api/dieukhoan/:id (Xóa điều khoản :id)
router.delete('/:id', controller.deleteDieuKhoan);

module.exports = router;