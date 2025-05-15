const express = require('express');
const router = express.Router();
const besoinController = require('../Controllers/besoinController');
const { protect, authorize } = require('../middleware/auth');

// Get all besoins (admin only)
router.get('/', protect, authorize('admin'), besoinController.getAllBesoins);

// Department-specific routes
router.get('/department/:department', protect, authorize('chef department', 'admin'), besoinController.getDepartmentBesoins);
router.post('/department/:department', protect, authorize('chef department', 'admin'), besoinController.createBesoin);

// Individual besoin routes
router.put('/:id', protect, authorize('chef department', 'admin'), besoinController.updateBesoin);
router.delete('/:id', protect, authorize('chef department', 'admin'), besoinController.deleteBesoin);

module.exports = router; 