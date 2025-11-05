// routes/thongBao.js
const express = require('express');
const router = express.Router();
const thongBaoController = require('../controllers/thongBaoController');

router.get('/', thongBaoController.getAllThongBao);
router.post('/', thongBaoController.createThongBao);
router.delete('/:id', thongBaoController.deleteThongBao);

module.exports = router;