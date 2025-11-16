// routes/dichVu.js
const express = require('express');
const router = express.Router();
const dichVuController = require('../controllers/dichVuController');
const { authorize } = require('../middleware/authMiddleware'); // Import middleware

// === 1. AI CŨNG ĐƯỢC XEM (Chỉ cần đăng nhập - đã qua bước 'protect' ở server.js) ===
router.get('/', dichVuController.getAllDichVu);
router.get('/:id', dichVuController.getDichVuById);

// === 2. CHỈ QUẢN LÝ/ADMIN ĐƯỢC THÊM, SỬA, XÓA ===
router.post('/', authorize('Quản lý', 'Admin'), dichVuController.createDichVu);
router.put('/:id', authorize('Quản lý', 'Admin'), dichVuController.updateDichVu);
router.delete('/:id', authorize('Quản lý', 'Admin'), dichVuController.deleteDichVu);

module.exports = router;