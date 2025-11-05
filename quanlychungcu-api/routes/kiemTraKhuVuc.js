// routes/kiemTraKhuVuc.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/kiemTraKhuVucController');

// GET /api/kiemtra/
router.get('/', controller.getAllKiemTra);

// GET /api/kiemtra/khuvuc/:id (Lấy các lần kiểm tra của 1 khu vực)
router.get('/khuvuc/:id', controller.getKiemTraByKhuVucId);

// POST /api/kiemtra/
router.post('/', controller.createKiemTra);

// DELETE /api/kiemtra/:id
router.delete('/:id', controller.deleteKiemTra);

module.exports = router;