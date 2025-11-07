// routes/billing.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/importController');

// Khởi tạo Multer để lưu file trong bộ nhớ (buffer)
const upload = multer({ storage: multer.memoryStorage() }); 

// POST /api/billing/import-excel
router.post('/import-excel', upload.single('excelFile'), controller.importInvoicesFromExcel);

module.exports = router;