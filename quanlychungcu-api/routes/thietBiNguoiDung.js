// routes/thietBiNguoiDung.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/thietBiNguoiDungController');

// GET /api/thietbi/user/:id (Lấy các thiết bị của người dùng :id)
router.get('/user/:id', controller.getThietBiByUserId);

// POST /api/thietbi/ (Đăng ký thiết bị)
router.post('/', controller.registerThietBi);

// DELETE /api/thietbi/ (Xóa thiết bị - dùng DELETE nhưng lấy token từ Body)
router.delete('/', controller.deleteThietBiByToken);

module.exports = router;