// routes/phanCong.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/phanCongController');

// GET /api/phancong/
router.get('/', controller.getAllPhanCong);

// GET /api/phancong/nhanvien/:id (Lấy phân công của 1 nhân viên)
router.get('/nhanvien/:id', controller.getPhanCongByNhanVienId);

// POST /api/phancong/
router.post('/', controller.createPhanCong);

// PUT /api/phancong/:id
router.put('/:id', controller.updatePhanCong);

// DELETE /api/phancong/:id
router.delete('/:id', controller.deletePhanCong);

module.exports = router;