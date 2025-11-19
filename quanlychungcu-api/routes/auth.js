// routes/auth.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', controller.registerUser);

// POST /api/auth/login
router.post('/login', controller.loginUser);

// =============================================
// ⭐ ROUTE MỚI: Quên mật khẩu
// =============================================
// POST /api/auth/forgot-password
router.post('/forgot-password', controller.forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', controller.resetPassword);

// POST /api/auth/social-login
router.post('/social-login', controller.socialLogin);

module.exports = router;