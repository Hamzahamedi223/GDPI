const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const Department = require('../models/Department');
const chatController = require('../Controllers/chatController');
const { protect } = require('../middleware/auth');

// Helper function to analyze department equipment
async function analyzeDepartmentEquipment() {
  const departments = await Department.find();
  const departmentStats = await Promise.all(
    departments.map(async (dept) => {
      const equipmentCount = await Equipment.countDocuments({ department: dept._id });
      return {
        name: dept.name,
        count: equipmentCount
      };
    })
  );
  return departmentStats;
}

// Handle chat queries
router.post('/query', protect, chatController.handleQuery);

module.exports = router; 