// routes/chiSoDichVu.js
const express = require('express');
const router = express.Router();
const chiSoDichVuController = require('../controllers/chiSoDichVuController');

router.get('/', chiSoDichVuController.getAllChiSoDichVu);
router.get('/:id', chiSoDichVuController.getChiSoDichVuById);
router.post('/', chiSoDichVuController.createChiSoDichVu);
router.put('/:id', chiSoDichVuController.updateChiSoDichVu);
router.delete('/:id', chiSoDichVuController.deleteChiSoDichVu);

module.exports = router;