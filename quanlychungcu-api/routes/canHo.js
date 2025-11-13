// routes/canHo.js
const express = require('express');
const router = express.Router();
const canHoController = require('../controllers/canHoController');
const multer = require('multer');
// 1. Import authorize middleware
const { authorize } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// === PHẦN 1: AI CŨNG ĐƯỢC TRUY CẬP (Đã đăng nhập) ===
router.get('/', canHoController.getAllCanHo);
router.get('/:id', canHoController.getCanHoById);

// === PHẦN 2: CHỈ QUẢN LÝ MỚI ĐƯỢC THAO TÁC ===
// Các lệnh dưới đây sẽ yêu cầu quyền 'Quản lý' (hoặc Admin)
router.use(authorize('Quản lý', 'Admin')); 

router.post('/', canHoController.createCanHo);
router.put('/:id', canHoController.updateCanHo);
router.delete('/:id', canHoController.deleteCanHo);

// Route Import Excel cũng cần bảo vệ
router.post('/import-excel', upload.single('file'), canHoController.importFromExcel);

module.exports = router;