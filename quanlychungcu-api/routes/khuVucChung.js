// routes/khuVucChung.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/khuVucChungController');

router.get('/', controller.getAllKhuVucChung);
router.get('/:id', controller.getKhuVucChungById);
router.post('/', controller.createKhuVucChung);
router.put('/:id', controller.updateKhuVucChung);
router.delete('/:id', controller.deleteKhuVucChung);

module.exports = router;