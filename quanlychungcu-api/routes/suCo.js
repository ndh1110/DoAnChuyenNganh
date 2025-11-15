// routes/suCo.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/suCoController'); // Đảm bảo bạn đã có controller này
const { authorize } = require('../middleware/authMiddleware');

// 1. AI CŨNG ĐƯỢC XEM (GET) & BÁO CÁO (POST)
router.get('/', controller.getAllSuCo);
router.get('/:id', controller.getSuCoById);
router.post('/', controller.createSuCo); // Cư dân báo sự cố tại đây

// 2. CHỈ KỸ THUẬT/QUẢN LÝ ĐƯỢC SỬA TRẠNG THÁI/XÓA
const TECH_ROLES = ['Quản lý', 'Admin', 'Kỹ thuật'];

router.put('/:id', authorize(...TECH_ROLES), controller.updateSuCo);
router.delete('/:id', authorize(...TECH_ROLES), controller.deleteSuCo);

module.exports = router;