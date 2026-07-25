const express = require('express');
const router = express.Router();
const sparePartsController = require('../Controllers/sparePartsController');

router.get('/', sparePartsController.getSpareParts);
router.post('/', sparePartsController.createSparePart);
router.put('/:id', sparePartsController.updateSparePart);
router.delete('/:id', sparePartsController.deleteSparePart);

module.exports = router;