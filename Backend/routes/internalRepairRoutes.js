const express = require('express');
const router = express.Router();
const internalRepairController = require('../Controllers/internalRepairController');

router.get('/', internalRepairController.getAllInternalRepairs);

router.post('/', internalRepairController.createInternalRepair);

router.put('/:id', internalRepairController.updateInternalRepair);

router.delete('/:id', internalRepairController.deleteInternalRepair);

module.exports = router; 