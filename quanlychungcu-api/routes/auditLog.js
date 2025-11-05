// routes/auditLog.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/auditLogController');

// GET /api/auditlog/
router.get('/', controller.getAllAuditLogs);

// POST /api/auditlog/
router.post('/', controller.createAuditLog);

module.exports = router;