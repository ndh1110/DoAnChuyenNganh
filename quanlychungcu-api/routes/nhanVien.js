// routes/nhanVien.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/nhanVienController');

router.get('/', controller.getAllNhanVien);
router.get('/:id', controller.getNhanVienById);
router.post('/', controller.createNhanVien);
router.put('/:id', controller.updateNhanVien);
router.delete('/:id', controller.deleteNhanVien);

module.exports = router;