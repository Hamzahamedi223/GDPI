const InternalRepair = require('../models/InternalRepair');

// Get all internal repairs
exports.getAllInternalRepairs = async (req, res) => {
  try {
    const repairs = await InternalRepair.find()
      .populate('equipment', 'name serial_number')
      .populate('sparePart', 'name part_number');
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new internal repair
exports.createInternalRepair = async (req, res) => {
  const repair = new InternalRepair({
    equipment: req.body.equipment,
    sparePart: req.body.sparePart,
    description: req.body.description,
    repairDate: req.body.repairDate,
    status: req.body.status || 'pending'
  });

  try {
    const newRepair = await repair.save();
    
    // Populate the created repair with equipment and spare part details
    const populatedRepair = await InternalRepair.findById(newRepair._id)
      .populate('equipment', 'name serial_number')
      .populate('sparePart', 'name part_number');
      
    res.status(201).json(populatedRepair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update internal repair
exports.updateInternalRepair = async (req, res) => {
  try {
    const repair = await InternalRepair.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    // Populate the updated repair with equipment and spare part details
    const populatedRepair = await InternalRepair.findById(repair._id)
      .populate('equipment', 'name serial_number')
      .populate('sparePart', 'name part_number');

    res.json(populatedRepair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete internal repair
exports.deleteInternalRepair = async (req, res) => {
  try {
    const repair = await InternalRepair.findByIdAndDelete(req.params.id);
    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    res.json({ message: 'Repair deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 