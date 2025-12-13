// routes/lichSuCuTru.js (Phiên bản đã bổ sung Route Quản lý)
const express = require('express');
const router = express.Router();
const lichSuCuTruController = require('../controllers/lichSuCuTruController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Cần phải import protect, authorize

// --- CÁC ROUTES CRUD CƠ BẢN (Giữ nguyên) ---
router.get('/', lichSuCuTruController.getAllLichSuCuTru);
router.get('/:id', lichSuCuTruController.getLichSuCuTruById);

// Thao tác CRUD cơ bản có thể chỉ dành cho Quản lý
router.use(authorize('Quản lý', 'Nhân viên')); 
router.post('/', lichSuCuTruController.createLichSuCuTru);
router.put('/:id', lichSuCuTruController.updateLichSuCuTru);
router.delete('/:id', lichSuCuTruController.deleteLichSuCuTru);
router.put('/end/:id', lichSuCuTruController.endResidency);


// ⭐ ROUTE THÊM THÀNH VIÊN MỚI (CÓ KIỂM TRA GIỚI HẠN) ⭐
router.post(
    '/add-member', 
    protect, 
    authorize('Quản lý', 'Nhân viên'), 
    lichSuCuTruController.addResidentMember
);

module.exports = router;