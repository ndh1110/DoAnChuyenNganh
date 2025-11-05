// routes/yeuCau.js
const express = require('express');
const router = express.Router();
const yeuCauController = require('../controllers/yeuCauController');

router.get('/', yeuCauController.getAllYeuCau);
router.get('/:id', yeuCauController.getYeuCauById);
router.post('/', yeuCauController.createYeuCau);
router.put('/:id', yeuCauController.updateYeuCau);
router.delete('/:id', yeuCauController.deleteYeuCau);

module.exports = router;