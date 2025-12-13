// routes/aiChatRoutes.js
const express = require('express');
const router = express.Router();
const aiChatController = require('../controllers/aiChatController');

// Route POST chính để giao tiếp với Chatbot
router.post('/ask', aiChatController.askAIChatbot);

module.exports = router;