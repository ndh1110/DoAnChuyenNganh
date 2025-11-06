// routes/trangThai.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/trangThaiController');

// GET /api/trangthai/context/:context
router.get('/context/:context', controller.getTrangThaiByContext);

module.exports = router;