const Besoin = require('../models/Besoin');
const mongoose = require('mongoose');
const Department = require('../models/Department');

// Get all besoins (admin only)
exports.getAllBesoins = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role.name !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin only.',
        userRole: req.user.role.name 
      });
    }

    const besoins = await Besoin.find()
      .populate('createdBy', 'username')
      .populate('department', 'name')
      .sort({ createdAt: -1 });
      
    res.status(200).json(besoins);
  } catch (error) {
    console.error('Error fetching all besoins:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des besoins', error: error.message });
  }
};

// Get all besoins for a specific department
exports.getDepartmentBesoins = async (req, res) => {
  try {
    const { department } = req.params;
    
    // Find department by name
    const departmentDoc = await Department.findOne({ name: department });
    if (!departmentDoc) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if user belongs to the department
    if (!req.user.department || req.user.department.name !== department) {
      return res.status(403).json({ message: 'You can only view besoins from your department' });
    }

    const besoins = await Besoin.find({ department: departmentDoc._id })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
      
    res.status(200).json(besoins);
  } catch (error) {
    console.error('Error fetching besoins:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des besoins', error: error.message });
  }
};

// Create a new besoin
exports.createBesoin = async (req, res) => {
  try {
    const { title, description, priority, quantity, estimatedCost } = req.body;
    const { department } = req.params;

    // Find department by name
    const departmentDoc = await Department.findOne({ name: department });
    if (!departmentDoc) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (!title || !description || !quantity || !estimatedCost) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user belongs to the department
    if (!req.user.department || req.user.department.name !== department) {
      return res.status(403).json({ message: 'You can only create besoins for your department' });
    }

    const besoin = new Besoin({
      title,
      description,
      priority: priority || 'medium',
      quantity,
      estimatedCost,
      department: departmentDoc._id,
      createdBy: req.user._id
    });

    await besoin.save();
    
    const populatedBesoin = await Besoin.findById(besoin._id)
      .populate('createdBy', 'username')
      .populate('department', 'name');
      
    res.status(201).json(populatedBesoin);
  } catch (error) {
    console.error('Error creating besoin:', error);
    res.status(400).json({ message: 'Erreur lors de la création du besoin', error: error.message });
  }
};

// Update a besoin
exports.updateBesoin = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, quantity, estimatedCost } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid besoin ID' });
    }

    // Find the besoin first to check permissions
    const besoin = await Besoin.findById(id).populate('department');
    if (!besoin) {
      return res.status(404).json({ message: 'Besoin non trouvé' });
    }

    // If user is admin, they can update any besoin
    if (req.user.role.name === 'admin') {
      const updatedBesoin = await Besoin.findByIdAndUpdate(
        id,
        { title, description, status, priority, quantity, estimatedCost },
        { new: true, runValidators: true }
      )
      .populate('createdBy', 'username')
      .populate('department', 'name');

      return res.status(200).json(updatedBesoin);
    }

    // For non-admin users, check if they belong to the department
    if (!req.user.department || req.user.department.name !== besoin.department.name) {
      return res.status(403).json({ message: 'You can only update besoins from your department' });
    }

    const updatedBesoin = await Besoin.findByIdAndUpdate(
      id,
      { title, description, status, priority, quantity, estimatedCost },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'username')
    .populate('department', 'name');

    res.status(200).json(updatedBesoin);
  } catch (error) {
    console.error('Error updating besoin:', error);
    res.status(400).json({ message: 'Erreur lors de la mise à jour du besoin', error: error.message });
  }
};

// Delete a besoin
exports.deleteBesoin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid besoin ID' });
    }

    // Find the besoin first to check permissions
    const besoin = await Besoin.findById(id).populate('department');
    if (!besoin) {
      return res.status(404).json({ message: 'Besoin non trouvé' });
    }

    // If user is admin, they can delete any besoin
    if (req.user.role.name === 'admin') {
      await Besoin.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Besoin supprimé avec succès' });
    }

    // For non-admin users, check if they belong to the department
    if (!req.user.department || req.user.department.name !== besoin.department.name) {
      return res.status(403).json({ message: 'You can only delete besoins from your department' });
    }

    await Besoin.findByIdAndDelete(id);
    res.status(200).json({ message: 'Besoin supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting besoin:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du besoin', error: error.message });
  }
}; 