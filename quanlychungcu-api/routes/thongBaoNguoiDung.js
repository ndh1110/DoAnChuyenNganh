// routes/thongBaoNguoiDung.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/thongBaoNguoiDungController');

// GET /api/thongbaonguoidung/user/:id (Lấy TB của người dùng :id)
router.get('/user/:id', controller.getThongBaoByUserId);

// POST /api/thongbaonguoidung/send (Gửi 1 TB)
router.post('/send', controller.sendThongBaoToUser);

// PUT /api/thongbaonguoidung/read/:id (Đánh dấu đã đọc TB_ND :id)
router.put('/read/:id', controller.markAsRead);

module.exports = router;