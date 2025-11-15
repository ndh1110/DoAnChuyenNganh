const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');
const { authorize } = require('../middleware/authMiddleware'); // Import authorize

// 1. GET: Cho phép tất cả User đã đăng nhập (vì server.js đã có 'protect')
router.get('/', blockController.getAllBlocks);
router.get('/:id', blockController.getBlockById);

// 2. CUD (Thêm/Sửa/Xóa): Chỉ cho phép Quản lý
router.post('/', authorize('Quản lý'), blockController.createBlock);
router.post('/setup', authorize('Quản lý'), blockController.setupBlockWithApartments); // Nếu có API setup
router.put('/:id', authorize('Quản lý'), blockController.updateBlock);
router.delete('/:id', authorize('Quản lý'), blockController.deleteBlock);

module.exports = router;

