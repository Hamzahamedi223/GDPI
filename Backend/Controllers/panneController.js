const Panne = require('../models/Panne');
const Department = require('../models/Department');
const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');

// Get all pannes (admin only)
exports.getAllPannes = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role.name !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin only.',
        userRole: req.user.role.name 
      });
    }

    const pannes = await Panne.find()
      .populate('equipment', 'name serial_number')
      .populate('department', 'name')
      .populate('type', 'name color')
      .populate('reportedBy', 'username')
      .populate('assignedTo', 'username')
      .sort({ createdAt: -1 });
      
    res.status(200).json(pannes);
  } catch (error) {
    console.error('Error fetching all pannes:', error);
    res.status(500).json({ message: 'Error fetching pannes', error: error.message });
  }
};

// Get pannes for a specific department
exports.getDepartmentPannes = async (req, res) => {
  try {
    const { department } = req.params;
    
    // Find department by name
    const departmentDoc = await Department.findOne({ name: department });
    if (!departmentDoc) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Remove department restriction - users can now view pannes from any department
    // if (!req.user.department || req.user.department.name !== department) {
    //   return res.status(403).json({ message: 'You can only view pannes from your department' });
    // }

    const pannes = await Panne.find({ department: departmentDoc._id })
      .populate('equipment', 'name serial_number')
      .populate('reportedBy', 'username')
      .populate('assignedTo', 'username')
      .sort({ createdAt: -1 });
      
    res.status(200).json(pannes);
  } catch (error) {
    console.error('Error fetching pannes:', error);
    res.status(500).json({ message: 'Error fetching pannes', error: error.message });
  }
};

// Create a new panne
exports.createPanne = async (req, res) => {
  try {
    const { equipment, description, type, priority } = req.body;

    // Log the incoming request data
    console.log('Received panne data:', req.body);

    // Validate required fields
    if (!equipment) {
      return res.status(400).json({ message: 'Equipment is required' });
    }
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!type) {
      return res.status(400).json({ message: 'Type is required' });
    }

    // Get department from equipment
    const equipmentDoc = await Equipment.findById(equipment).populate('department');
    if (!equipmentDoc) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (!equipmentDoc.department) {
      return res.status(400).json({ message: 'Equipment must be assigned to a department' });
    }

    // Remove department restriction - users can now create pannes for any equipment
    // if (!req.user.department || req.user.department._id.toString() !== equipmentDoc.department._id.toString()) {
    //   return res.status(403).json({ message: 'You can only create pannes for equipment in your department' });
    // }

    const panne = new Panne({
      equipment,
      type,
      description,
      priority: priority || 'medium',
      department: equipmentDoc.department._id,
      reportedBy: req.user._id
    });

    await panne.save();
    
    const populatedPanne = await Panne.findById(panne._id)
      .populate('equipment', 'name serial_number')
      .populate('department', 'name')
      .populate('type', 'name color')
      .populate('reportedBy', 'username')
      .populate('assignedTo', 'username');
      
    res.status(201).json(populatedPanne);
  } catch (error) {
    console.error('Error creating panne:', error);
    res.status(400).json({ 
      message: 'Error creating panne', 
      error: error.message,
      details: error.stack 
    });
  }
};

// Update a panne
exports.updatePanne = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, resolution, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid panne ID' });
    }

    // Find the panne first to check permissions
    const panne = await Panne.findById(id).populate('department');
    if (!panne) {
      return res.status(404).json({ message: 'Panne not found' });
    }

    // Prepare update data
    const updateData = {
      status,
      resolution,
      ...(status === 'resolved' && { resolutionDate: new Date() })
    };

    // Only include assignedTo if it's a valid ObjectId
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      updateData.assignedTo = assignedTo;
    } else if (assignedTo === '') {
      // If assignedTo is an empty string, set it to null
      updateData.assignedTo = null;
    }

    // Include type if it's a valid ObjectId
    if (type && mongoose.Types.ObjectId.isValid(type)) {
      updateData.type = type;
    }

    // If user is admin, they can update any panne
    if (req.user.role.name === 'admin') {
      const updatedPanne = await Panne.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate('equipment', 'name serial_number')
      .populate('department', 'name')
      .populate('type', 'name color')
      .populate('reportedBy', 'username')
      .populate('assignedTo', 'username');

      return res.status(200).json(updatedPanne);
    }

    // Remove department restriction - users can now update pannes from any department
    // if (!req.user.department || req.user.department.name !== panne.department.name) {
    //   return res.status(403).json({ message: 'You can only update pannes from your department' });
    // }

    const updatedPanne = await Panne.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('equipment', 'name serial_number')
    .populate('department', 'name')
    .populate('type', 'name color')
    .populate('reportedBy', 'username')
    .populate('assignedTo', 'username');

    res.status(200).json(updatedPanne);
  } catch (error) {
    console.error('Error updating panne:', error);
    res.status(400).json({ message: 'Error updating panne', error: error.message });
  }
};

// Delete a panne
exports.deletePanne = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid panne ID' });
    }

    // Find the panne first to check permissions
    const panne = await Panne.findById(id).populate('department');
    if (!panne) {
      return res.status(404).json({ message: 'Panne not found' });
    }

    // If user is admin, they can delete any panne
    if (req.user.role.name === 'admin') {
      await Panne.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Panne deleted successfully' });
    }

    // Remove department restriction - users can now delete pannes from any department
    // if (!req.user.department || req.user.department.name !== panne.department.name) {
    //   return res.status(403).json({ message: 'You can only delete pannes from your department' });
    // }

    await Panne.findByIdAndDelete(id);
    res.status(200).json({ message: 'Panne deleted successfully' });
  } catch (error) {
    console.error('Error deleting panne:', error);
    res.status(500).json({ message: 'Error deleting panne', error: error.message });
  }
};

// Check if a panne type is in use
exports.checkPanneTypeInUse = async (req, res) => {
  try {
    const { typeId } = req.params;
    
    // Find any pannes using this type
    const panneUsingType = await Panne.findOne({ type: typeId });
    
    res.status(200).json({
      inUse: !!panneUsingType
    });
  } catch (error) {
    console.error('Error checking panne type usage:', error);
    res.status(500).json({ 
      message: 'Error checking panne type usage', 
      error: error.message 
    });
  }
}; 