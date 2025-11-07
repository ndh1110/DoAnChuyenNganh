// routes/block.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/blockController');

router.get('/', controller.getAllBlocks);
router.get('/:id', controller.getBlockById);
router.post('/', controller.createBlock);
router.put('/:id', controller.updateBlock);
router.delete('/:id', controller.deleteBlock);

// === ROUTE MỚI ===
// Route này phải đặt TRƯỚC route '/:id' nếu bạn đặt tên là '/setup'
// Nếu đặt sau, 'setup' sẽ bị nhầm là 'id'
router.post('/setup', controller.setupBlockWithApartments);

module.exports = router;