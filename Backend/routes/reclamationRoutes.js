const express = require('express');
const router = express.Router();
const reclamationController = require('../Controllers/reclamationController');
const { protect, authorize } = require('../middleware/auth');

// Get all reclamations (admin only)
router.get('/', protect, authorize('admin'), reclamationController.getAllReclamations);

// Department-specific routes
router.get('/department/:department', protect, authorize('chef service', 'user', 'admin'), reclamationController.getDepartmentReclamations);
router.post('/department/:department', protect, authorize('chef service', 'user', 'admin'), reclamationController.createReclamation);

// Individual reclamation routes
router.put('/:id', protect, authorize('chef service', 'user', 'admin'), reclamationController.updateReclamation);
router.delete('/:id', protect, authorize('chef service', 'user', 'admin'), reclamationController.deleteReclamation);

module.exports = router; 