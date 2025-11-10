// routes/canHo.js
const express = require('express');
const router = express.Router();
const canHoController = require('../controllers/canHoController');
const multer = require('multer');

// Cấu hình Multer để nhận file trong bộ nhớ (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// === CÁC ROUTE CRUD (ĐÃ CÓ) ===
router.get('/', canHoController.getAllCanHo);
router.get('/:id', canHoController.getCanHoById);
router.post('/', canHoController.createCanHo);
router.put('/:id', canHoController.updateCanHo);
router.delete('/:id', canHoController.deleteCanHo);

// === ROUTE MỚI CHO IMPORT EXCEL ===
// Nhận 1 file có tên là 'file'
router.post('/import-excel', upload.single('file'), canHoController.importFromExcel);

module.exports = router;