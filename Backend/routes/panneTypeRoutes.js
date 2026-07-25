const express = require('express');
const router = express.Router();
const panneTypeController = require('../Controllers/panneTypeController');
const { protect, authorize } = require('../middleware/auth');

// Get all panne types
router.get('/', protect, panneTypeController.getAllPanneTypes);

// Create a new panne type (admin only)
router.post('/', protect, authorize('admin'), panneTypeController.createPanneType);

// Update a panne type (admin only)
router.put('/:id', protect, authorize('admin'), panneTypeController.updatePanneType);

// Delete a panne type (admin only)
router.delete('/:id', protect, authorize('admin'), panneTypeController.deletePanneType);

module.exports = router; 