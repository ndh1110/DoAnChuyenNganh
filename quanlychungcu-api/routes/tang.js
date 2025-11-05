// routes/tang.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/tangController');

// GET /api/tang/
router.get('/', controller.getAllTangs);

// GET /api/tang/block/:id (Lấy các tầng của 1 Block)
router.get('/block/:id', controller.getTangsByBlockId);

// POST /api/tang/
router.post('/', controller.createTang);

// DELETE /api/tang/:id (Xóa 1 tầng)
router.delete('/:id', controller.deleteTang);

module.exports = router;