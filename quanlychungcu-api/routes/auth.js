// routes/auth.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', controller.registerUser);

// POST /api/auth/login
router.post('/login', controller.loginUser);

module.exports = router;