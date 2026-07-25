const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/dashboardController');

// Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// Get recent activities
router.get('/activities', dashboardController.getActivities);

module.exports = router; 