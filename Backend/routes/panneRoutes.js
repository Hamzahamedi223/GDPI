const express = require('express');
const router = express.Router();
const panneController = require('../Controllers/panneController');
const { protect, authorize } = require('../middleware/auth');

// Get all pannes (admin only)
router.get('/', protect, authorize('chef service', 'admin'), panneController.getAllPannes);

// Create a new panne
router.post('/', protect, authorize('chef service', 'admin'), panneController.createPanne);

// Get pannes for a specific department
router.get('/department/:department', protect, authorize('chef service', 'admin'), panneController.getDepartmentPannes);

// Check if a panne type is in use
router.get('/check-type/:typeId', protect, panneController.checkPanneTypeInUse);

// Individual panne routes
router.put('/:id', protect, authorize('chef service', 'admin'), panneController.updatePanne);
router.delete('/:id', protect, authorize('chef service', 'admin'), panneController.deletePanne);

module.exports = router; 