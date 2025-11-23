// routes/block.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/blockController');

// GET /api/block (Danh sách)
router.get('/', controller.getAllBlocks);

// GET /api/block/:id (Chi tiết Nested)
router.get('/:id', controller.getBlockById);

// POST /api/block (Tạo đơn - Cũ)
router.post('/', controller.createBlock);

// POST /api/block/setup (Tạo nâng cao - Mới)
router.post('/setup', controller.setupBlock);

// PUT & DELETE
router.put('/:id', controller.updateBlock);
router.delete('/:id', controller.deleteBlock);

module.exports = router;