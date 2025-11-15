// routes/khuVucChung.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/khuVucChungController');

// 1. Import Middleware
const { authorize } = require('../middleware/authMiddleware');

// 2. AI CŨNG ĐƯỢC XEM
router.get('/', controller.getAllKhuVucChung);
router.get('/:id', controller.getKhuVucChungById);

// 3. CHỈ QUẢN LÝ/KỸ THUẬT ĐƯỢC THAY ĐỔI
// Cho phép cả 'Kỹ thuật' vì họ cần quản lý khu vực mình phụ trách
const TECH_ROLES = ['Quản lý', 'Admin', 'Kỹ thuật']; 

router.post('/', authorize(...TECH_ROLES), controller.createKhuVucChung);
router.put('/:id', authorize(...TECH_ROLES), controller.updateKhuVucChung);
router.delete('/:id', authorize(...TECH_ROLES), controller.deleteKhuVucChung);

module.exports = router;