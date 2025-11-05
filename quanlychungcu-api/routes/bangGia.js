// routes/bangGia.js
const express = require('express');
const router = express.Router();
const bangGiaController = require('../controllers/bangGiaController');

router.get('/', bangGiaController.getAllBangGia);
router.get('/:id', bangGiaController.getBangGiaById);
router.post('/', bangGiaController.createBangGia);
router.put('/:id', bangGiaController.updateBangGia);
router.delete('/:id', bangGiaController.deleteBangGia);

module.exports = router;