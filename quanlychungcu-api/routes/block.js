// routes/block.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/blockController');

router.get('/', controller.getAllBlocks);
router.get('/:id', controller.getBlockById);
router.post('/', controller.createBlock);
router.put('/:id', controller.updateBlock);
router.delete('/:id', controller.deleteBlock);

module.exports = router;