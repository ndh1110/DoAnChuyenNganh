// routes/canHo.js
const express = require('express');
const router = express.Router();
const canHoController = require('../controllers/canHoController');

router.get('/', canHoController.getAllCanHo);
router.get('/:id', canHoController.getCanHoById);
router.post('/', canHoController.createCanHo);
router.put('/:id', canHoController.updateCanHo);
router.delete('/:id', canHoController.deleteCanHo);

module.exports = router;