// routes/nguoiDung.js
const express = require('express');
const router = express.Router();
const nguoiDungController = require('../controllers/nguoiDungController');

// Định nghĩa các route và gắn chúng với controller

// GET /api/nguoidung/
router.get('/', nguoiDungController.getAllNguoiDung);

// GET /api/nguoidung/:id
router.get('/:id', nguoiDungController.getNguoiDungById);

// POST /api/nguoidung/
router.post('/', nguoiDungController.createNguoiDung);

// PUT /api/nguoidung/:id
router.put('/:id', nguoiDungController.updateNguoiDung);

// DELETE /api/nguoidung/:id
router.delete('/:id', nguoiDungController.deleteNguoiDung);

module.exports = router;