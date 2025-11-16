// routes/bangGia.js
const express = require('express');
const router = express.Router();
const bangGiaController = require('../controllers/bangGiaController');
const { authorize } = require('../middleware/authMiddleware');

// === 1. AI CŨNG ĐƯỢC XEM ===
router.get('/', bangGiaController.getAllBangGia);
router.get('/:id', bangGiaController.getBangGiaById);

// === 2. CHỈ QUẢN LÝ/ADMIN ĐƯỢC THAO TÁC ===
router.post('/', authorize('Quản lý', 'Admin'), bangGiaController.createBangGia);
router.put('/:id', authorize('Quản lý', 'Admin'), bangGiaController.updateBangGia);
router.delete('/:id', authorize('Quản lý', 'Admin'), bangGiaController.deleteBangGia);

module.exports = router;