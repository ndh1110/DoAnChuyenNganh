// routes/lichSuCuTru.js
const express = require('express');
const router = express.Router();
const lichSuCuTruController = require('../controllers/lichSuCuTruController');

router.get('/', lichSuCuTruController.getAllLichSuCuTru);
router.get('/:id', lichSuCuTruController.getLichSuCuTruById);
router.post('/', lichSuCuTruController.createLichSuCuTru);
router.put('/:id', lichSuCuTruController.updateLichSuCuTru);
router.delete('/:id', lichSuCuTruController.deleteLichSuCuTru);

module.exports = router;