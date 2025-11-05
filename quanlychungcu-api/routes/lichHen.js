// routes/lichHen.js
const express = require('express');
const router = express.Router();
const lichHenController = require('../controllers/lichHenController');

// POST /api/lichhen/ (Tạo lịch hẹn mới)
router.post('/', lichHenController.createLichHen);

// PUT /api/lichhen/:id (Cập nhật trạng thái)
router.put('/:id', lichHenController.updateLichHenStatus);

// DELETE /api/lichhen/:id (Xóa/hủy lịch hẹn)
router.delete('/:id', lichHenController.deleteLichHen);

module.exports = router;