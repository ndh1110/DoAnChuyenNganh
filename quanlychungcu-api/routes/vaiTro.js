// routes/vaiTro.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/vaiTroController');

// GET /api/vaitro/
router.get('/', controller.getAllRoles);

module.exports = router;