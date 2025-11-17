// routes/myRoutes.js
const express = require('express');
const router = express.Router();

// 1. Import hàm controller (dùng require)
// (Giả sử file hoaDonController.js nằm ở ../controllers/hoaDonController.js)
const { getMyHoaDon } = require('../controllers/hoaDonController'); 

// 2. Import middleware (dùng require)
// (Kiểm tra lại đường dẫn file authMiddleware.js của bạn)
const { protect } = require('../middleware/authMiddleware');

// 3. Định nghĩa route
// Khi server.js dùng '/api/my', route này sẽ khớp với 'GET /api/my/hoadon'
router.get('/hoadon', protect, getMyHoaDon);

// (Trong tương lai, bạn có thể thêm các route cá nhân khác vào đây)
// router.get('/yeucau', protect, getMyYeuCau);
// router.get('/hopdong', protect, getMyHopDong);

// 4. Export (dùng module.exports)
module.exports = router;