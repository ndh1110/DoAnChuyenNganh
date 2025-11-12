// routes/userRole.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/userRoleController');

// GET /api/user-roles/
router.get('/', controller.getAllUsersWithRoles);

// POST /api/user-roles/:id/sync
router.post('/:id/sync', controller.syncUserRoles);

module.exports = router;