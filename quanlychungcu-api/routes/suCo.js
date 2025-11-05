// routes/suCo.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/suCoController');

router.get('/', controller.getAllSuCo);
router.get('/:id', controller.getSuCoById);
router.post('/', controller.createSuCo);
router.put('/:id', controller.updateSuCo);
router.delete('/:id', controller.deleteSuCo);

module.exports = router;