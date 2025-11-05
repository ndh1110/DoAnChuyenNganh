// routes/lichTruc.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/lichTrucController');

// GET /api/lichtruc/
router.get('/', controller.getAllLichTruc);

// GET /api/lichtruc/nhanvien/:id (Lấy lịch trực của 1 nhân viên)
router.get('/nhanvien/:id', controller.getLichTrucByNhanVienId);

// POST /api/lichtruc/
router.post('/', controller.createLichTruc);

// PUT /api/lichtruc/:id
router.put('/:id', controller.updateLichTruc);

// DELETE /api/lichtruc/:id
router.delete('/:id', controller.deleteLichTruc);

module.exports = router;