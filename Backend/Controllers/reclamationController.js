const Reclamation = require('../models/Reclamation');
const mongoose = require('mongoose');
const Signup = require('../models/Signup');
const Department = require('../models/Department');

// Get all reclamations (admin only)
exports.getAllReclamations = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role.name !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin only.',
        userRole: req.user.role.name 
      });
    }

    const reclamations = await Reclamation.find()
      .populate('createdBy', 'username')
      .populate('department', 'name')
      .sort({ createdAt: -1 });
      
    res.status(200).json(reclamations);
  } catch (error) {
    console.error('Error fetching all reclamations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réclamations', error: error.message });
  }
};

// Get all reclamations for a specific department
exports.getDepartmentReclamations = async (req, res) => {
  try {
    const { department } = req.params;
    
    // Find department by name
    const departmentDoc = await Department.findOne({ name: department });
    if (!departmentDoc) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if user belongs to the department
    if (!req.user.department || req.user.department.name !== department) {
      return res.status(403).json({ message: 'You can only view reclamations from your department' });
    }

    const reclamations = await Reclamation.find({ department: departmentDoc._id })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
      
    res.status(200).json(reclamations);
  } catch (error) {
    console.error('Error fetching reclamations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réclamations', error: error.message });
  }
};

// Create a new reclamation
exports.createReclamation = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const { department } = req.params;

    // Find department by name
    const departmentDoc = await Department.findOne({ name: department });
    if (!departmentDoc) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Check if user belongs to the department
    if (!req.user.department || req.user.department.name !== department) {
      return res.status(403).json({ message: 'You can only create reclamations for your department' });
    }

    const reclamation = new Reclamation({
      title,
      description,
      priority: priority || 'medium',
      department: departmentDoc._id,
      createdBy: req.user._id
    });

    await reclamation.save();
    
    const populatedReclamation = await Reclamation.findById(reclamation._id)
      .populate('createdBy', 'username')
      .populate('department', 'name');
      
    res.status(201).json(populatedReclamation);
  } catch (error) {
    console.error('Error creating reclamation:', error);
    res.status(400).json({ message: 'Erreur lors de la création de la réclamation', error: error.message });
  }
};

// Update a reclamation
exports.updateReclamation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid reclamation ID' });
    }

    // Find the reclamation first to check permissions
    const reclamation = await Reclamation.findById(id).populate('department');
    if (!reclamation) {
      return res.status(404).json({ message: 'Réclamation non trouvée' });
    }

    // If user is admin, they can update any reclamation
    if (req.user.role.name === 'admin') {
      const updatedReclamation = await Reclamation.findByIdAndUpdate(
        id,
        { title, description, status, priority },
        { new: true, runValidators: true }
      )
      .populate('createdBy', 'username')
      .populate('department', 'name');

      return res.status(200).json(updatedReclamation);
    }

    // For non-admin users, check if they belong to the department
    if (!req.user.department || req.user.department.name !== reclamation.department.name) {
      return res.status(403).json({ message: 'You can only update reclamations from your department' });
    }

    const updatedReclamation = await Reclamation.findByIdAndUpdate(
      id,
      { title, description, status, priority },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'username')
    .populate('department', 'name');

    res.status(200).json(updatedReclamation);
  } catch (error) {
    console.error('Error updating reclamation:', error);
    res.status(400).json({ message: 'Erreur lors de la mise à jour de la réclamation', error: error.message });
  }
};

// Delete a reclamation
exports.deleteReclamation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid reclamation ID' });
    }

    // Find the reclamation first to check permissions
    const reclamation = await Reclamation.findById(id).populate('department');
    if (!reclamation) {
      return res.status(404).json({ message: 'Réclamation non trouvée' });
    }

    // Check if user belongs to the department
    if (!req.user.department || req.user.department.name !== reclamation.department.name) {
      return res.status(403).json({ message: 'You can only delete reclamations from your department' });
    }

    await Reclamation.findByIdAndDelete(id);
    res.status(200).json({ message: 'Réclamation supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting reclamation:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la réclamation', error: error.message });
  }
}; 