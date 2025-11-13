const express = require('express');
const router = express.Router();
const tangController = require('../controllers/tangController');
const { authorize } = require('../middleware/authMiddleware');

// 1. AI CŨNG XEM ĐƯỢC (Chỉ cần đăng nhập - đã qua bước 'protect' ở server.js)
router.get('/', tangController.getAllTangs); 
router.get('/block/:id', tangController.getTangsByBlockId); // <-- API bị lỗi của bạn nằm ở đây

// 2. CHỈ QUẢN LÝ MỚI ĐƯỢC THÊM/SỬA/XÓA
// Áp dụng authorize('Quản lý') cho các route bên dưới
router.use(authorize('Quản lý')); 

router.post('/', tangController.createTang);
router.delete('/:id', tangController.deleteTang);

module.exports = router;