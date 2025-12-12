// routes/canHo.js
const express = require('express');
const router = express.Router();
const canHoController = require('../controllers/canHoController');
const { protect, authorize } = require('../middleware/authMiddleware');
// 1. Import Multer và Path
const multer = require('multer');
const path = require('path');

// 2. Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Lưu vào thư mục 'uploads'
  },
  filename: function (req, file, cb) {
    // Đặt tên file để không bị trùng: timestamp-tengoc.jpg
    // Ví dụ: 171548999-canho1.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 3. Bộ lọc chỉ cho phép file ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh!'));
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
const uploadExcel = multer({ storage: multer.memoryStorage() }); // Giữ lại cái cũ cho Excel

// === CÁC ROUTES ===

// GET (Ai cũng xem được)
router.get('/', canHoController.getAllCanHo);
router.get('/:id', canHoController.getCanHoById);
router.put('/toggle-rent/:id', protect, canHoController.toggleRentStatus);
router.put('/listing/:id', protect, canHoController.updateListing);

router.get('/details/:id', protect, authorize('Quản lý', 'Admin', 'Nhân viên'), canHoController.getApartmentDetailsForStaff);

// POST/PUT/DELETE (Chỉ Quản lý)
router.use(authorize('Quản lý', 'Admin'));

// 4. Thêm 'upload.single' vào POST và PUT
// 'HinhAnh' là tên field mà Frontend phải gửi đúng
router.post('/', upload.single('HinhAnh'), canHoController.createCanHo);
router.put('/:id', upload.single('HinhAnh'), canHoController.updateCanHo);
router.delete('/:id', canHoController.deleteCanHo);

router.post('/import-excel', uploadExcel.single('file'), canHoController.importFromExcel);

module.exports = router;