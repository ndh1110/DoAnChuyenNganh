// routes/yeuCauLog.js
const express = require('express');
const router = express.Router();
const yeuCauLogController = require('../controllers/yeuCauLogController');

// POST /api/yeucaulog/ (Thêm log mới)
router.post('/', yeuCauLogController.addYeuCauLog);

// DELETE /api/yeucaulog/:id (Xóa 1 log)
router.delete('/:id', yeuCauLogController.deleteYeuCauLog);

module.exports = router;