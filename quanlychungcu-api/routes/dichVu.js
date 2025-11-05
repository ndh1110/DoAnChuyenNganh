// routes/dichVu.js
const express = require('express');
const router = express.Router();
const dichVuController = require('../controllers/dichVuController');

router.get('/', dichVuController.getAllDichVu);
router.get('/:id', dichVuController.getDichVuById);
router.post('/', dichVuController.createDichVu);
router.put('/:id', dichVuController.updateDichVu);
router.delete('/:id', dichVuController.deleteDichVu);

module.exports = router;